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

function ContactUsPage() {
  const [Name, setName] = useState("");
  const [Email, setEmail] = useState("");
  const [Message, setMessage] = useState("");
  const [ErrorAlert, setErrorAlert] = useState(false);
  const [SuccessAlert, setSuccessAlert] = useState(false);

  const history = useHistory(); 
  const body = {
    type: 'Inquiry',
    subject: 'Contact Us',
    name: Name,
    email: Email,
    message: Message
  }

  // 메일 송신
  const sendEmail = async (e) => { 
    e.preventDefault();
    try {
      const result = await axios.post(`${MAIL_SERVER}/inquiry`, body);

      if (result.data.success) {
        setSuccessAlert(true);
      } else {
        console.log("ContactUsPage err");
        setErrorAlert(true);
      }
    } catch(err) {
      console.log("ContactUsPage err: ", err);
      setErrorAlert(true);
    }
  }

  const nameHandler = (event) => {
    setName(event.currentTarget.value)
  }
  const emailHandler = (event) => {
    setEmail(event.currentTarget.value)
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
          <Alert message="The inquiry email was not sent. Please try again later" type="error" showIcon closable afterClose={errorHandleClose}/>
        ) : null}
      </div>
      <div style={{ minWidth: '650px' }}>
        {SuccessAlert ? (
          <Alert message='Your inquiry email has been received' type="success" showIcon closable afterClose={successHandleClose}/>
        ) : null}
      </div>
      <br />

      <h2>Contact Us</h2><br />
      <Form style={{ minWidth: '375px' }} onSubmit={sendEmail} {...formItemLayout} >
        <Form.Item label="Name" required>
          <Input name="name" placeholder="Please enter your name" type="text" value={Name} onChange={nameHandler} required/>
        </Form.Item>
        <Form.Item label="Email" required>
        <Input name="email" placeholder="Please enter your email address" type="email" value={Email} onChange={emailHandler} required/>
        </Form.Item>

        <Form.Item label="Inquiry details" required>
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
}

export default ContactUsPage
