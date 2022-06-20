import React, {useEffect, useState} from "react";
import { Form, Input, Button, Radio, Tooltip } from 'antd';
import axios from 'axios';
import { USER_SERVER, ORDER_SERVER, PAYMENT_SERVER } from '../../Config.js';
import { useHistory } from 'react-router-dom';
import swal from 'sweetalert'
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
  const [Email, setEmail] = useState("");
  const [Tel, setTel] = useState("");
  // const [Role, setRole] = useState("");
  const [Siam1, setSiam1] = useState("");
  const [Sod, setSod] = useState("");
  const [UniqueField, setUniqueField] = useState("");
  const [Address1, setAddress1] = useState("");
  const [Address2, setAddress2] = useState("");
  const [Address3, setAddress3] = useState("");
  const [ShortAddress1, setShortAddress1] = useState("");
  const [ShortAddress2, setShortAddress2] = useState("");
  const [ShortAddress3, setShortAddress3] = useState("");
  const [Receiver1, setReceiver1] = useState("");
  const [Receiver2, setReceiver2] = useState("");
  const [Receiver3, setReceiver3] = useState("");
  const [Tel1, setTel1] = useState("");
  const [Tel2, setTel2] = useState("");
  const [Tel3, setTel3] = useState("");
  const [ChangeAddress, setChangeAddress] = useState("");
  const [ChangeReceiver, setChangeReceiver] = useState("");
  const [ChangeTel, setChangeTel] = useState("");
  const [SelectedAddress, setSelectedAddress] = useState(""); // Radio 선택된 값
  const [StaffName, setStaffName] = useState("");

  const history = useHistory();

  // query string 취득(live streaming에서 보낸 값)
  const userId = props.match.params.userId;
  const sid = props.match.params.sid;
  const sod = props.match.params.sod;
  const siam1 = props.match.params.siam1;
  const uniqueField = decodeURIComponent(props.match.params.uniqueField);
  const staffName = decodeURIComponent(props.match.params.staffName);

  // Radio 값 저장
  const radioChangeHandler = e => {
    setSelectedAddress(e.target.value);
  };

  useEffect(() => {
    getUserInfo();
  }, [])

  // 로그인 유저정보 취득
  const getUserInfo = async () => {
    const userResult = await axios.get(`${USER_SERVER}/users_by_id?id=${userId}`);

    if (userResult.data.success) {
      setName(userResult.data.user[0].name);
      setLastName(userResult.data.user[0].lastName);
      setEmail(userResult.data.user[0].email);
      setTel(userResult.data.user[0].tel)
      setUserId(userId);
      setSiam1(siam1);
      setSod(sod); // live streaming에서 셋팅한 값
      setUniqueField(uniqueField);
      //setRole(userResult.data.user[0].role);

      // 주소1
      if (userResult.data.user[0].address1) {
        setAddress1(userResult.data.user[0].address1);
        let address1 = userResult.data.user[0].address1;
        if (address1.length > 10) {
          address1 = address1.slice(0, 10)
          address1 = address1 + "...";
          setShortAddress1(address1);
        }
      }
      // 수신자1
      if (userResult.data.user[0].receiver1) {
        setReceiver1(userResult.data.user[0].receiver1);
      }
      // 수신자 전화번호1
      if (userResult.data.user[0].tel1) {
        setTel1(userResult.data.user[0].tel1);
      }
      // 주소2
      if (userResult.data.user[0].address2) {
        setAddress2(userResult.data.user[0].address2);
        let address2 = userResult.data.user[0].address2;
        if (address2.length > 10) {
          address2 = address2.slice(0, 10)
          address2 = address2 + "...";
          setShortAddress2(address2);
        }
      }
      // 수신자2
      if (userResult.data.user[0].receiver2) {
        setReceiver2(userResult.data.user[0].receiver2);
      }
      // 수신자 전화번호2
      if (userResult.data.user[0].tel2) {
        setTel2(userResult.data.user[0].tel2);
      }
      // 주소3
      if (userResult.data.user[0].address3) {
        setAddress3(userResult.data.user[0].address3);
        let address3 = userResult.data.user[0].address3;
        if (address3.length > 10) {
          address3 = address3.slice(0, 10);
          address3 = address3 + "...";
          setShortAddress3(address3);
        }
      }
      // 수신자3
      if (userResult.data.user[0].receiver3) {
        setReceiver3(userResult.data.user[0].receiver3);
      }
      //수신자 전화번호3
      if (userResult.data.user[0].tel3) {
        setTel3(userResult.data.user[0].tel3);
      }

      // live streaming에서 전달받은 step이름으로 step정보취득
      // cart페이지에서 전달된 스텝이름은 'ECSystem'이라서 스텝이름을 
      // 검색할 필요가 없다
      if (staffName) {
        if (staffName !== 'ECSystem') {
          getStaffInfo(staffName)
        }
      }
    } else {
      alert("Failed to get user information.")
    } 
  }

  // step 정보취득
  const getStaffInfo = async (staffName) => {
    let body = {
      searchTerm: staffName
    }
    // 성으로 전체 검색해서 권한이 스텝인 사람을 추출
    // 동명이인인 경우는 첫번째 사람의 이름으로 설정한다
    const staffResult = axios.post(`${USER_SERVER}/list`, body);

    if (staffResult.data.success) {
      if (staffResult.data.userInfo.length > 0 && staffResult.data.userInfo[0].role !== "0") {
        setStaffName(staffResult.data.userInfo[0].name + " " + staffResult.data.userInfo[0].lastName);
      } else {
        setStaffName("未確認");
      }
    } else {
      alert("Failed to get step information.")
    }
  }

  // 배송지 주소
  const addressChangeHandler = (event) => {
    setChangeAddress(event.currentTarget.value);
  }
  // 수신자 이름
  const receiverChangeHandler = (event) => {
    setChangeReceiver(event.currentTarget.value);
  }
  // 수신자 전화번호
  const telChangeHandler = (event) => {
    setChangeTel(event.currentTarget.value);
  }
  
  // 결제처리
  const sendPaymentInfo = async (e) => {
    e.preventDefault();

    const body = {
      type: "Alipay",
      userId: UserId,
      name: Name,
      lastName: LastName,
      tel: Tel,
      email: Email,
      address: SelectedAddress,
      sod: Sod,
      uniqueField: UniqueField,
      amount: Siam1,
      staffName: StaffName,
      paymentStatus: "未確認",
      deliveryStatus: "未確認"
    }

    // 주소 라디오 버튼
    if (SelectedAddress === "") {
      alert("Please select or enter an address")
      return;
    }
    // 선택된 주소로 수취인 정보 설정
    if (SelectedAddress === Address1) {
      body.receiver = Receiver1;
      body.receiverTel = Tel1;
    }
    if (SelectedAddress === Address2) {
      body.receiver = Receiver2;
      body.receiverTel = Tel2;
    }
    if (SelectedAddress === Address3) {
      body.receiver = Receiver3;
      body.receiverTel = Tel3;
    }
    if (SelectedAddress === ChangeAddress) {
      if (ChangeReceiver === "") {
        alert("Please enter the recipient's name");
        return false
      }
      body.receiver = ChangeReceiver;
      body.receiverTel = ChangeTel;
    }

    // 주문정보 등록(입금상태는 알리페이 결제성공 데이타 수신하는곳에서 업데이트 함)
    const orderResult = await axios.post(`${ORDER_SERVER}/register`, body);
    if (orderResult.data.success) {
      console.log('Shipping information registration success');
    } else {
      console.log('Failed to register shipping information. Please try again later');
    }

    // ##########################TEST##########################
    // const paymentResult = await axios.get(`${PAYMENT_SERVER}/alipay/register?rst=1&uniqueField=${UniqueField}`);
    // ##########################TEST##########################

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
      'uniqueField': UniqueField
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

    // UPC 결제 팝업창을 닫는지 1초마다 확인, 닫았을때 화면을 이동 또는 조건에 따라 탭을 종료한다.
    const openDialog = (url, settings, closeCallback) => {
      let win = window.open(url, "_blank", settings);
      let interval = window.setInterval(function() {
        try {
          if (win == null || win.closed) {
            window.clearInterval(interval);
            closeCallback(win);
          }
        } catch (e) {}
      }, 1000);
      return win;
    };

    openDialog(url, settings, async function(win) {
      // 라이브 스트리밍에서 페이지가 호출된 경우 결제팝업이 닫혀지면
      // 이 창도 닫아서 라이브화면만 남긴다
      setTimeout(() => {
        if (staffName) {
          if (staffName === 'ECSystem') {
            history.push("/user/cart");
          } else {
            window.close();
          }
        }
      }, 3000);
    });
  }

  return (
    <div className="app">
      <h1>Alipay payment confirm</h1>
      <br />
      <Form style={{ minWidth: '500px' }} onSubmit={sendPaymentInfo} {...formItemLayout} >
        <Form.Item label="Name">
          <Input name="name" type="text" value={Name} readOnly />
        </Form.Item>
        <Form.Item label="LastName">
          <Input name="lastName" type="text" value={LastName} readOnly />
        </Form.Item>
        {/* <Form.Item label="Tel">
          <Input name="tel" type="text" value={Tel} readOnly />
        </Form.Item> */}
        <Form.Item label="Email">
          <Input name="email" type="text" value={Email} readOnly />
        </Form.Item>
        <Form.Item label="Address">
          <Radio.Group onChange={radioChangeHandler} value={SelectedAddress}>
            <Tooltip title={Address1}>
              <Radio value={Address1}>{ShortAddress1}&nbsp;&nbsp;{Receiver1}&nbsp;&nbsp;{Tel1}</Radio>
            </Tooltip>
            <br />
            <br />
            { Address2 !== "" && 
              <Tooltip title={Address2}>
                <Radio value={Address2}>{ShortAddress2}&nbsp;&nbsp;{Receiver2}&nbsp;&nbsp;{Tel2}</Radio> 
              </Tooltip>
            }
            { Address2 !== "" && <br /> }
            { Address2 !== "" && <br /> }
            { Address3 !== "" && 
              <Tooltip title={Address3}>
                <Radio value={Address3}>{ShortAddress3}&nbsp;&nbsp;{Receiver3}&nbsp;&nbsp;{Tel3}</Radio> 
              </Tooltip>    
            }
            { Address3 !== "" && <br /> }
            { Address3 !== "" && <br /> }
            <Radio value={ChangeAddress}>
              <Input.Group compact>
                <Input style={{ width: '55%' }} name="changeAddress" type="text" placeholder="Shipping address" value={ChangeAddress} onChange={addressChangeHandler} />&nbsp;
                <Input style={{ width: '20%' }} name="changeReceiver" type="text" placeholder="Name" value={ChangeReceiver} onChange={receiverChangeHandler} />&nbsp;
                <Input style={{ width: '20%' }} name="changeTel" type="text" placeholder="Phone" value={ChangeTel} onChange={telChangeHandler} />
              </Input.Group>
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