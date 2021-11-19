import React, { useEffect } from "react";
import { Form, Icon, Input, Button, Checkbox, notification, Avatar, Badge, Tooltip } from "antd";
import { reactLocalStorage } from "reactjs-localstorage";
import "../styles/css/login.scss";


function LoginForm(props) {
  //state = DEFAULT_STATE;
  //testUpdateLoop = null;

  useEffect(() => {
    const { form } = props;
    console.log("url:" + window.location.protocol + window.location.host + "  " + window.location.pathname);

    let params = getRequest();

    let roomId = 'room1';
    let displayName = 'Guest';
    let audioOnly = false;

    let localStorage = reactLocalStorage.getObject("loginInfo");

    if (localStorage) {
      roomId = localStorage.roomId;
      displayName = localStorage.displayName;
      audioOnly = localStorage.audioOnly;
    }

    if (params && params.hasOwnProperty('room')) {
      roomId = params.room;
    }

    form.setFieldsValue({
      'roomId': roomId,
      'displayName': displayName,
      'audioOnly': audioOnly,
    });

    return () => {
      cleanup();
    }

  }, [])

  const notification = (message, description) => {
    notification.info({
      message: message,
      description: description,
      placement: "bottomRight"
    });
  }

  const stopMediaStream = async (stream) => {
    let tracks = stream.getTracks();
    for (let i = 0, len = tracks.length; i < len; i++) {
      await tracks[i].stop();
    }
  };

  const cleanup = async () => {
    
  };

  const handleSubmit = e => {
    e.preventDefault();
    props.form.validateFields((err, values) => {
      if (!err) {
        const handleLogin = props.handleLogin;
        handleLogin(values);
        console.log("Received values of form: ", values);
      }
    });
  }

  const getRequest = () => {
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

  const { getFieldDecorator } = props.form;
  // const steps = this.state.steps;

  return (
    <>
      <Form onSubmit={handleSubmit} className="login-form">
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
      {/* <center>
          {this.state.test ?
          <>
            <ConnectionStep step={steps.biz} />
            <ConnectionStep step={steps.lobby} />
            <ConnectionStep step={steps.publish} />
            <ConnectionStep step={steps.subscribe} />
          </>
          : <Button onClick={() => this._testConnection()}>Test Connection</Button>}
        </center> */}
    </>
  );
}

const WrappedLoginForm = Form.create({ name: "login" })(LoginForm);
export default WrappedLoginForm;
