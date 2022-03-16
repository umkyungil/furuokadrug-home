import React, {useEffect, useState} from "react";
import { Form, Input, Button, Select } from 'antd';
import axios from 'axios';
import { USER_SERVER } from '../../Config.js';
// CORS 대책
axios.defaults.withCredentials = true;

const { Option } = Select;
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

// 배송지 주소
function handleChange(value) {
  // TODO: 값이 들어오면 이 주소로 배송한다는 의미 (배송정보는 아직 미 처리라서 콘솔에 주소를 찍음)
  console.log(`selected ${value}`);
}

function ConfirmWechatPaymentPage(props) {
  // const [Id, setId] = useState("");
  const [Name, setName] = useState("");  
  const [LastName, setLastName] = useState("");
  const [Email, setEmail] = useState("");

  const [AddressList, setAddressList] = useState([]);
  const selectList = [];
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
          setLastName(response.data.user[0].lastName);
          setEmail(response.data.user[0].email);
          setSiam1(siam1);
          // setRole(response.data.user[0].role);

          // 주소
          selectList.push(response.data.user[0].address1);
          if (response.data.user[0].address2) {
            selectList.push(response.data.user[0].address2);
          }
          if (response.data.user[0].address3) {
            selectList.push(response.data.user[0].address3);
          }
          // 주소 리스트를 status에 대입
          setAddressList(selectList);          
        } else {
          alert("Failed to get user information.")
        }
      })
  }, [])

  const addressChangeHandler = (event) => {
    setChangeAddress(event.currentTarget.value);
  }
  // 결제처리
  const sendPaymentInfo = (e) => { 
    e.preventDefault(); 

    let wechat_variable = {
      'sid': sid,
      'svid': '23',
      'ptype': '8',
      'job': 'REQUEST',
      'rt': '4',
      'sod': sod,
      'em': Email, // 메일주소
      'lang': 'cn',
      'siam1': siam1, // 상품금액
      'sinm1': 'Furuokadrug Product',
      'sisf1': '0', // 배달요금
      'method': 'QR',
      'uniqueField': uniqueField
    }

    let url = "https://gw.ccps.jp/payment.aspx";
    Object.keys(wechat_variable).forEach(function(key, index) {
      url = url + (index === 0 ? "?" : "&") + key + "=" + wechat_variable[key];
    });

    window.open(url,"wechat","toolbar=0,menubar=0,scrollbars=auto,resizable=no,height=770,width=768,top=100px,left=100");
  }

  return (
    <div className="app">
      <h2>Wechat payment confirm</h2>
      <br />
      <Form style={{ minWidth: '375px' }} onSubmit={sendPaymentInfo} {...formItemLayout} >
        <Form.Item label="Name">
          <Input name="name" type="text" value={Name} readOnly />
        </Form.Item>
        <Form.Item label="LastName">
          <Input name="lastName" type="text" value={LastName} readOnly />
        </Form.Item>
        <Form.Item label="Email">
          <Input name="email" type="text" value={Email} readOnly />
        </Form.Item>

        <Form.Item label="Select address">      
          <Select placeholder="Select a address" style={{ width: '100%' }} onChange={handleChange} tokenSeparators={[',']}>
            { AddressList.map((item, index) => (
              <Option value={item} key={index}>
                {item}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Shipping address">
          <Input name="changeAddress" placeholder="Please enter change shipping address" type="text" value={ChangeAddress} onChange={addressChangeHandler} />
        </Form.Item>
        <Form.Item label="Amount">
          <Input name="amount" type="text" value={Number(Siam1).toLocaleString()} readOnly />
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

export default ConfirmWechatPaymentPage