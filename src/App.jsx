import React, { useEffect, useRef, useState,forwardRef } from "react";
import { Layout, Button, Modal, Icon, notification, Card, Spin, Tooltip } from "antd";
const { confirm } = Modal;
const { Header, Content, Footer, Sider } = Layout;
import { reactLocalStorage } from "reactjs-localstorage";
import MicrophoneIcon from "mdi-react/MicrophoneIcon";
import MicrophoneOffIcon from "mdi-react/MicrophoneOffIcon";
import HangupIcon from "mdi-react/PhoneHangupIcon";
import TelevisionIcon from "mdi-react/TelevisionIcon";
import TelevisionOffIcon from "mdi-react/TelevisionOffIcon";
import VideoIcon from "mdi-react/VideoIcon";
import VideocamOffIcon from "mdi-react/VideocamOffIcon";
import MediaSettings from './settings';
import ToolShare from './ToolShare';
import ChatFeed from './chat/index';
import Message from './chat/message';
import pionLogo from '../public/pion-logo.svg';
import "../styles/css/app.scss";

import LoginForm from "./LoginForm";
import Conference from "./Conference";
import { IonConnector, PeerState } from "ion-sdk-js/lib/ion";
import { v4 as uuidv4 } from 'uuid';

const ForwardRefConference = forwardRef(Conference);


function App(props) {

  const conference = useRef(null)

  const [login, setLogin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [localAudioEnabled, setLocalAudioEnabled] = useState(true)
  const [localVideoEnabled, setLocalVideoEnabled] = useState(true)
  const [screenSharingEnabled, setScreenSharingEnabled] = useState(false)
  const [collapsed, setCollapsed] = useState(true)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [vidFit, setVidFit] = useState(false)
  const [loginInfo, setLoginInfo] = useState({})
  const [messages, setMessages] = useState([])
  const [uid, setUid] = useState(uuidv4())
  const [peers, setPeers] = useState([])
  const [connector,setConnector] = useState(null)

  let settings = {
    selectedAudioDevice: "",
    selectedVideoDevice: "",
    resolution: "vga",
    bandwidth: 512,
    codec: "vp8",
    isDevMode: false,
  }

  useEffect(() => {
    let _settings = reactLocalStorage.getObject("settings");
    if (_settings.codec !== undefined) {
      settings = _settings;
    }
    return () => {
      cleanUp();
    }
  }, [])

  const cleanUp = async () => {
    await conference.current.cleanUp();
  };

  const notificationTip = (message, description) => {
    notification.info({
      message: message,
      description: description,
      placement: 'bottomRight',
    });
  };

  const handleJoin = async (values) => {
    setLoading(true)

    let url = window.location.protocol + "//" + window.location.hostname + ":" + window.location.port;
    console.log("Connect url:" + url);
    let connector = new IonConnector(url);
    setConnector(connector)

    connector.onjoin = (success, reason) => {
      console.log("onjoin: ", success, ", ", reason);
      onJoin(values, uid);
    };
    connector.join(values.roomId, uid, { name: values.displayName });

    connector.onleave = (reason) => {
      console.log("onleave: ", reason);
    };

    connector.onpeerevent = (ev) => {
      console.log("onpeerevent: state = ", ev.state, ", peer = ", ev.peer.uid, ", name = ", ev.peer.info.name);

      if (ev.state == PeerState.JOIN) {
        notificationTip("Peer Join", "peer => " + ev.peer.info.name + ", join!");
        onSystemMessage(ev.peer.info.name + ", join!");
      } else if (ev.state == PeerState.LEAVE) {
        notificationTip("Peer Leave", "peer => " + ev.peer.info.name + ", leave!");
        onSystemMessage(ev.peer.info.name + ", leave!");
      }


      let peerInfo = {
        'uid': ev.peer.uid,
        'name': ev.peer.info.name,
        'state': ev.state,
      };
      let _peers = peers;
      let find = false;
      _peers.forEach((item) => {
        if (item.uid == ev.peer.uid) {
          item = peerInfo;
          find = true;
        }
      });
      if (!find) {
        _peers.push(peerInfo);
      }
      setPeers([..._peers])
    };

    connector.onstreamevent = (ev) => {
      console.log("onstreamevent: state = ", ev.state, ", sid = ", ev.sid, ", uid = ", ev.uid);
      let _peers = peers;
      _peers.forEach((item) => {
        if (item.uid == ev.uid) {
          item['id'] = ev.streams[0].id;
          console.log('ev.streams[0].id:::' + ev.streams[0].id);
        }
      });
      setPeers([..._peers])
    };

    connector.onmessage = (msg) => {
      console.log("onmessage: from ", msg.from, ", to ", msg.to, ", text = ", msg.data.text);
      let _messages = messages;
      if (uid != msg.from) {
        let _uid = 1;
        _messages.push(new Message({ id: _uid, message: msg.data.text, senderName: msg.data.name }));
        setMessages([..._messages])
      }
      else if (uid == msg.from) {
        let _uid = 0;
        _messages.push(new Message({ id: _uid, message: msg.data.text, senderName: "me" }));
        setMessages([..._messages])
      }
    }

    window.onunload = async () => {
      await cleanUp();
    };
  };

  const onJoin = async (values, uid) => {
    reactLocalStorage.remove("loginInfo");
    reactLocalStorage.setObject("loginInfo", values);
   
    setLogin(true)
    setLoading(false)
    setUid(uid)
    setLoginInfo(values)
    setLocalVideoEnabled(!values.audioOnly)

    conference.current.handleLocalStream(true);

    notificationTip(
      "Connected!",
      "Welcome to the ion room => " + values.roomId
    );
  }

  const handleLeave = async () => {
    confirm({
      title: "Leave Now?",
      content: "Do you want to leave the room?",
      async onOk() {
        console.log("OK");
        await cleanUp();
        setLogin(false)
      },
      onCancel() {
        console.log("Cancel");
      }
    });
  };

  const handleAudioTrackEnabled = enabled => {
    setLocalAudioEnabled(enabled)
    conference.current.muteMediaTrack("audio", enabled);
  };

  const handleVideoTrackEnabled = enabled => {
    setLocalVideoEnabled(enabled)
    conference.current.muteMediaTrack("video", enabled);
  };

  const handleScreenSharing = enabled => {
    setScreenSharingEnabled(enabled)
    conference.current.handleScreenSharing(enabled);
  };

  const openOrCloseLeftContainer = collapsed => {
    setCollapsed(collapsed)
  };

  const onVidFitClickHandler = () => {
    setVidFit(!vidFit)
  };

  const onFullScreenClickHandler = () => {
    let docElm = document.documentElement;

    if (fullscreenState()) {

      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      }
      else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      }
      else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }

      setIsFullScreen(false)

    } else {
      if (docElm.requestFullscreen) {
        docElm.requestFullscreen();
      }
      //FireFox
      else if (docElm.mozRequestFullScreen) {
        docElm.mozRequestFullScreen();
      }
      //Chrome
      else if (docElm.webkitRequestFullScreen) {
        docElm.webkitRequestFullScreen();
      }
      //IE11
      else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
      setIsFullScreen(true)
    }
  }

  const fullscreenState = () => {
    return document.fullscreen ||
      document.webkitIsFullScreen ||
      document.mozFullScreen ||
      false;
  }

  const onMediaSettingsChanged = (selectedAudioDevice, selectedVideoDevice, resolution, bandwidth, codec, isDevMode) => {
    settings = { selectedAudioDevice, selectedVideoDevice, resolution, bandwidth, codec, isDevMode }
    reactLocalStorage.setObject("settings", this._settings);
  }

  const onSendMessage = (msg) => {
    console.log('Send message:' + msg);

    var data = {
      "uid": uid,
      "name": loginInfo.displayName,
      "text": msg,
    };
    connector.message(uid, 'all', data);
    let _messages = messages;
    let _uid = 0;
    _messages.push(new Message({ id: _uid, message: msg, senderName: 'me' }));
    setMessages([..._messages])
  }

  const onSystemMessage = (msg) => {
    let _messages = messages;
    let _uid = 2;
    _messages.push(new Message({ id: _uid, message: msg, senderName: 'System' }));
    setMessages([..._messages])
  }

  const onScreenSharingClick = enabled => {
    setScreenSharingEnabled(enabled)
  }

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div className="app-header-left">
          <a href="https://pion.ly" target="_blank">
            <img src={pionLogo} className="app-logo-img" />
          </a>
        </div>
        {login ? (
          <div className="app-header-tool">
            <Tooltip title='Mute/Cancel'>
              <Button
                ghost
                size="large"
                style={{ color: localAudioEnabled ? "" : "red" }}
                type="link"
                onClick={() =>
                  handleAudioTrackEnabled(!localAudioEnabled)
                }
              >
                <Icon
                  component={
                    localAudioEnabled ? MicrophoneIcon : MicrophoneOffIcon
                  }
                  style={{ display: "flex", justifyContent: "center" }}
                />
              </Button>
            </Tooltip>
            <Tooltip title='Open/Close video'>
              <Button
                ghost
                size="large"
                style={{ color: localVideoEnabled ? "" : "red" }}
                type="link"
                onClick={() =>
                  handleVideoTrackEnabled(!localVideoEnabled)
                }
              >
                <Icon
                  component={localVideoEnabled ? VideoIcon : VideocamOffIcon}
                  style={{ display: "flex", justifyContent: "center" }}
                />
              </Button>
            </Tooltip>
            <Tooltip title='Hangup'>
              <Button
                shape="circle"
                ghost
                size="large"
                type="danger"
                style={{ marginLeft: 16, marginRight: 16 }}
                onClick={handleLeave}
              >
                <Icon
                  component={HangupIcon}
                  style={{ display: "flex", justifyContent: "center" }}
                />
              </Button>
            </Tooltip>
            <Tooltip title='Share desktop'>
              <Button
                ghost
                size="large"
                type="link"
                style={{ color: screenSharingEnabled ? "red" : "" }}
                onClick={() => handleScreenSharing(!screenSharingEnabled)}
              >
                <Icon
                  component={
                    screenSharingEnabled ? TelevisionOffIcon : TelevisionIcon
                  }
                  style={{ display: "flex", justifyContent: "center" }}
                />
              </Button>
            </Tooltip>
            <ToolShare loginInfo={loginInfo} />
          </div>
        ) : (
          <div />
        )}
        <div className="app-header-right">
          <MediaSettings onMediaSettingsChanged={onMediaSettingsChanged} settings={settings} />
        </div>
      </Header>

      <Content className="app-center-layout">
        {login ? (
          <Layout className="app-content-layout">
            <Sider
              width={320}
              style={{ background: "#333" }}
              collapsedWidth={0}
              trigger={null}
              collapsible
              collapsed={collapsed}>
              <div className="left-container">
                <ChatFeed messages={messages} onSendMessage={onSendMessage} />
              </div>
            </Sider>
            <Layout className="app-right-layout">
              <Content style={{ flex: 1 }}>
                <ForwardRefConference
                  uid={uid}
                  collapsed={collapsed}
                  connector={connector}
                  settings={settings}
                  peers={peers}
                  localAudioEnabled={localAudioEnabled}
                  localVideoEnabled={localVideoEnabled}
                  screenSharingClick={onScreenSharingClick}
                  vidFit={vidFit}
                  ref={conference}
                />
              </Content>
              <div className="app-collapsed-button">
                <Tooltip title='Open/Close chat panel'>
                  <Button
                    icon={collapsed ? "right" : "left"}
                    size="large"
                    shape="circle"
                    ghost
                    onClick={() => openOrCloseLeftContainer(!collapsed)}
                  />
                </Tooltip>
              </div>
              <div className="app-fullscreen-layout">
                <Tooltip title='Fit/Stretch Video'>
                  <Button
                    icon={vidFit ? "minus-square" : "plus-square"}
                    size="large"
                    shape="circle"
                    ghost
                    onClick={() => onVidFitClickHandler()}
                  />
                </Tooltip>
                <Tooltip title='Fullscreen/Exit'>
                  <Button
                    icon={isFullScreen ? "fullscreen-exit" : "fullscreen"}
                    size="large"
                    shape="circle"
                    className="app-fullscreen-button"
                    ghost
                    onClick={() => onFullScreenClickHandler()}
                  />
                </Tooltip>
              </div>

            </Layout>
          </Layout>
        ) : loading ? (
          <Spin size="large" tip="Connecting..." />
        ) : (
          <Card title="Join to Ion" className="app-login-card">
            <LoginForm handleLogin={handleJoin}/>
          </Card>
        )}
      </Content>

      {!login && (
        <Footer className=".app-footer">
          Powered by{" "}
          <a href="https://pion.ly" target="_blank">
            Pion
          </a>{" "}
          WebRTC.
        </Footer>
      )}
    </Layout>
  );
}

export default App;
