import React, { useState } from 'react';
import PropTypes from "prop-types";
import ReactDOM from 'react-dom';
import { Modal, Button, Tooltip, Input, Icon } from 'antd';
import DotsVerticalIcon from "mdi-react/DotsVerticalIcon";

export default function ToolShare(props) {

    const [visible, setVisible] = useState(false)

    const [url, setUrl] = useState('')

    const showModal = () => {

        setVisible(true);

        let loginInfo = props.loginInfo;
        let host = window.location.host;
        let url = window.location.protocol + "//" + host + "/?room=" + loginInfo.roomId;
        setUrl(url)
    }

    const handleOk = (e) => {
        setVisible(false)
    }

    const handleCancel = (e) => {
        setVisible(false)
    }

    const onFocus = (e) => {
        ReactDOM.findDOMNode(e.target).select();
    }

    return (
        <div className="app-header-tool-container">
            <Tooltip title='Shared conference'>
                <Button ghost size="large" type="link" onClick={showModal}>
                    <Icon
                        component={DotsVerticalIcon}
                        style={{ display: "flex", justifyContent: "center" }}
                    />
                </Button>
            </Tooltip>
            <Modal
                title='Shared conference'
                visible={visible}
                onOk={handleOk}
                onCancel={handleCancel}
                okText='Ok'
                cancelText='Cancel'>
                <div>
                    <div>
                        <span>Send link to your friends</span>
                        <Input onFocus={onFocus} readOnly={true} value={url} />
                    </div>
                </div>
            </Modal>
        </div>
    );
}

ToolShare.propTypes = {
    roomInfo: PropTypes.any,
}

