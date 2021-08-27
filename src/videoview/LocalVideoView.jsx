import React, { useEffect, useRef,useState } from "react";
import MicrophoneOffIcon from "mdi-react/MicrophoneOffIcon";
import VideocamOffIcon from "mdi-react/VideocamOffIcon";
import { Avatar, Button } from 'antd';
import PictureInPictureBottomRightOutlineIcon from "mdi-react/PictureInPictureBottomRightOutlineIcon";

export default function LocalVideoView(props) {

  const videoRef = useRef(null)

  const [minimize, setMinimize] = useState(false);

  useEffect(() => {
    videoRef.current.srcObject = props.stream;
    return () => {
      videoRef.current.srcObject = null;
    }
  },[])

  const onMinimizeClick = () => {
    setMinimize(!minimize);
  }

  const { id, label, audioMuted, videoMuted, videoType } = props;

  let minIconStyle = 'local-video-icon-layout';
  if (videoType == 'localVideo') {
    minIconStyle = 'local-video-min-layout';
  }

  return (
    <div className="local-video-container" style={{ borderWidth: `${minimize ? '0px' : '0.5px'}` }}>
      <video
        ref={videoRef}
        id={id}
        autoPlay
        playsInline
        muted={true}
        className="local-video-size"
        style={{ display: `${minimize ? 'none' : ''}` }}
      />
      <div className={`${minimize ? minIconStyle : 'local-video-icon-layout'}`}>
        {!minimize && audioMuted && <MicrophoneOffIcon size={18} color="white" />}
        {!minimize && videoMuted && <VideocamOffIcon size={18} color="white" />}

        <Button
          ghost
          size="small"
          type="link"
          onClick={() => onMinimizeClick()}
        >
          <PictureInPictureBottomRightOutlineIcon
            size={18}
          />
        </Button>

      </div>
      {
        videoMuted ?
          <div className="local-video-avatar" style={{ display: `${minimize ? 'none' : ''}` }}>
            <Avatar size={64} icon="user" />
          </div>
          : ""
      }
      <a className="local-video-name" style={{ display: `${minimize ? 'none' : ''}` }}>{label}</a>
    </div>
  );
}
