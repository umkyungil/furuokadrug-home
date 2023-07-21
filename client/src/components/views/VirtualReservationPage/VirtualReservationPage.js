import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { Form, Input, Button } from 'antd';
import { MAIL_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext.js';
// CORS 대책
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
    },
  },
};

function VirtualReservationPage(props) {
  const _history = useHistory();
  // 다국적언어 설정
  const {isLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  // query string 취득  
  let to_email;
  if (props.match.params.toEmail) {
    to_email = props.match.params.toEmail;
  } else {
    to_email = "";
  }
  
  const [Name, setName] = useState("");
  const [WeChatID, setWeChatID] = useState("");
  const [TelephoneNumber, setTelephoneNumber] = useState("");
  const [ReservationDate, setReservationDate] = useState("");
  const [InterestedItem, setInterestedItem] = useState("");
  const [Email, setEmail] = useState("");

  useEffect(() => {
		// 다국어 설정
		i18n.changeLanguage(isLanguage);
  }, [])
  
  const body = {
    name: Name,
    email: Email,
    weChatID: WeChatID,
    telephoneNumber: TelephoneNumber,
    reservationDate: ReservationDate,
    interestedItem: InterestedItem
  }

  // 메일 송신
  const sendEmail = async (e) => { 
    e.preventDefault();

    try {
      const result = await axios.post(`${MAIL_SERVER}/reserve`, body);
      if (result.data.success) {
        alert("Your virtual reservation has been received");
      } else {
        alert("Please try again after a while");
      }
      _history.push("/");
    } catch(err) {
      console.log("VirtualReservationPage err: ", err);
      alert("Please try again after a while");
      _history.push("/");
    }
  }
  
  const nameHandler = (event) => {
    setName(event.currentTarget.value)
  }
  const weChatIDHandler = (event) => {
    setWeChatID(event.currentTarget.value)
  }
  const telephoneNumberHandler = (event) => {
    setTelephoneNumber(event.currentTarget.value)
  }
  const reservationDateHandler = (event) => {
    setReservationDate(event.currentTarget.value)
  }
  const interestedItemHandler = (event) => {
    setInterestedItem(event.currentTarget.value)
  }
  const emailHandler = (event) => {
    setEmail(event.currentTarget.value)
  }
  // Landing pageへ戻る
  const listHandler = () => {
    _history.push('/')
  }

  return (

    <div style={{ maxWidth: '700px', margin: '3rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
        <h1>{t('Reservation.title')}</h1>
      </div>
      
      <Form style={{ minWidth: '350px', margin:'1em' }} {...formItemLayout} onSubmit={sendEmail} autoComplete="off" >        
        <Form.Item label={t('Reservation.name')} name="username" rules={[{ required: true }]}>
          <Input placeholder="Please enter name" type="text" value={Name} onChange={nameHandler} />
        </Form.Item>
        <Form.Item label={t('Reservation.wechatId')} required>
          <Input name="weChatID" placeholder="Please enter WeChat ID" type="text" value={WeChatID} onChange={weChatIDHandler} required />
        </Form.Item>
        <Form.Item label={t('Reservation.tel')} required>
          <Input name="telephoneNumber" placeholder="Please enter phone number" type="text" value={TelephoneNumber} onChange={telephoneNumberHandler} required />
        </Form.Item>
        <Form.Item label={t('Reservation.date')} required>
          <Input name="reservationDate" placeholder="Please select a reservation date" type="datetime-local" value={ReservationDate} onChange={reservationDateHandler} required />
        </Form.Item>
        <Form.Item label={t('Reservation.item')} required>
          <TextArea maxLength={100} name="interestedItem" label="Interested"  style={{ height: '1rem', minWidth: '375px' }} value={InterestedItem} onChange={interestedItemHandler} 
            placeholder="Please enter interested item" required />
        </Form.Item>
        <Form.Item label={t('Reservation.email')} required>
        <Input name="email" placeholder="Please enter email address" type="email" value={Email} onChange={emailHandler} required />
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

export default VirtualReservationPage;