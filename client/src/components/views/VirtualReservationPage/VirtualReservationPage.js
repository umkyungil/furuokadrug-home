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

function VirtualReservationPage(props) {
  const history = useHistory();

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
  
  const body = {
    name: Name,
    wechatID: WechatID,
    telephoneNumber: TelephoneNumber,
    reservationDate: ReservationDate,
    interestedItem: InterestedItem,
    email: Email
  }

  // 메일 송신
  const sendEmail = (e) => { 
    e.preventDefault(); 
    
    axios.post('/api/sendmail/reservation', body)
      .then(response => {

        console.log(response.date);

        if (response.data.success) {
          alert('The virtual reservation has been received');
          history.push("/");
        } else {
          alert('The virtual reservation has not been received. Please try again later');
        }
      });
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

  return (
    <div className="app">
      <h2>Virtual Reservation</h2><br />
      <Form style={{ minWidth: '375px' }} onSubmit={sendEmail} {...formItemLayout} >
        <Form.Item label="Name" required>
          <Input name="name" placeholder="Please enter your name" type="text" value={Name} onChange={nameHandler} required />
        </Form.Item>
        <Form.Item label="Wechat ID" required>
          <Input name="wechatID" placeholder="Please enter your Wechat ID" type="text" value={WechatID} onChange={wechatIDHandler} required />
        </Form.Item>
        <Form.Item label="Telephone number" required>
          <Input name="telephoneNumber" placeholder="Please enter your phone number" type="text" value={TelephoneNumber} onChange={telephoneNumberHandler} required />
        </Form.Item>
        <Form.Item label="Reservation date" required>
          <Input name="reservationDate" placeholder="Please select a reservation date" type="datetime-local" value={ReservationDate} onChange={reservationDateHandler} required />
        </Form.Item>
        <Form.Item label="Interested Item" required>
          <TextArea maxLength={100} name="interestedItem" label="Interested" style={{ height: 120, minWidth: '500px' }} value={InterestedItem} onChange={interestedItemHandler} 
            placeholder="Please enter the item you are interested in." required />
        </Form.Item>
        <Form.Item label="Email">
        <Input name="email" placeholder="Please enter your email address" type="email" value={Email} onChange={emailHandler} required />
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

export default VirtualReservationPage;