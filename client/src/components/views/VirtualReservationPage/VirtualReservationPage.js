import React, { useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { Form, Input, Button, Alert } from 'antd';
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

function VirtualReservationPage(props) {
  const history = useHistory();

    // 다국적언어 설정
	const {t, i18n} = useTranslation();

  // query string 취득  
  let to_email;
  if (props.match.params.toEmail) {
    to_email = props.match.params.toEmail;
  } else {
    to_email = "";
  }
  
  const [Name, setName] = useState("");
  const [WechatID, setWechatID] = useState("");
  const [TelephoneNumber, setTelephoneNumber] = useState("");
  const [ReservationDate, setReservationDate] = useState("");
  const [InterestedItem, setInterestedItem] = useState("");
  const [Email, setEmail] = useState("");
  const [ErrorAlert, setErrorAlert] = useState(false);
  const [SuccessAlert, setSuccessAlert] = useState(false);
  
  const body = {
    type: 'Reservation',
    subject: 'Virtual Reservation',
    name: Name,
    email: Email,
    wechatID: WechatID,
    telephoneNumber: TelephoneNumber,
    reservationDate: ReservationDate,
    interestedItem: InterestedItem
  }

  // 메일 송신
  const sendEmail = async (e) => { 
    e.preventDefault();    
    try {
      const result = await axios.post(`${MAIL_SERVER}/reservation`, body);
      if (result.data.success) {
        setSuccessAlert(true);
      } else {
        console.log("VirtualReservationPage err");
        setErrorAlert(true);
      }
    } catch(err) {
      console.log("VirtualReservationPage err: ", err);
      setErrorAlert(true);
    }
  }
  
  const nameHandler = (event) => {
    setName(event.currentTarget.value)
  }
  const wechatIDHandler = (event) => {
    setWechatID(event.currentTarget.value)
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
          <Alert message="The virtual reservation has not been received. Please try again later." type="error" showIcon closable afterClose={errorHandleClose}/>
        ) : null}
      </div>
      <div style={{ minWidth: '650px' }}>
        {SuccessAlert ? (
          <Alert message="The virtual reservation has been received." type="success" showIcon closable afterClose={successHandleClose}/>
        ) : null}
      </div>
      <br />

      <h1>{t('Reservation.title')}</h1><br />
      <Form style={{ minWidth: '375px' }} onSubmit={sendEmail} {...formItemLayout} >
        <Form.Item label={t('Reservation.name')} required>
          <Input name="name" placeholder="Please enter your name" type="text" value={Name} onChange={nameHandler} required />
        </Form.Item>
        <Form.Item label={t('Reservation.wechatId')} required>
          <Input name="wechatID" placeholder="Please enter your Wechat ID" type="text" value={WechatID} onChange={wechatIDHandler} required />
        </Form.Item>
        <Form.Item label={t('Reservation.tel')} required>
          <Input name="telephoneNumber" placeholder="Please enter your phone number" type="text" value={TelephoneNumber} onChange={telephoneNumberHandler} required />
        </Form.Item>
        <Form.Item label={t('Reservation.date')} required>
          <Input name="reservationDate" placeholder="Please select a reservation date" type="datetime-local" value={ReservationDate} onChange={reservationDateHandler} required />
        </Form.Item>
        <Form.Item label={t('Reservation.item')} required>
          <TextArea maxLength={500} name="interestedItem" label="Interested" style={{ height: 120, minWidth: '375px' }} value={InterestedItem} onChange={interestedItemHandler} 
            placeholder="Please enter the item you are interested in." required />
        </Form.Item>
        <Form.Item label={t('Reservation.email')} required>
        <Input name="email" placeholder="Please enter your email address" type="email" value={Email} onChange={emailHandler} required />
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
};

export default VirtualReservationPage;