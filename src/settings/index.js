import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Select, Tooltip, Switch } from 'antd';
import SoundMeter from './soundmeter';
import PropTypes from 'prop-types';
import './style.css';

const Option = Select.Option;

const closeMediaStream = function (stream) {
  if (!stream) {
    return;
  }
  if (
    MediaStreamTrack &&
    MediaStreamTrack.prototype &&
    MediaStreamTrack.prototype.stop
  ) {
    var tracks, i, len;

    if (stream.getTracks) {
      tracks = stream.getTracks();
      for (i = 0, len = tracks.length; i < len; i += 1) {
        tracks[i].stop();
      }
    } else {
      tracks = stream.getAudioTracks();
      for (i = 0, len = tracks.length; i < len; i += 1) {
        tracks[i].stop();
      }

      tracks = stream.getVideoTracks();
      for (i = 0, len = tracks.length; i < len; i += 1) {
        tracks[i].stop();
      }
    }
    // Deprecated by the spec, but still in use.
  } else if (typeof stream.stop === 'function') {
    console.log('closeMediaStream() | calling stop() on the MediaStream');
    stream.stop();
  }
};

// Attach a media stream to an element.
const attachMediaStream = function (element, stream) {
  element.srcObject = stream;
};

export default function MediaSettings(props) {
  const previewVideoRef = useRef(null);

  const settings = props.settings;

  const [visible, setVisible] = useState(false);

  const [videoDevices, setVideoDevices] = useState([]);

  const [audioDevices, setAudioDevices] = useState([]);

  const [audioOutputDevices, setAudioOutputDevices] = useState([]);

  const [resolution, setResolution] = useState(settings.resolution);

  const [bandwidth, setBandwidth] = useState(settings.bandwidth);

  const [selectedAudioDevice, setSelectedAudioDevice] = useState(
    settings.selectedAudioDevice
  );

  const [selectedVideoDevice, setSelectedVideoDevice] = useState(
    settings.selectedVideoDevice
  );

  const [codec, setCodec] = useState(settings.codec);

  const [isDevMode, setIsDevMode] = useState(settings.isDevMode);

  const [audioLevel, setAudioLevel] = useState(0);

  useEffect(() => {
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      window.audioContext = new AudioContext();
    } catch (e) {
      console.log('Web Audio API not supported.');
    }
  }, []);

  const updateInputDevices = () => {
    return new Promise((pResolve, pReject) => {
      let videoDevices = [];
      let audioDevices = [];
      let audioOutputDevices = [];
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          for (let device of devices) {
            if (device.kind === 'videoinput') {
              videoDevices.push(device);
            } else if (device.kind === 'audioinput') {
              audioDevices.push(device);
            } else if (device.kind === 'audiooutput') {
              audioOutputDevices.push(device);
            }
          }
        })
        .then(() => {
          let data = { videoDevices, audioDevices, audioOutputDevices };
          pResolve(data);
        });
    });
  };

  useEffect(() => {
    updateInputDevices().then((data) => {
      if (selectedAudioDevice === '' && data.audioDevices.length > 0) {
        setSelectedAudioDevice(data.audioDevices[0].deviceId);
      }
      if (selectedVideoDevice === '' && data.videoDevices.length > 0) {
        setSelectedVideoDevice(data.videoDevices[0].deviceId);
      }

      setVideoDevices(data.videoDevices);
      setAudioDevices(data.audioDevices);
      setAudioOutputDevices(data.audioOutputDevices);

      audioDevices.map((device, index) => {
        if (selectedAudioDevice == device.deviceId) {
          console.log('Selected audioDevice::' + JSON.stringify(device));
        }
      });
      videoDevices.map((device, index) => {
        if (selectedVideoDevice == device.deviceId) {
          console.log('Selected videoDevice::' + JSON.stringify(device));
        }
      });
    });
  }, []);

  const soundMeterProcess = () => {
    var val = window.soundMeter.instant.toFixed(2) * 348 + 1;
    setAudioLevel(val);
    if (visible) {
      setTimeout(soundMeterProcess, 100);
    }
  };

  const startPreview = () => {
    if (window.stream) {
      closeMediaStream(window.stream);
    }
    let videoElement = previewVideoRef;
    let audioSource = selectedAudioDevice;
    let videoSource = selectedVideoDevice;
    let soundMeter = (window.soundMeter = new SoundMeter(window.audioContext));
    let constraints = {
      audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
      video: { deviceId: videoSource ? { exact: videoSource } : undefined },
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function (stream) {
        window.stream = stream;
        attachMediaStream(videoElement.current, stream);
        soundMeter.connectToSource(stream);
        setTimeout(soundMeterProcess, 100);
        // Refresh button list in case labels have become available
        return navigator.mediaDevices.enumerateDevices();
      })
      .then((devces) => {})
      .catch((erro) => {});
  };

  const stopPreview = () => {
    if (window.stream) {
      closeMediaStream(window.stream);
    }
  };

  const showModal = () => {
    setVisible(true);
    setTimeout(startPreview, 100);
  };

  const handleOk = (e) => {
    console.log(e);
    setVisible(false);
    stopPreview();
    if (props.onMediaSettingsChanged !== undefined) {
      props.onMediaSettingsChanged(
        selectedAudioDevice,
        selectedVideoDevice,
        resolution,
        bandwidth,
        codec,
        isDevMode
      );
    }
  };

  const handleCancel = (e) => {
    setVisible(false);
    stopPreview();
  };

  const handleAudioDeviceChange = (e) => {
    setSelectedAudioDevice(e);
    setTimeout(startPreview, 100);
  };

  const handleVideoDeviceChange = (e) => {
    setSelectedVideoDevice(e);
    setTimeout(startPreview, 100);
  };

  const handleResolutionChange = (e) => {
    setResolution(e);
  };

  const handleVideoCodeChange = (e) => {
    setCodec(e);
  };

  const handleBandWidthChange = (e) => {
    setBandwidth(e);
  };

  const handleDevChange = (checked) => {
    setIsDevMode(checked);
  };

  return (
    <div>
      {
        <Tooltip title="System setup">
          <Button shape="circle" icon="setting" ghost onClick={showModal} />
        </Tooltip>
      }
      <Modal
        title="Settings"
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="Ok"
        cancelText="Cancel"
      >
        <div className="settings-item">
          <span className="settings-item-left">DevMode</span>
          <div className="settings-item-right">
            <Switch checked={isDevMode} onChange={handleDevChange} />
          </div>
        </div>
        <div className="settings-item">
          <span className="settings-item-left">Micphone</span>
          <div className="settings-item-right">
            <Select
              value={selectedAudioDevice}
              style={{ width: 350 }}
              onChange={handleAudioDeviceChange}
            >
              {audioDevices.map((device, index) => {
                return (
                  <Option value={device.deviceId} key={device.deviceId}>
                    {device.label}
                  </Option>
                );
              })}
            </Select>
            <div
              style={{
                width: audioLevel + 'px',
                height: '10px',
                backgroundColor: '#8dc63f',
                marginTop: '20px',
              }}
            ></div>
          </div>
        </div>
        <div className="settings-item">
          <span className="settings-item-left">Camera</span>
          <div className="settings-item-right">
            <Select
              value={selectedVideoDevice}
              style={{ width: 350 }}
              onChange={handleVideoDeviceChange}
            >
              {videoDevices.map((device, index) => {
                return (
                  <Option value={device.deviceId} key={device.deviceId}>
                    {device.label}
                  </Option>
                );
              })}
            </Select>
            <div className="settings-video-container">
              <video
                id="previewVideo"
                ref={previewVideoRef}
                autoPlay
                playsInline
                muted={true}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              ></video>
            </div>
          </div>
        </div>
        <div className="settings-item">
          <span className="settings-item-left">Quality</span>
          <div className="settings-item-right">
            <Select
              style={{ width: 350 }}
              value={resolution}
              onChange={handleResolutionChange}
            >
              <Option value="qvga">QVGA(320x180)</Option>
              <Option value="vga">VGA(640x360)</Option>
              <Option value="shd">SHD(960x540)</Option>
              <Option value="hd">HD(1280x720)</Option>
            </Select>
          </div>
        </div>
        <div className="settings-item">
          <span className="settings-item-left">VideoCode</span>
          <div className="settings-item-right">
            <Select
              style={{ width: 350 }}
              value={codec}
              onChange={handleVideoCodeChange}
            >
              <Option value="h264">H264</Option>
              <Option value="vp8">VP8</Option>
              <Option value="vp9">VP9</Option>
            </Select>
          </div>
        </div>
        <div className="settings-item">
          <span className="settings-item-left">Bandwidth</span>
          <div className="settings-item-right">
            <Select
              style={{ width: 350 }}
              value={bandwidth}
              onChange={handleBandWidthChange}
            >
              <Option value="256">Low(256kbps)</Option>
              <Option value="512">Medium(512kbps)</Option>
              <Option value="1024">High(1Mbps)</Option>
              <Option value="4096">Lan(4Mbps)</Option>
            </Select>
          </div>
        </div>
      </Modal>
    </div>
  );
}

MediaSettings.propTypes = {
  onMediaSettingsChanged: PropTypes.func,
};
