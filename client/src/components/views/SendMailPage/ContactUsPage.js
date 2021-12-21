import React, { useState } from 'react'
import emailjs from 'emailjs-com';
import { Form, Input, Button } from 'antd';

const { TextArea } = Input;
// const YOUR_SERVICE_ID = 'service_2rvkwal'; // Gmail
const YOUR_SERVICE_ID = 'service_x5j409i'; // Outlook
const YOUR_TEMPLATE_ID = 'template_bzg5h2n'
const YOUR_USER_ID = 'user_pFh5Lp8R4tGlbA7lyl2FI';

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
 
  // 메일 송신
  const sendEmail = (e) => { 
    e.preventDefault(); 
    
    emailjs.sendForm(YOUR_SERVICE_ID, YOUR_TEMPLATE_ID, e.target, YOUR_USER_ID)
      .then((result) => { 
        console.log(result.text); 
        alert("The mail was sent successfully")
      }, (error) => { 
        alert("Failed to send mail")
        console.log(error.text); 
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
