import React, {useEffect, useState} from "react";
import { Form, Input, Button } from 'antd';
import axios from 'axios';
import { USER_SERVER } from '../../Config.js';
// CORS 대책
axios.defaults.withCredentials = true;

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

function ConfirmAlipayPaymentPage(props) {
  // const [Id, setId] = useState("");
  const [Name, setName] = useState("");  
  const [Email, setEmail] = useState("");
  // const [LastName, setLastName] = useState("");
  const [Address1, setAddress1] = useState("");
  const [Address2, setAddress2] = useState("");
  const [Address3, setAddress3] = useState("");
  const [ChangeAddress, setChangeAddress] = useState("");
  // const [Role, setRole] = useState(""); // 차후에 사용 가능
  const [Siam1, setSiam1] = useState("");

  // query string 취득
  const userId = props.match.params.userId;
  const sid = props.match.params.sid;
  const sod = props.match.params.sod;
  const siam1 = props.match.params.siam1;
  const uniqueField = props.match.params.uniqueField;

  // 로그인 유저정보 취득
  useEffect(() => {
    axios.get(`${USER_SERVER}/users_by_id?id=${userId}`)
      .then(response => {
        if (response.data.success) {
          setName(response.data.user[0].name);
          setEmail(response.data.user[0].email);
          setAddress1(response.data.user[0].address1);
          setAddress2(response.data.user[0].address2);
          setAddress3(response.data.user[0].address3);
          // setRole(response.data.user[0].role);
          setSiam1(siam1);
        } else {
          alert("Failed to get user information.")
        }
      })
  }, [])

  const addressChangeHandler = (event) => {
    setChangeAddress(event.currentTarget.value);
  }
  const sendPaymentInfo = (e) => { 
    e.preventDefault(); 

    // TODO 결제처리
    let alipay_variable = {
      'sid': sid,
      'svid': '6',
      'ptype': '8',
      'job': 'REQUEST',
      'sod': sod,
      'lang': 'cn',
      'sinm1': 'Furuokadrug Product',
      'siam1': siam1, // 商品金額  
      'sisf1': '0', // 送料
      'uniqueField': uniqueField
    }

  }

  return (
    <div className="app">
      <h2>Alipay payment confirm</h2>
      <br />
      <Form style={{ minWidth: '375px' }} onSubmit={sendPaymentInfo} {...formItemLayout} >
        <Form.Item label="Name">
          <Input name="name" type="text" value={Name} readOnly />
        </Form.Item>
        <Form.Item label="Email">
          <Input name="email" type="text" value={Email} readOnly />
        </Form.Item>
        <Form.Item label="Address1">
          <Input name="address1" type="text" value={Address1} readOnly />
        </Form.Item>
        <Form.Item label="Address2">
          <Input name="address2" type="text" value={Address2} readOnly />
        </Form.Item>
        <Form.Item label="Address3">
          <Input name="address3" type="text" value={Address3} readOnly />
        </Form.Item>
        <Form.Item label="Change shipping address">
          <Input name="ChangeAddress" placeholder="Please enter change shipping address" type="text" value={ChangeAddress} onChange={addressChangeHandler} />
        </Form.Item>
        <Form.Item label="Amount">
          <Input name="amount" type="text" value={Siam1} readOnly />
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

export default ConfirmAlipayPaymentPage