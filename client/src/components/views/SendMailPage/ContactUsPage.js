import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Alert } from 'antd';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { MAIL_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
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
  const history = useHistory(); 

  useEffect(() => {
    // 다국어 설정
		setMultiLanguage(localStorage.getItem("i18nextLng"));
  }, [])

  // 다국어 설정
  const {t, i18n} = useTranslation();
  function setMultiLanguage(lang) {
    i18n.changeLanguage(lang);
  }

  // 메일 송신
  const sendEmail = async (e) => { 
    e.preventDefault();

    const body = {
      name: Name,
      email: Email,
      message: Message
    }

    try {
      const result = await axios.post(`${MAIL_SERVER}/inquiry`, body);

      if (result.data.success) {
        history.push("/");
      } else {
        setErrorAlert(true);
      }
    } catch(err) {
      console.log("ContactUsPage err: ", err);
      setErrorAlert(true);
    }
  }
  // 이름 이벤트핸들러
  const nameHandler = (event) => {
    setName(event.currentTarget.value)
  }
  // 메일 이벤트핸들러
  const emailHandler = (event) => {
    setEmail(event.currentTarget.value)
  }
  // 메세지 이벤트핸들러
  const messageHandler = (event) => {
    setMessage(event.currentTarget.value)
  }
  // 에러메세지
	const errorHandleClose = () => {
    setErrorAlert(false);
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
      <br />

      <h1>{t('Contact.title')}</h1><br />
      <Form style={{ minWidth: '375px' }} onSubmit={sendEmail} {...formItemLayout} >
        <Form.Item label={t('Contact.name')} required>
          <Input name="name" placeholder="Please enter your name" type="text" value={Name} onChange={nameHandler} required/>
        </Form.Item>
        <Form.Item label={t('Contact.email')} required>
        <Input name="email" placeholder="Please enter your email address" type="email" value={Email} onChange={emailHandler} required/>
        </Form.Item>

        <Form.Item label={t('Contact.inquiry')} required>
          <TextArea maxLength={100} name="message" label="Message" style={{ height: 120, minWidth: '500px' }} value={Message} onChange={messageHandler} placeholder="Please enter your message" required/>
        </Form.Item>
        <Form.Item {...tailFormItemLayout}>
          <Button onClick={listHandler}>
            Landing Page
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