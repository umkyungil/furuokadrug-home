import React, {useEffect, useState} from "react";
import { Form, Input, Button, Radio } from 'antd';
import axios from 'axios';
import { USER_SERVER, ORDER_SERVER } from '../../Config.js';
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
  const [Tel, setTel] = useState("");
  // const [Role, setRole] = useState(""); // 차후에 사용 가능
  const [Siam1, setSiam1] = useState("");
  const [Address1, setAddress1] = useState("");
  const [Address2, setAddress2] = useState("");
  const [Address3, setAddress3] = useState("");
  const [ChangeAddress, setChangeAddress] = useState("");
  const [State, setState] = useState("");

  // query string 취득
  const userId = props.match.params.userId;
  const sid = props.match.params.sid;
  const sod = props.match.params.sod;
  const siam1 = props.match.params.siam1;
  const uniqueField = props.match.params.uniqueField;

  // Radio 값 저장
  const radioChangeHandler = e => {
    alert(e.target.value);
    setState(e.target.value);
  };

  // 로그인 유저정보 취득
  useEffect(() => {
    axios.get(`${USER_SERVER}/users_by_id?id=${userId}`)
      .then(response => {
        if (response.data.success) {
          setName(response.data.user[0].name);
          setLastName(response.data.user[0].lastName);
          setEmail(response.data.user[0].email);
          setTel(response.data.user[0].tel)
          setSiam1(siam1);
          // setRole(response.data.user[0].role);

          // 주소
          setAddress1(response.data.user[0].address1);
          if (response.data.user[0].address2) {
            setAddress2(response.data.user[0].address2);
          }
          if (response.data.user[0].address3) {
            setAddress3(response.data.user[0].address3);
          }
        } else {
          alert("Failed to get user information.")
        }
      })
  }, [])

  const addressChangeHandler = (event) => {
    setChangeAddress(event.currentTarget.value);
  }

  const body = {
    type: "wechat",
    name: Name,
    lastName: LastName,
    tel: Tel,
    email: Email,
    address: State,
    amount: Siam1
  }

  // 결제처리
  const sendPaymentInfo = (e) => { 
    e.preventDefault(); 

    axios.post(`${ORDER_SERVER}/reservation`, body)
      .then(response => {
        if (response.data.success) {
          alert('The virtual reservation has been received');
          //history.push("/");
        } else {
          alert('The virtual reservation has not been received. Please try again later');
        }
      });

    let wechat_variable = {
      'sid': sid,
      'svid': '23',
      'ptype': '8',
      'job': 'REQUEST',
      'rt': '4',
      'sod': sod,
      'em': Email,
      'tn': Tel,
      'lang': 'cn',
      'sinm1': 'Furuokadrug Product',
      'siam1': siam1, // 상품금액      
      'sisf1': '0',   // 배달요금
      'method': 'QR',
      'uniqueField': uniqueField
    }

    let url = "https://gw.ccps.jp/payment.aspx";
    Object.keys(wechat_variable).forEach(function(key, index) {
      url = url + (index === 0 ? "?" : "&") + key + "=" + wechat_variable[key];
    });

    window.open(url,"_blank","toolbar=0,menubar=0,scrollbars=auto,resizable=no,height=770,width=768,top=100px,left=100");
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
        <Form.Item label="Address">
          <Radio.Group onChange={radioChangeHandler} value={State}>
            <Radio value={Address1}>{Address1}</Radio><br /><br />
            <Radio value={Address2}>{Address2}</Radio><br /><br />
            <Radio value={Address3}>{Address3}</Radio><br /><br />
            <Radio value={ChangeAddress}>
              <Input width={'100%'} name="changeAddress" type="text" value={ChangeAddress} onChange={addressChangeHandler} />
            </Radio>
          </Radio.Group>
        </Form.Item>
        {/* <Form.Item label="Address1">
          <Input name="address1" type="text" value={Address1} readOnly />
        </Form.Item>
        <Form.Item label="Address2">
          <Input name="address2" type="text" value={Address2} readOnly />
        </Form.Item>
        <Form.Item label="Address3">
          <Input name="address3" type="text" value={Address3} readOnly />
        </Form.Item>
        <Form.Item label="Shipping address">
          <Input name="changeAddress" placeholder="Please enter change shipping address" type="text" value={ChangeAddress} onChange={addressChangeHandler} />
        </Form.Item> */}
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