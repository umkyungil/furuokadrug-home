import React, { useState } from 'react';
import { Form, Input, Button, Alert } from 'antd';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { MAIL_SERVER } from '../../Config.js';
// CORS 대책
axios.defaults.withCredentials = true;

const { TextArea } = Input;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

const NoticeMailPage = (props) => { 
  const history = useHistory();

  // query string 취득  
  let to_email;
  if (props.match.params.toEmail) {
    to_email = props.match.params.toEmail;
  } else {
    to_email = "";
  }
  
  const [Subject, setSubject] = useState("");
  const [FromEmail, setFromEmail] = useState("info@furuokadrug.com");
  const [ToEmail, setToEmail] = useState(to_email);
  const [Message, setMessage] = useState("");
  const [ErrorAlert, setErrorAlert] = useState(false);
  const [SuccessAlert, setSuccessAlert] = useState(false);

  const body = {
    type: 'Notice',
    subject: Subject,
    from: FromEmail,
    to: ToEmail,
    message: Message
  }

  // 메일 송신
  const sendEmail = async (e) => { 
    e.preventDefault();
    try {
      const result = await axios.post(`${MAIL_SERVER}/notice`, body);
      if (result.data.success) {
        setSuccessAlert(true);
      } else {
        console.log("NoticeMailPage err");
        setErrorAlert(true);
      }
    } catch(err) {
      console.log("NoticeMailPage err: ", err);
      setErrorAlert(true);
    }
  }

  const subjectHandler = (event) => {
    setSubject(event.currentTarget.value)
  }
  const fromEmailHandler = (event) => {
    setFromEmail(event.currentTarget.value)
  }
  const toEmailHandler = (event) => {
    setToEmail(event.currentTarget.value)
  }
  const messageHandler = (event) => {
    setMessage(event.currentTarget.value)
  }
  // 경고메세지
	const errorHandleClose = () => {
    setErrorAlert(false);
    history.push("/");
  };
  // 성공메세지
	const successHandleClose = () => {
    setSuccessAlert(false);
    history.push("/");
  };
  // Landing pageへ戻る
  const listHandler = () => {
    history.push('/')
  }

  return (
    <div className="app">
      {/* Alert */}
      <div>
        {ErrorAlert ? (
          <Alert message="Failed to send notification mail" type="error" showIcon closable afterClose={errorHandleClose}/>
        ) : null}
      </div>
      <div style={{ minWidth: '650px' }}>
        {SuccessAlert ? (
          <Alert message='Notification email has been sent normally' type="success" showIcon closable afterClose={successHandleClose}/>
        ) : null}
      </div>
      <br />

      <h2>Notice Mail</h2><br />
      <Form style={{ minWidth: '375px' }} onSubmit={sendEmail} {...formItemLayout} >
        <Form.Item label="Subject" required>
          <Input name="subject" placeholder="Please enter your subject" type="text" value={Subject} onChange={subjectHandler} required/>
        </Form.Item>

        <Form.Item label="From Email">
        <Input name="from-email" placeholder="Please enter your from-email address" type="email" value={FromEmail} onChange={fromEmailHandler} required/>
        </Form.Item>
        <Form.Item label="To Email" required>
        <Input name="to-email" placeholder="Please enter your to-email address" type="email" value={ToEmail} onChange={toEmailHandler} required/>
        </Form.Item>

        <Form.Item label="Message" required>
          <TextArea maxLength={100} name="message" label="Message" style={{ height: 120, minWidth: '500px' }} value={Message} onChange={messageHandler} placeholder="Please enter your message" required/>
        </Form.Item>
        <Form.Item {...tailFormItemLayout}>
          <Button onClick={listHandler}>
            Product List
          </Button>&nbsp;&nbsp;&nbsp;
          <Button htmlType="submit" type="primary">
            Send
          </Button>
        </Form.Item>
      </Form>  
    </div>
  );
};

export default NoticeMailPage;