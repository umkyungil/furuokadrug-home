import React, { useState, useEffect, useContext } from 'react';
import { Form, Input, Button } from 'antd';
import { useHistory } from 'react-router-dom';
import { MAIL_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
import { ADMIN_EMAIL } from '../../utils/Const.js';

import { LanguageContext } from '../../context/LanguageContext.js';
import { getLanguage, setHtmlLangProps, getMessage } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
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
  const [FromEmail, setFromEmail] = useState(ADMIN_EMAIL);
  const [ToEmail, setToEmail] = useState(to_email);
  const [Message, setMessage] = useState("");
  const history = useHistory();

  const {isLanguage, setIsLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();
  
  useEffect(() => {
    // 다국어 설정
    const lang = getLanguage(isLanguage);
    i18n.changeLanguage(lang);
    setIsLanguage(lang);

    // HTML lang속성 변경
    setHtmlLangProps(lang);
  }, [isLanguage])

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
      if (result.data.success) {
        history.push("/");
      } else {
        alert(getMessage(getLanguage(), 'key001'));
        history.push("/");
      }
    } catch(err) {
      console.log("NoticeMailPage sendEmail err: ", err);
      alert(getMessage(getLanguage(), 'key001'));
      history.push("/");
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
    <div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
        <h1>{t('Mail.noticeTitle')}</h1>
      </div>

      <Form style={{height:'80%', margin:'1em'}} {...formItemLayout} onSubmit={sendEmail} >
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
          <TextArea maxLength={100} name="message" label="Message" style={{ height: 120 }} value={Message} onChange={messageHandler} placeholder="Please enter your message" required/>
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
};

export default NoticeMailPage;