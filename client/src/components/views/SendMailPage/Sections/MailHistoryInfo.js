import React from 'react';
import { Button, Descriptions } from 'antd';
import { useHistory } from 'react-router-dom';
import { useSelector } from "react-redux";

function MailHistoryInfo(props) {
  const history = useHistory();
  const user = useSelector(state => state.user)
  
  const listHandler = () => {
    history.push("/mail/list");
  }

  if (user.userData) {		
    return (
      <div>
        <Descriptions>
          <Descriptions.Item label="Type">{props.detail.type}</Descriptions.Item>
          <Descriptions.Item label="Mail ID">{props.detail._id}</Descriptions.Item>
          <Descriptions.Item label="From">{props.detail.from}</Descriptions.Item>
          <Descriptions.Item label="To">{props.detail.to}</Descriptions.Item>
          <Descriptions.Item label="Subject">{props.detail.subject}</Descriptions.Item>          
          <Descriptions.Item label="Date">{props.detail.createdAt}</Descriptions.Item>          
        </Descriptions>
        <Descriptions>
          <Descriptions.Item label="Message">{props.detail.message}</Descriptions.Item>
        </Descriptions>

        <br />
        <br />
        <br />
        <div style={{ display: 'flex', justifyContent: 'center' }} >
          <Button size="large" onClick={listHandler}>
            Mail History List
          </Button>
        </div>
      </div>
    )
  } else {
    return (
      <div>
        <Descriptions>
          <Descriptions.Item label="Type">{props.detail.type}</Descriptions.Item>
          <Descriptions.Item label="Mail ID">{props.detail._id}</Descriptions.Item>
          <Descriptions.Item label="From">{props.detail.from}</Descriptions.Item>
          <Descriptions.Item label="To">{props.detail.to}</Descriptions.Item>
          <Descriptions.Item label="Subject">{props.detail.subject}</Descriptions.Item>          
          <Descriptions.Item label="Date">{props.detail.createdAt}</Descriptions.Item>          
        </Descriptions>
        <Descriptions>
          <Descriptions.Item label="Message">{props.detail.message}</Descriptions.Item>
        </Descriptions>

        <br />
        <br />
        <br />
        <div style={{ display: 'flex', justifyContent: 'center' }} >
          <Button size="large" onClick={listHandler}>
            Mail History List
          </Button>
        </div>
      </div>
    )
  }
}

export default MailHistoryInfo