'use strict';
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';
import './style.css';

export default function ChatFeed(props) {
  const chat = useRef(null);

  const scrollToBottom = () => {
    if (chat !== undefined) {
      const scrollHeight = chat.current.scrollHeight;
      const height = chat.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      chat.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  };

  const renderGroup = (messages, index, id) => {
    let group = [];

    for (let i = index; messages[i] ? messages[i].id == id : false; i--) {
      group.push(messages[i]);
    }

    var message_nodes = group.reverse().map((curr, index) => {
      return <ChatBubble key={Math.random().toString(36)} message={curr} />;
    });
    return (
      <div key={Math.random().toString(36)} className="chatbubble-wrapper">
        {message_nodes}
      </div>
    );
  };

  const renderMessages = (messages) => {
    var message_nodes = messages.map((curr, index) => {
      if (
        (messages[index + 1] ? false : true) ||
        messages[index + 1].id != curr.id
      ) {
        return renderGroup(messages, index, curr.id);
      }
    });
    return message_nodes;
  };

  useEffect(() => {
    window.setTimeout(() => {
      scrollToBottom();
    }, 10);
  });

  return (
    <div id="chat-panel" className="chat-panel">
      <div className="title-panel">
        <span className="title-chat">Chat</span>
      </div>

      <div ref={chat} className="chat-history">
        <div>{renderMessages(props.messages)}</div>
      </div>
      <ChatInput onSendMessage={props.onSendMessage} />
    </div>
  );
}

ChatFeed.propTypes = {
  isTyping: PropTypes.bool,
  messages: PropTypes.array.isRequired,
  onSendMessage: PropTypes.func.isRequired,
};
