import React, { useState,Component } from "react";
import PropTypes from 'prop-types';
import { Input,Button } from 'antd';

export default function ChatInput(props) {

  const [inputMessage,setInputMessage] = useState("");

  const onInputChange = (event) => {
    setInputMessage(event.target.value);
  }

  const onBtnSendHandler = (event) => {
    sendMessage();
  }

  const onInputKeyUp = (event) => {
    if (event.keyCode == 13) {
      sendMessage();
    }
  }

  const sendMessage = () =>{
    let msg = inputMessage;

    if (msg.length === 0) {
      return;
    }
    if (msg.replace(/(^\s*)|(\s*$)/g, "").length === 0) {
      return;
    }
    props.onSendMessage(msg);
    setInputMessage("");
  }
  
  return (
        <div className='chat-input'>
          <Input
              placeholder='Please input message'
              onChange={onInputChange}
              onPressEnter={onInputKeyUp}
              value={inputMessage}/>
          <Button style={{marginLeft:'4px',}} icon='message' onClick={onBtnSendHandler}/>
        </div>
    );
}

ChatInput.propTypes = {
  onSendMessage: PropTypes.func.isRequired,
}
