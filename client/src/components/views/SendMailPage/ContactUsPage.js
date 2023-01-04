import React, { useState, useEffect } from 'react';
import { Form, Input, Button } from 'antd';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { MAIL_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
import swal from 'sweetalert'
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
  const history = useHistory();
  const {t, i18n} = useTranslation();

  useEffect(() => {
    // 다국어 설정
		i18n.changeLanguage(localStorage.getItem("i18nextLng"));
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
        swal({
          title: "Success",
          text: "The mail has been sent",
          icon: "success",
          button: "OK",
        }).then((value) => {
          history.push("/");
        });
      } else {
        swal({
          title: "Failed",
          text: "Please try again after a while",
          icon: "error",
          button: "OK",
        }).then((value) => {
          history.push("/");
        });
      }
    } catch(err) {
      console.log("ContactUsPage err: ", err);
      swal({
        title: "Failed",
        text: "Please try again after a while",
        icon: "error",
        button: "OK",
      }).then((value) => {
        history.push("/");
      });
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
    <div className="app">
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