import React, { Component } from 'react';
import { Icon } from 'antd';
import UserIcon from "mdi-react/UserIcon";

export default function ChatBubble(props) {

  const getMessage = () => {
    if (props.message.id == 1){
      return (
          <div className='bubble-left'>
            <div className='bubble-head'>
              <Icon component={UserIcon} />
            </div>
            <div className='bubble-msg'>
              <p className="sender-name">{props.message.senderName}</p>
              <div className='bubble-msgword'>
                <p className='pl'>
                  {props.message.message}
                </p>
              </div>
            </div>
          </div>
      )
    }
    //Self message
    else if(props.message.id == 0){
      return (
          <div className='bubble-right'>

            <div className='bubble-msg'>
                <p style={{textAlign:'right'}} className="sender-name">{props.message.senderName}</p>
                <div className='bubble-msgword'>
                  <p className='pr'>
                    {props.message.message}
                  </p>
                </div>
            </div>

            <div className='bubble-head'>
              <Icon component={UserIcon} />
            </div>

          </div>
      )
    }
    //System message
    else if(props.message.id == 2){
        return (
            <div className='bubble-middle'>
                <div className='bubble-msg'>
                    <div className='bubble-msgword-middle'>
                        <p className='pm'>
                            {props.message.message}
                        </p>
                    </div>
                </div>
            </div>
        )
    }
  }

  return(
    getMessage()
  )
}
