import React from "react";
import { Spin, notification } from "antd";
import { LocalVideoView, MainVideoView, SmallVideoView } from "./videoview";
import "../styles/css/conference.scss";
import { LocalStream } from "ion-sdk-js/lib/ion";

class Conference extends React.Component {
  constructor() {
    super();
    this.state = {
      streams: [],
      localStream: null,
      localScreen: null,
      audioMuted: false,
      videoMuted: false
    };
  }

  componentDidMount = () => {
    const { connector } = this.props;
    this.handleLocalStream(true);

    let streams = this.state.streams;
    connector.ontrack = (track, stream) => {
      console.log("got track", track.id, "for stream", stream.id);
      if (track.kind === "video") {
        track.onunmute = () => {
          if (!streams[stream.id]) {
            stream.info = {'name':stream.id.substring(0,8)};
            streams.push({ mid: stream.mid, stream, sid: stream.mid });
            this.setState({ streams });

            stream.onremovetrack = () => {
              let streams = this.state.streams;
              streams = streams.filter(item => item.sid !== stream.mid);
              this.setState({ streams });
            };
          }
        };
      }
    };
  };

  cleanUp = async () => {
    let { localStream, localScreen, streams } = this.state;
    await this.setState({ localStream: null, localScreen: null, streams: [] });

    streams.map(async item => {
      await item.stream.unsubscribe();
    });

    await this._unpublish(localStream)
  };

  _notification = (message, description) => {
    notification.info({
      message: message,
      description: description,
      placement: "bottomRight"
    });
  };

  _unpublish = async stream => {
    if (stream) {
      await this._stopMediaStream(stream);
      await stream.unpublish();
    }
  };

  muteMediaTrack = (type, enabled) => {
    let { localStream } = this.state;
    if(!localStream) {
      return
    }
    if(enabled) {
      localStream.unmute(type)
    } else {
      localStream.mute(type)
    }

    if (type === "audio") {
      this.setState({ audioMuted: !enabled });
    } else if (type === "video") {
      this.setState({ videoMuted: !enabled });
    }
  };


  handleLocalStream = async (enabled) => {
    const {connector,settings} = this.props;
    let { localStream } = this.state;

    if (enabled) {
      LocalStream.getUserMedia({
        codec: settings.codec.toUpperCase(),
        resolution: settings.resolution,
        bandwidth: settings.bandwidth,
        audio: true,
        video: true,
      })
        .then((media) => {
          localStream = media;
          connector.sfu.publish(media);
          this.setState({ localStream });
        })
        .catch ((e) => {
            console.log("handleLocalStream error => " + e);
        });
    }else{
      if (localStream) {
        this._unpublish(localStream);
        localStream = null;
      }
    }

      this.muteMediaTrack("video", this.props.localVideoEnabled);
  };

  handleScreenSharing = async (enabled) => {
    let { localScreen } = this.state;
    const { connector, settings } = this.props;
    if (enabled) {
      localScreen = await LocalStream.getDisplayMedia({
        codec: settings.codec.toUpperCase(),
        resolution: settings.resolution,
        bandwidth: settings.bandwidth,
      });
      await connector.sfu.publish(localScreen);
      let track = localScreen.getVideoTracks()[0];
      if (track) {
        track.addEventListener("ended", () => {
          this.handleScreenSharing(false);
        });
      }
    } else {
      if (localScreen) {
        this._unpublish(localScreen);
        localScreen = null;
      }
    }
    this.setState({ localScreen });
  };

  _stopMediaStream = async (stream) => {
    let tracks = stream.getTracks();
    for (let i = 0, len = tracks.length; i < len; i++) {
      await tracks[i].stop();
    }
  };

  _onChangeVideoPosition = data => {
    let id = data.id;
    let index = data.index;
    console.log("_onChangeVideoPosition id:" + id + "  index:" + index);

    if (index == 0) {
      return;
    }

    const streams = this.state.streams;
    let first = 0;
    let big = 0;
    for (let i = 0; i < streams.length; i++) {
      let item = streams[i];
      if (item.mid == id) {
        big = i;
        break;
      }
    }

    let c = streams[first];
    streams[first] = streams[big];
    streams[big] = c;

    this.setState({ streams: streams });
  };

  render = () => {
    const { vidFit } = this.props;
    const {
      streams,
      localStream,
      localScreen,
      audioMuted,
      videoMuted
    } = this.state;
    const id = this.props.uid;
    return (
      <div className="conference-layout">
        {streams.length === 0 && (
          <div className="conference-layout-wating">
            <Spin size="large" tip="Wait for other people joining ..." />
          </div>
        )}
        {streams.map((item, index) => {
          return index == 0 ? (
            <MainVideoView key={item.mid} id={item.mid} stream={item.stream} vidFit={vidFit} />
          ) : (
            ""
          );
        })}
        {localStream && (
          <div className="conference-local-video-layout">
              <LocalVideoView
                id={id + "-video"}
                label="Local Stream"
                stream={localStream}
                audioMuted={audioMuted}
                videoMuted={videoMuted}
                videoType="localVideo"
              />
            </div>
        )}
        {localScreen && (
          <div className="conference-local-screen-layout">
              <LocalVideoView
                id={id + "-screen"}
                label="Screen Sharing"
                stream={localScreen}
                audioMuted={false}
                videoMuted={false}
                videoType="localScreen"
              />
          </div>
        )}
        <div className="small-video-list-div">
          <div className="small-video-list">
            {streams.map((item, index) => {
              return index > 0 ? (
                <SmallVideoView
                  key={item.mid}
                  id={item.mid}
                  stream={item.stream}
                  videoCount={streams.length}
                  collapsed={this.props.collapsed}
                  index={index}
                  onClick={this._onChangeVideoPosition}
                />
              ) : (
                <div />
              );
            })}
          </div>
        </div>
      </div>
    );
  };
}

export default Conference;
