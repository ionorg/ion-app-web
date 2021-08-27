import React, { useEffect, useRef } from "react";
import { Avatar } from 'antd';

export default function MainVideoView(props) {

  const videoRef = useRef(null);

  useEffect(() => {
    videoRef.current.srcObject = props.stream;
    return () => {
      videoRef.current.srcObject = null;
    }
  }, [])

  const { id, stream, vidFit, muted } = props;
  const fitClass = vidFit ? "fit-vid" : ""

  return (
    <div className="main-video-layout">
      <video
        ref={videoRef}
        id={id}
        autoPlay
        playsInline
        muted={false}
        className={"main-video-size " + fitClass}
      />
      {
        muted ?
          <div className='main-video-avatar'>
            <Avatar size={156} icon="user" />
          </div>
          : ""
      }
      <div className="main-video-name">
        <a className="main-video-name-a">{stream.info.name}</a>
      </div>
    </div>
  );
}

