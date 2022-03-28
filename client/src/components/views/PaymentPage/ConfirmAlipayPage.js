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

function ConfirmAlipayPage(props) {
  const [UserId, setUserId] = useState("");
  const [Name, setName] = useState("");  
  const [LastName, setLastName] = useState("");
  const [Tel, setTel] = useState("");
  const [Email, setEmail] = useState("");
  // const [Role, setRole] = useState(""); // 차후에 사용 가능
  const [Siam1, setSiam1] = useState("");
  const [Sod, setSod] = useState("");
  const [UniqueField, setUniqueField] = useState("");
  const [Address1, setAddress1] = useState("");
  const [Address2, setAddress2] = useState("");
  const [Address3, setAddress3] = useState("");
  const [ChangeAddress, setChangeAddress] = useState("");
  const [SelectedAddress, setSelectedAddress] = useState(""); // Radio 값
  const [StepName, setStepName] = useState("");

  // query string 취득
  const userId = props.match.params.userId;
  const sid = props.match.params.sid;
  const sod = props.match.params.sod;
  const siam1 = props.match.params.siam1;
  const uniqueField = props.match.params.uniqueField;
  const stepName = props.match.params.stepName;

  // Radio 값 저장
  const radioChangeHandler = e => {
    setSelectedAddress(e.target.value);
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
          setUserId(userId);
          setSiam1(siam1);
          setSod(sod); // live streaming에서 date.toISOString()로 셋팅한 값
          setUniqueField(uniqueField);
          //setRole(response.data.user[0].role);

          // 주소
          setAddress1(response.data.user[0].address1);
          if (response.data.user[0].address2) {
            setAddress2(response.data.user[0].address2);
          }
          if (response.data.user[0].address3) {
            setAddress3(response.data.user[0].address3);
          }

          // live streaming의 step이름으로 step정보취득
          getStepInfo(stepName)

        } else {
          alert("Failed to get user information.")
        }
      })
  }, [])

  // step 정보취득
  const getStepInfo = (stepName) => {
    console.log("stepName: ", stepName);

    if (stepName) {
      let body = {
        searchTerm: stepName
      }
      
      axios.post(`${USER_SERVER}/list`, body)
        .then(response => {
            if (response.data.success) {
              if (response.data.userInfo.length === 1 && response.data.userInfo[0].role !== "0") {
                setStepName(response.data.userInfo[0].name + " " + response.data.userInfo[0].lastName);
              } else {
                setStepName("");
              }
            } else {
              alert("Failed to get step information.")
            }
        }
      )
    }
  }

  // 배송지 주소
  const addressChangeHandler = (event) => {
    setChangeAddress(event.currentTarget.value);
  }

  const state = "未確認";
  const body = {
    type: "alipay",
    userId: UserId,
    name: Name,
    lastName: LastName,
    tel: Tel,
    email: Email,
    address: SelectedAddress,
    sod: Sod,
    uniqueField: UniqueField,
    amount: Siam1,
    stepName: StepName,
    paymentStatus: state,
    deliveryStatus: state
  }
  
  // 결제처리
  const sendPaymentInfo = (e) => {
    // 주소 라디오 버튼
    if (SelectedAddress === "") {
      alert("Please select or enter an address")
      return;
    }

    // 주문정보 등록
    axios.post(`${ORDER_SERVER}/register`, body)
      .then(response => {
        if (response.data.success) {
          alert('Shipping information registration success');
        } else {
          alert('Failed to register shipping information. Please try again later');
        }
      });

    // UPC 데이타 전송(알리페이 결제 처리)
    let alipay_variable = {
      'sid': sid,
      'svid': '6',
      'ptype': '8',
      'job': 'REQUEST',
      'sod': sod,
      'tn': Tel,
      'em': Email,
      'lang': 'cn',
      'sinm1': 'Furuokadrug Product',
      'siam1': siam1, // 상품금액
      'sisf1': '0',   // 배달요금
      'uniqueField': uniqueField
    }

    // 화면 중앙정렬
    var popupWidth = 550;
    var popupHeight = 915;
    var popupX = (window.screen.width / 2) - (popupWidth / 2);
    var popupY= (window.screen.height / 2) - (popupHeight / 2);
    const settings = 'resizable=no, status=no, height=' + popupHeight  + ', width=' + popupWidth  + ', left='+ popupX + ', top='+ popupY;

    let url = "https://gw.ccps.jp/payment.aspx";
    Object.keys(alipay_variable).forEach(function(key, index) {
      url = url + (index === 0 ? "?" : "&") + key + "=" + alipay_variable[key];
    });

    window.open(url, "_blank", settings);
  }

  return (
    <div className="app">
      <h2>Alipay payment confirm</h2>
      <br />
      <Form style={{ minWidth: '500px' }} onSubmit={sendPaymentInfo} {...formItemLayout} >
        <Form.Item label="Name">
          <Input name="name" type="text" value={Name} readOnly />
        </Form.Item>
        <Form.Item label="LastName">
          <Input name="lastName" type="text" value={LastName} readOnly />
        </Form.Item>
        <Form.Item label="Tel">
          <Input name="tel" type="text" value={Tel} readOnly />
        </Form.Item>
        <Form.Item label="Email">
          <Input name="email" type="text" value={Email} readOnly />
        </Form.Item>
        <Form.Item label="Address">
          <Radio.Group onChange={radioChangeHandler} value={SelectedAddress}>
            <Radio value={Address1}>{Address1}</Radio><br /><br />
            { Address2 !== "" && <Radio value={Address2}>{Address2}</Radio> }
            { Address2 !== "" && <br /> }
            { Address2 !== "" && <br /> }
            { Address3 !== "" && <Radio value={Address3}>{Address3}</Radio> }
            { Address3 !== "" && <br /> }
            { Address3 !== "" && <br /> }
            <Radio value={ChangeAddress}>
              <Input name="changeAddress" type="text" value={ChangeAddress} onChange={addressChangeHandler} />
            </Radio>
          </Radio.Group>
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

export default ConfirmAlipayPage