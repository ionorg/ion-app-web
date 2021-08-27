import React, { useEffect, useRef } from "react";
import { Avatar } from 'antd';

export default function SmallVideoView(props) {

  const videoRef = useRef(null)

  useEffect(() => {
    videoRef.current.srcObject = props.stream;
    return () => {
      videoRef.current.srcObject = null;
    }
  }, [])

  const handleClick = () => {
    let { id, index } = props;
    props.onClick({ id, index });
  };

  const { id, stream, muted } = props;

  return (
    <div onClick={handleClick} className="small-video-div">
      <video
        ref={videoRef}
        id={id}
        autoPlay
        playsInline
        muted={false}
        className="small-video-size"
      />
      {
        muted ?
          <div className='small-video-avatar'>
            <Avatar size={40} icon="user" />
          </div>
          : ""
      }
      <div className="small-video-id-div">
        <a className="small-video-id-a">{stream.info.name}</a>
      </div>

    </div>
  );
}
