import React from "react";
import { Form, Icon, Input, Button, Checkbox, notification, Avatar, Badge, Tooltip } from "antd";
import { LocalStream } from 'ion-sdk-js';
import { reactLocalStorage } from "reactjs-localstorage";
import "../styles/css/login.scss";

import CheckIcon from "mdi-react/CheckIcon";
import ShuffleIcon from "mdi-react/ShuffleIcon";
import NetworkIcon from "mdi-react/NetworkIcon";
import ServerNetworkIcon from "mdi-react/ServerNetworkIcon";
import GoogleClassroomIcon from "mdi-react/GoogleClassroomIcon";
import ProgressClockIcon from "mdi-react/ProgressClockIcon";
import ProgressAlertIcon from "mdi-react/ProgressAlertIcon";
import ProgressCloseIcon from "mdi-react/ProgressCloseIcon";
import VideoCheckIcon from "mdi-react/VideoCheckIcon";
import UploadLockIcon from "mdi-react/UploadLockIcon";
import SwapVerticalIcon from "mdi-react/SwapVerticalIcon";
import DownloadLockIcon from "mdi-react/DownloadLockIcon";




const TEST_STEPS = {
  biz: { title: 'Biz Websocket', icon: <ServerNetworkIcon /> },
  lobby: { title: 'Joining Test Room', icon: <GoogleClassroomIcon /> },
  publish: { title: 'Publish', icon: <UploadLockIcon /> },
  subscribe: { title: 'Subscription', icon: <DownloadLockIcon /> },
};

const ICONS = {
  connected: CheckIcon,
  ok: CheckIcon,
  pending: ProgressClockIcon,
  warning: ProgressAlertIcon,
  "no candidates": ProgressAlertIcon,
  error: ProgressCloseIcon,
  joined: CheckIcon,
  published: CheckIcon,
  subscribed: CheckIcon,
};


const DEFAULT_STATE = {
  testing: null,
  success: null,
  steps: TEST_STEPS
};
const ConnectionStep = ({ step }) => {
  const color = (
    step.status === 'pending' ? null :
      step.status === 'warning' || step.status === 'no candidates' ? 'orange' :
        step.status === 'error' ? 'red' :
          'green');
  const Icon = ICONS[step.status];

  return <div className='test-connection-step'>
    <Badge count={Icon ? <Icon style={{ color }} /> : null}>
      <Tooltip title={<>
        {step.title}
        {step.status ? ": " + step.status : null}
        {step.info ? <div>{step.info}</div> : null}
      </>}
      >
        <Avatar shape="square" size="large" icon={step.icon} />
      </Tooltip>
    </Badge>
  </div>;
};

class LoginForm extends React.Component {
  state = DEFAULT_STATE;

  componentDidMount = () => {
    const { form } = this.props;
    console.log("window.location:" + window.location);
    console.log("url:" + window.location.protocol + window.location.host + "  " + window.location.pathname + window.location.query);

    console.log('Making test client');


    let params = this.getRequest();

    let roomId = 'room1';
    let displayName = 'Guest';
    let audioOnly = false;

    let localStorage = reactLocalStorage.getObject("loginInfo");

    if (localStorage) {
      roomId = localStorage.roomId;
      displayName = localStorage.displayName;
      audioOnly = localStorage.audioOnly;
      console.log('localStorage:' + roomId + ' ' + displayName);
    }

    if (params && params.hasOwnProperty('room')) {
      roomId = params.room;
    }

    form.setFieldsValue({
      'roomId': roomId,
      'displayName': displayName,
      'audioOnly': audioOnly,
    });

    setTimeout(this._testConnection, 750);
  };

  _notification = (message, description) => {
    notification.info({
      message: message,
      description: description,
      placement: "bottomRight"
    });
  };

  _testStep(step, status, info = null) {
    const prior = this.state.steps[step];
    this.setState({
      steps: {
        ...this.state.steps,
        [step]: { ...prior, status, info }
      }
    });
    console.log('Test Connection:', step, status, info);
  }

  _stopMediaStream = async (stream) => {
    let tracks = stream.getTracks();
    for (let i = 0, len = tracks.length; i < len; i++) {
      await tracks[i].stop();
    }
  };

  _testConnection = async () => {

    this._testStep('biz', 'pending');
    let client = this.props.createClient();
    let testUpdateLoop = null;


    window.onunload = async () => {
      if (testUpdateLoop)
        clearInterval(testUpdateLoop);
      if (this.stream) {
        await this._stopMediaStream(this.stream);
        await this.stream.unpublish();
      }
      await this.client.leave();

    };

    client.on("transport-open", async () => {
      this._testStep('biz', 'connected', client.url);
      this._testStep('lobby', 'pending');
      const rid = 'lobby-' + Math.floor(1000000 * Math.random());
      await this.client.join(rid, { name: 'lobby-user' });
      this._testStep('lobby', 'joined', 'room id='+rid);
      const localStream = await LocalStream.getUserMedia({
        codec: 'VP8',
        resolution: 'hd',
        bandwidth: 1024,
        audio: true,
        video: true,
      });

      this._testStep('publish', 'pending');

      const publish = await client.publish(localStream);

      let nominated = null;

      const testConnectionUpdateLoop = () => {
        updateConnectionStats();
        const subStatus = this.state.steps.subscribe.status;
        if (subStatus === 'pending' || subStatus === 'error') {
          trySubscribe();
        }
      };
      testUpdateLoop = setInterval(testConnectionUpdateLoop, 3000);
      setTimeout(testConnectionUpdateLoop, 150);

      const trySubscribe = async () => {
        const mid = client.local.mid;
        let tracks = {}

        try {
          for (let track of localStream.getTracks()) {
            console.log(track)
            tracks[`${mid} ${track.id}`] = {
              codec: track.codec,
              fmtp: "",
              id: track.id,
              pt: client.local.transport.rtp[0].payload,
              type: track.kind,
            };
          }
        } catch (e) { console.log("No tracks yet...")}

        if (!mid) return;
        client.knownStreams.set(mid, objToStrMap(tracks));


        console.log('Trying to subscribe to ...', mid);

        try {
          let stream = await client.subscribe(mid);
          this._testStep('subscribe', 'subscribed', 'mid: ' + mid);

        } catch (e) {
          console.log(e)
          this._testStep('subscribe', 'error');
        }

      };

      const updateConnectionStats = async () => {
        const report = await client.local.transport.pc.getStats();
        const stats = {};
        for (let [name, stat] of report) {
          stats[name] = stat;
          if (stat.nominated) {
            nominated = stat;
          }
        }

        if (nominated) {
          const latency = nominated.currentRoundTripTime;
          const availableBitrate = nominated.availableOutgoingBitrate;
          const info = `${localStream.getTracks().length} tracks, ${Math.floor(latency / 1000.0)}ms latency` + (
            availableBitrate ? `, ${Math.floor(availableBitrate / 1024)}kbps available` : "");
          this._testStep('publish', 'published', info);
        } else {
          this._testStep('publish', 'no candidates');
        }

      };

      this._testStep('subscribe', 'pending');

    });

    window.test_client = this.client = client;
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const handleLogin = this.props.handleLogin;
        handleLogin(values);
        console.log("Received values of form: ", values);
      }
    });
  };

  getRequest() {
    let url = location.search;
    let theRequest = new Object();
    if (url.indexOf("?") != -1) {
      let str = url.substr(1);
      let strs = str.split("&");
      for (let i = 0; i < strs.length; i++) {
        theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);
      }
    }
    return theRequest;
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    const steps = this.state.steps;

    return (
      <>
        <Form onSubmit={this.handleSubmit} className="login-form">
          <Form.Item>
            {getFieldDecorator("roomId", {
              rules: [{ required: true, message: "Please enter your room Id!" }]
            })(
              <Input
                prefix={<Icon type="team" className="login-input-icon" />}
                placeholder="Room Id"
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator("displayName", {
              rules: [{ required: true, message: "Please enter your Name!" }]
            })(
              <Input
                prefix={
                  <Icon type="contacts" className="login-input-icon" />
                }
                placeholder="Display Name"
              />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('audioOnly', {
              valuePropName: 'checked',
              initialValue: true,
            })(
              <Checkbox>
                Audio only
            </Checkbox>
            )}
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="login-join-button">
              Join
          </Button>
          </Form.Item>
        </Form>
        <center>
          <ConnectionStep step={steps.biz} />
          <ConnectionStep step={steps.lobby} />
          <ConnectionStep step={steps.publish} />
          <ConnectionStep step={steps.subscribe} />
        </center>
      </>
    );
  }
}

function objToStrMap(obj) {
  const strMap = new Map();
  for (const k of Object.keys(obj)) {
    strMap.set(k, obj[k]);
  }
  return strMap;
}

const WrappedLoginForm = Form.create({ name: "login" })(LoginForm);
export default WrappedLoginForm;
