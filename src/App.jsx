import React from "react";
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

class App extends React.Component {
  constructor() {
    super();
    this.state = {
      login: false,
      loading: false,
      localAudioEnabled: true,
      localVideoEnabled: true,
      screenSharingEnabled: false,
      collapsed: true,
      isFullScreen: false,
      vidFit: false,
      loginInfo: {},
      messages: [],
      uid:'',
      peers:[],
    };

    this._settings = {
      selectedAudioDevice: "",
      selectedVideoDevice: "",
      resolution: "vga",
      bandwidth: 512,
      codec: "vp8",
      isDevMode:false,
    }

    let settings = reactLocalStorage.getObject("settings");
    if ( settings.codec !== undefined ){
        this._settings = settings;
    }

  }

  _cleanUp = async () => {
    await this.conference.cleanUp();
    //await this.client.leave();
  };

  _notification = (message, description) => {
    notification.info({
      message: message,
      description: description,
      placement: 'bottomRight',
    });
  };

  _handleJoin = async (values) => {
    this.setState({ loading: true });

    let url = window.location.protocol + "//" + window.location.hostname+":"+ window.location.port;
    console.log("Connect url:" + url);
    let connector = new IonConnector(url);
    this.connector = connector;
      let uid = uuidv4();
  
      connector.onjoin = (success, reason) => {
        console.log("onjoin: ", success, ", ", reason);
        this._onJoin(values,uid);
      };
      connector.join(values.roomId, uid, {name: values.displayName});
      
    connector.onleave = (reason) => {
      console.log("onleave: ", reason);
    };

    connector.onpeerevent = (ev) => {
       console.log("onpeerevent: state = ", ev.state, ", peer = ", ev.peer.uid, ", name = ", ev.peer.info.name);
       
       if(ev.state == PeerState.JOIN){
        this._notification("Peer Join", "peer => " + ev.peer.info.name + ", join!");
        this._onSystemMessage(ev.peer.info.name + ", join!");
       }else if(ev.state == PeerState.LEAVE){
          this._notification("Peer Leave", "peer => " + ev.peer.info.name + ", leave!");
          this._onSystemMessage(ev.peer.info.name + ", leave!");
       }
      
      
       let peerInfo = {
         'uid':ev.peer.uid,
         'name':ev.peer.info.name,
         'state':ev.state,
        };
        let peers = this.state.peers;
        let find = false;
        peers.forEach((item) => {
          if(item.uid == ev.peer.uid){
            item = peerInfo;
            find = true;
          }
        });
        if(!find){
          peers.push(peerInfo);
        }
        this.setState({
          peers:peers,
        });
    };

    connector.onstreamevent = (ev) => {
       console.log("onstreamevent: state = ", ev.state, ", sid = ", ev.sid,", uid = ", ev.uid);
       let peers = this.state.peers;
       peers.forEach((item) => {
         if(item.uid == ev.uid){
          item['id'] = ev.streams[0].id;
          console.log('ev.streams[0].id:::' + ev.streams[0].id);
         }
       });
       this.setState({
        peers:peers,
      });
    };

    connector.onmessage = (msg) => {
      console.log("onmessage: from ", msg.from,", to ", msg.to, ", text = ", msg.data.text);
      let messages = this.state.messages;
      if(this.state.uid != msg.from){
        let uid = 1;
        messages.push(new Message({ id: uid, message: msg.data.text, senderName: msg.data.name }));
        this.setState({ messages });
      }
    }

    window.onunload = async () => {
      await this._cleanUp();
    };
  };

  _onJoin = async (values,uid) => {
    reactLocalStorage.remove("loginInfo");
    reactLocalStorage.setObject("loginInfo", values);
    this.setState({
      login: true,
      loading: false,
      uid:uid,
      loginInfo: values,
      localVideoEnabled: !values.audioOnly,
    });

    this.conference.handleLocalStream(true);

    this._notification(
      "Connected!",
      "Welcome to the ion room => " + values.roomId
    );
  }

  _handleLeave = async () => {
    let this2 = this;
    confirm({
      title: "Leave Now?",
      content: "Do you want to leave the room?",
      async onOk() {
        console.log("OK");
        await this2._cleanUp();
        this2.setState({ login: false });
      },
      onCancel() {
        console.log("Cancel");
      }
    });
  };

  _handleAudioTrackEnabled = enabled => {
    this.setState({
      localAudioEnabled: enabled
    });
    this.conference.muteMediaTrack("audio", enabled);
  };

  _handleVideoTrackEnabled = enabled => {
    this.setState({
      localVideoEnabled: enabled
    });
    this.conference.muteMediaTrack("video", enabled);
  };

  _handleScreenSharing = enabled => {
    this.setState({
      screenSharingEnabled: enabled
    });
    this.conference.handleScreenSharing(enabled);
  };

  _onRef = ref => {
    this.conference = ref;
  };

  _openOrCloseLeftContainer = collapsed => {
    this.setState({
      collapsed: collapsed
    });
  };

  _onVidFitClickHandler = () => {
    this.setState({
      vidFit: !this.state.vidFit
    });
  };

  _onFullScreenClickHandler = () => {
    let docElm = document.documentElement;

    if (this._fullscreenState()) {

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

      this.setState({ isFullScreen: false });

    } else {
      if (docElm.requestFullscreen) {
        docElm.requestFullscreen();
      }
      //FireFox
      else if (docElm.mozRequestFullScreen) {
        docElm.mozRequestFullScreen();
      }
      //Chrome等
      else if (docElm.webkitRequestFullScreen) {
        docElm.webkitRequestFullScreen();
      }
      //IE11
      else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }

      this.setState({ isFullScreen: true });
    }
  }

  _fullscreenState = () => {
    return document.fullscreen ||
      document.webkitIsFullScreen ||
      document.mozFullScreen ||
      false;
  }

  _onMediaSettingsChanged = (selectedAudioDevice, selectedVideoDevice, resolution, bandwidth, codec,isDevMode) => {
    this._settings = { selectedAudioDevice, selectedVideoDevice, resolution, bandwidth, codec,isDevMode }
    reactLocalStorage.setObject("settings", this._settings);
  }

  _onSendMessage = (msg) => {
    console.log('Send message:' + msg);

    var data =  {
      "uid":this.state.uid,
      "name":this.state.loginInfo.displayName,
      "text": msg,
    };
    this.connector.message(this.state.uid,'all',data);
    let messages = this.state.messages;
    let uid = 0;
    messages.push(new Message({ id: uid, message: msg, senderName: 'me' }));
    this.setState({ messages });
  }

  _onSystemMessage = (msg) => {
    let messages = this.state.messages;
    let uid = 2;
    messages.push(new Message({ id: uid, message: msg, senderName: 'System' }));
    this.setState({ messages });
  }

  _onScreenSharingClick = enabled => {
    this.setState({
        screenSharingEnabled: enabled
    });
  }

  render() {
    const {
      login,
      loading,
      localAudioEnabled,
      localVideoEnabled,
      screenSharingEnabled,
      collapsed,
      vidFit
    } = this.state;
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
                    this._handleAudioTrackEnabled(!localAudioEnabled)
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
                    this._handleVideoTrackEnabled(!localVideoEnabled)
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
                  onClick={this._handleLeave}
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
                  onClick={() => this._handleScreenSharing(!screenSharingEnabled)}
                >
                  <Icon
                    component={
                      screenSharingEnabled ? TelevisionOffIcon : TelevisionIcon
                    }
                    style={{ display: "flex", justifyContent: "center" }}
                  />
                </Button>
              </Tooltip>
              <ToolShare loginInfo={this.state.loginInfo} />
            </div>
          ) : (
              <div />
            )}
          <div className="app-header-right">
            <MediaSettings onMediaSettingsChanged={this._onMediaSettingsChanged} settings={this._settings} />
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
                collapsed={this.state.collapsed}>
                <div className="left-container">
                  <ChatFeed messages={this.state.messages} onSendMessage={this._onSendMessage}/>
                </div>
              </Sider>
              <Layout className="app-right-layout">
                <Content style={{ flex: 1 }}>
                  <Conference
                    uid={this.state.uid}
                    collapsed={this.state.collapsed}
                    connector={this.connector}
                    settings={this._settings}
                    peers={this.state.peers}
                    localAudioEnabled={localAudioEnabled}
                    localVideoEnabled={localVideoEnabled}
                    screenSharingClick={this._onScreenSharingClick}
                    vidFit={vidFit}
                    ref={ref => {
                      this.conference = ref;
                    }}
                  />
                </Content>
                <div className="app-collapsed-button">
                  <Tooltip title='Open/Close chat panel'>
                    <Button
                      icon={this.state.collapsed ? "right" : "left"}
                      size="large"
                      shape="circle"
                      ghost
                      onClick={() => this._openOrCloseLeftContainer(!collapsed)}
                    />
                  </Tooltip>
                </div>
                <div className="app-fullscreen-layout">
                <Tooltip title='Fit/Stretch Video'>
                  <Button
                    icon={this.state.vidFit ? "minus-square" : "plus-square"}
                    size="large"
                    shape="circle"
                    ghost
                    onClick={() => this._onVidFitClickHandler()}
                  />
                </Tooltip>
                  <Tooltip title='Fullscreen/Exit'>
                    <Button
                      icon={this.state.isFullScreen ? "fullscreen-exit" : "fullscreen"}
                      size="large"
                      shape="circle"
                      className="app-fullscreen-button"
                      ghost
                      onClick={() => this._onFullScreenClickHandler()}
                    />
                  </Tooltip>
                </div>

              </Layout>
            </Layout>
          ) : loading ? (
            <Spin size="large" tip="Connecting..." />
          ) : (
                <Card title="Join to Ion" className="app-login-card">
                  <LoginForm handleLogin={this._handleJoin} createClient={this._createClient} />
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
}

export default App;
