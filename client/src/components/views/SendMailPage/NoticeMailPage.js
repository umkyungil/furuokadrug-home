import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Alert } from 'antd';
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

// ユーザーDirect Mail
const NoticeMailPage = (props) => {
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
  const history = useHistory();
  const {t, i18n} = useTranslation();
  
  useEffect(() => {
    // 다국어 설정
    i18n.changeLanguage(localStorage.getItem("i18nextLng"));
  }, [])

  const body = {
    type: props.match.params.type,
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
      console.log("result.data: ", result.data);
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
        console.log("NoticeMailPage err");
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
      console.log("NoticeMailPage err: ", err);
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
  // Landing pageへ戻る
  const listHandler = () => {
    history.push('/')
  }

  return (
    <div className="app">
      <h1>{t('Mail.noticeTitle')}</h1><br />
      <Form style={{ minWidth: '375px' }} onSubmit={sendEmail} {...formItemLayout} >
        <Form.Item label={t('Mail.subject')} required>
          <Input name="subject" placeholder="Please enter your subject" type="text" value={Subject} onChange={subjectHandler} required/>
        </Form.Item>

        <Form.Item label={t('Mail.from')}>
        <Input name="from-email" placeholder="Please enter your from-email address" type="email" value={FromEmail} onChange={fromEmailHandler} required/>
        </Form.Item>
        <Form.Item label={t('Mail.to')} required>
        <Input name="to-email" placeholder="Please enter your to-email address" type="email" value={ToEmail} onChange={toEmailHandler} required/>
        </Form.Item>

        <Form.Item label={t('Mail.message')} required>
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
};

export default NoticeMailPage;