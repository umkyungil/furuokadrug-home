import React, { useState } from 'react'
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { Form, Input, Button } from 'antd';
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

const SendMailPage = (props) => { 

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

  const body = {
    subject: Subject,
    from: FromEmail,
    to: ToEmail,
    message: Message
  }

  // 메일 송신
  const sendEmail = (e) => { 
    e.preventDefault(); 
    
    axios.post('/api/sendmail', body)
      .then(response => {
        if (response.data.success) {
          alert('Email sending was successful.');
        } else {
          alert('Email sending failed.');
        }
      });
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

  return (
    <div className="app">
      <h2>Send Mail</h2><br />
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
          <Button htmlType="submit" type="primary">
            Send
          </Button>
        </Form.Item>
      </Form>  
    </div>
  );
};

export default SendMailPage;