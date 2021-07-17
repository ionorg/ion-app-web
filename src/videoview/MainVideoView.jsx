import React from "react";
import { Avatar } from 'antd';

class MainVideoView extends React.Component {
  componentDidMount = () => {
    const { stream } = this.props;
    this.video.srcObject = stream;
  };

  componentWillUnmount = () => {
    this.video.srcObject = null;
  }

  render = () => {
    const { id, stream, vidFit, muted } = this.props;
    const fitClass = vidFit ? "fit-vid" : ""
    return (
      <div className="main-video-layout">
        <video
          ref={ref => {
            this.video = ref;
          }}
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
  };
}

export default MainVideoView;
