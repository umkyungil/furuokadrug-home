import React, { useState, useEffect, useContext } from 'react';
import { Form, Input, Button } from 'antd';
import { useHistory } from 'react-router-dom';
import { MAIL_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
import Footer from '../Footer/Footer';
import { LanguageContext } from '../../context/LanguageContext.js';
import '../ProductPage/Sections/product.css';
import { getLanguage } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

const { TextArea } = Input;
const formItemLayout = {
  labelCol: {
    span: 6
  },
  wrapperCol: {
    span: 14
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
      offset: 6,
    }
  }
};

function ContactUsPage() {
  const [Name, setName] = useState("");
  const [Email, setEmail] = useState("");
  const [Message, setMessage] = useState("");
  const history = useHistory();
  const {isLanguage, setIsLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  useEffect(() => {
    // 다국어 설정
    const lang = getLanguage(isLanguage);    
    i18n.changeLanguage(lang);
    setIsLanguage(lang);
  }, [])

  // 메일 송신
  const sendEmail = async (e) => { 
    e.preventDefault();

    try {
      const body = {
        name: Name,
        email: Email,
        message: Message
      }
      const result = await axios.post(`${MAIL_SERVER}/inquiry`, body);

      if (result.data.success) {
        alert("The mail has been sent");
      } else {
        alert("Please try again after a while");
      }
      history.push("/");
    } catch(err) {
      console.log("ContactUsPage err: ", err);
      alert("Please try again after a while");
      history.push("/");
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
  // Landing pageへ戻る
  const listHandler = () => {
    history.push('/')
  }

  return (
    <div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} style={{ maxWidth: '700px', margin: '3rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
        <h1>{t('Contact.title')}</h1>
      </div>
      
      <Form style={{ minWidth: '350px', margin:'1em' }} {...formItemLayout} onSubmit={sendEmail} autoComplete="off" >
        <Form.Item label={t('Contact.name')} required>
          <Input name="name" placeholder="Please enter your name" type="text" value={Name} onChange={nameHandler} required/>
        </Form.Item>
        <Form.Item label={t('Contact.email')} required>
        <Input name="email" placeholder="Please enter your email address" type="email" value={Email} onChange={emailHandler} required/>
        </Form.Item>
        <Form.Item label={t('Contact.inquiry')} required>
          <TextArea maxLength={100} name="message" label="Message" style={{ height: 120, minWidth: '375px' }} value={Message} onChange={messageHandler} placeholder="Please enter your message" required/>
        </Form.Item>

        <Form.Item {...tailFormItemLayout}>
          <Button onClick={listHandler}>
            Landing Page
          </Button>
          <Button htmlType="submit" type="primary">
            Send
          </Button>
        </Form.Item>
        
      </Form>  
    </div>
  );
} 

export default ContactUsPage;