import React, { useState } from 'react'
import { Form, Input, Button } from 'antd';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

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

  const history = useHistory();
 
  const body = {
    name: Name,
    from: Email,
    message: Message
  }

  // 메일 송신
  const sendEmail = (e) => { 
    e.preventDefault(); 
    
    axios.post('/api/sendmail/inquiry', body)
      .then(response => {
        if (response.data.success) {
          alert('Your inquiry email has been received');
          history.push("/");
        } else {
          alert('The inquiry email was not sent. Please try again later');
        }
      });
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

  return (
    <div className="app">
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
          <Button htmlType="submit" type="primary">
            Send
          </Button>
        </Form.Item>
      </Form>  
    </div>
  );
}

export default ContactUsPage
