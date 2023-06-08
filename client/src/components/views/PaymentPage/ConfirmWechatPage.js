import React, {useEffect, useRef, useState} from "react";
import { Form, Input, Button, Radio, Tooltip } from 'antd';
import { USER_SERVER, ORDER_SERVER, PAYMENT_SERVER, UPC_PAYMENT } from '../../Config.js';
import { useHistory } from 'react-router-dom';
import { NOT_SET, ECSystem, Unidentified } from '../../utils/Const';
import { Cookies } from "react-cookie";
import axios from 'axios';
// CORS 대책
axios.defaults.withCredentials = true;

const cookies = new Cookies();

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

function ConfirmWechatPage(props) {
  const [SelectedAddress, setSelectedAddress] = useState("");
  const [ShowButton, setShowButton] = useState(true);

  const idRef = useRef("");
  const nameRef = useRef("");  
  const lastNameRef = useRef("");
  const emailRef = useRef("");
  const telRef = useRef("");
  const siam1Ref = useRef("");
  const sodRef = useRef("");
  const uniqueFieldRef = useRef("");
  const address1Ref = useRef("");
  const address2Ref = useRef("");
  const address3Ref = useRef("");
  const shortAddress1Ref = useRef("");
  const shortAddress2Ref = useRef("");
  const shortAddress3Ref = useRef("");
  const receiver1Ref = useRef("");
  const receiver2Ref = useRef("");
  const receiver3Ref = useRef("");
  const tel1Ref = useRef("");
  const tel2Ref = useRef("");
  const tel3Ref = useRef("");
  const changeAddressRef = useRef("");
  const changeReceiverRef = useRef("");
  const changeTelRef = useRef("");
  const selectedAddressRef = useRef(""); // Radio 선택된 값
  const staffNameRef = useRef("");
  const acquisitionPointsRef = useRef(0);
  const roleRef = useRef(0);

  // query string 취득(live streaming에서 보낸 값)
  const userId = props.match.params.userId;
  const sid = props.match.params.sid;
  let sod = decodeURIComponent(props.match.params.sod);
  const siam1 = props.match.params.siam1;
  const uniqueField = decodeURIComponent(props.match.params.uniqueField);
  const staffName = decodeURIComponent(props.match.params.staffName);

  const history = useHistory();
  let interval;

  useEffect(() => {
    // 로그인 사용자정보 가져오기
    getUserInfo();

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [])

  // 로그인 사용자정보 가져오기
  const getUserInfo = async () => {
    try {
      const userInfo = await axios.get(`${USER_SERVER}/users_by_id?id=${userId}`);

      if (userInfo.data.success) {
        nameRef.current = userInfo.data.user[0].name;
        lastNameRef.current = userInfo.data.user[0].lastName;
        emailRef.current = userInfo.data.user[0].email;
        telRef.current = userInfo.data.user[0].tel;
        idRef.current = userId;
        // 총 금액
        siam1Ref.current = siam1;
        uniqueFieldRef.current = uniqueField;
        // 뷸특정 사용자인지 확인을 위해 사용자 정보의 권한을 대입
        roleRef.current = userInfo.data.user[0].role;

        // 임시주문 정보에 결제일자를 라이브, 카트 동일하게 저장하기 위해 sodRef에 날짜를 대입
        let arr = uniqueField.split('_');
        if (arr[0].trim() === "cart") {
          // uniqueKey의 날짜를 대입 
          sodRef.current = arr[2].trim();
        } else {
          // Live에서 이동된 경우는 날짜만 들어있음
          sodRef.current = sod;
          // Live에서 이동된 경우 금액에 해당하는 포인트를 대입한다 
          acquisitionPointsRef.current = parseInt(Number(siam1) / 100);
        }
        // 주소1
        if (userInfo.data.user[0].address1) {
          address1Ref.current = userInfo.data.user[0].address1;
          let address1 = userInfo.data.user[0].address1;
          if (address1.length > 10) {
            address1 = address1.slice(0, 10)
            address1 = address1 + "...";
            shortAddress1Ref.current = address1;
          }
        }
        // 수신자1
        if (userInfo.data.user[0].receiver1) {
          receiver1Ref.current = userInfo.data.user[0].receiver1;
        }
        // 수신자 전화번호1
        if (userInfo.data.user[0].tel1) {
          tel1Ref.current = userInfo.data.user[0].tel1;
        }
        // 주소2
        if (userInfo.data.user[0].address2) {
          address2Ref.current = userInfo.data.user[0].address2;
          let address2 = userInfo.data.user[0].address2;
          if (address2.length > 10) {
            address2 = address2.slice(0, 10)
            address2 = address2 + "...";
            shortAddress2Ref.current = address2;
          }
        }
        // 수신자2
        if (userInfo.data.user[0].receiver2) {
          receiver2Ref.current = userInfo.data.user[0].receiver2;
        }
        // 수신자 전화번호2
        if (userInfo.data.user[0].tel2) {
          tel2Ref.current = userInfo.data.user[0].tel2;
        }
        // 주소3
        if (userInfo.data.user[0].address3) {
          address3Ref.current = userInfo.data.user[0].address3;
          let address3 = userInfo.data.user[0].address3;
          if (address3.length > 10) {
            address3 = address3.slice(0, 10);
            address3 = address3 + "...";
            shortAddress3Ref.current = address3;
          }
        }
        // 수신자3
        if (userInfo.data.user[0].receiver3) {
          receiver3Ref.current = userInfo.data.user[0].receiver3;
        }
        //수신자 전화번호3
        if (userInfo.data.user[0].tel3) {
          tel3Ref.current = userInfo.data.user[0].tel3;
        }
        // 스텝이름 가져오기
        // live streaming에서 이동된 경우 전달받은 step이름으로 step정보 가져오기
        // cart 에서 이동된 경우 전달된 스텝이름은 'ECSystem'이라서 검색할 필요가 없다
        if (staffName) {
          if (staffName === ECSystem) {
            staffNameRef.current = ECSystem;
          } else {
            await getStaffInfo(staffName);
          }
        } else {
          staffNameRef.current = NOT_SET;
        }
      } else {
        alert("Please contact the administrator");
      }
    } catch (err) {
      console.log("err: ", err);
      alert("Please contact the administrator");
    }
  }

  // step 정보가져오기
  const getStaffInfo = async (staffName) => {
    try {
      // 성으로 전체 검색해서 권한이 스텝인 사람을 추출
      // 동명이인인 경우는 첫번째 사람의 이름으로 설정한다
      let body = { searchTerm: staffName };
      const staffInfo = await axios.post(`${USER_SERVER}/list`, body);

      if (staffInfo.data.success) {
        if (staffInfo.data.userInfo.length > 0 && staffInfo.data.userInfo[0].role !== "0") {
          staffNameRef.current = staffInfo.data.userInfo[0].name + " " + staffInfo.data.userInfo[0].lastName;
        } else {
          staffNameRef.current = Unidentified;
        }
      } else {
        alert("Please contact the administrator");
      }
    } catch (err) {
      console.log("err: ", err);
      alert("Please contact the administrator");
    }
  }
  // 토큰유효기간 연장
  const updateTokenExp = async () => {
    try {
      const sesTokenAddedTime  = sessionStorage.getItem("tokenAddedTime");
      const userId = localStorage.getItem("userId");
      // 토큰 유효시간 연장
      await axios.post(`${USER_SERVER}/update/token`, { id: userId, tokenAddedTime:sesTokenAddedTime });  
    } catch (err) {
      console.log("err: ", err);
      alert("Please contact the administrator");
    }
  }

  // Radio 값 저장
  const handleRadioChange = e => {
    setSelectedAddress(e.target.value);
  };
  // 배송지 주소
  const handleAddressChange = (e) => {
    changeAddressRef.current = e.target.value;
  }
  // 수신자 이름
  const handleReceiverChange = (e) => {
    changeReceiverRef.current = e.target.value;
  }
  // 수신자 전화번호
  const handleTelChange = (e) => {
    changeTelRef.current = e.target.value;
  }
  // 불특정 사용자인 경우의 주소
  const handleAnyAddressChange = (e) => {
    changeAddressRef.current = e.target.value;
    setSelectedAddress(e.target.value);
  }
  // 불특정 사용자인 경우의 수취자
  const handleAnyReceiverChange = (e) => {
    changeReceiverRef.current = e.target.value;
  }
  // 불특정 사용자인 경우의 전화번호
  const handleAnyTelChange = (e) => {
    changeTelRef.current = e.target.value;
  }
  // Landing pageへ戻る
  const listHandler = async () => {
    // 토큰 유효기간 연장
    await updateTokenExp();
    history.push("/");
  }
  // 임시 주문정보 저장, UPC 데이타 전송, 팝업창 표시
  const sendPaymentInfo = async (e) => {
    e.preventDefault();
    // send버튼 보이지 않게 함
    setShowButton(false);

    try {
      let body = {
        type: "Wechat",
        userId: idRef.current,
        name: nameRef.current,
        lastName: lastNameRef.current,
        tel: telRef.current,
        email: emailRef.current,
        address: SelectedAddress,
        sod: sodRef.current, // 카트에서 온 경우 유니크필드의 결제일자를 sodRef에 대입했고 라이브에서 이동된 경우는 날짜가 들어있음
        uniqueField: uniqueFieldRef.current,
        amount: siam1Ref.current,
        staffName: staffNameRef.current,
        paymentStatus: Unidentified,
        deliveryStatus: Unidentified
      }
  
      // 주소 라디오 버튼
      if (SelectedAddress === "") {
        alert("Please select or enter an address")
        return;
      }
      // 선택된 주소의 수취인 정보를 설정하기
      if (SelectedAddress === address1Ref.current) {
        body.receiver = receiver1Ref.current;
        body.receiverTel = tel1Ref.current;
      }
      if (SelectedAddress === address2Ref.current) {
        body.receiver = receiver2Ref.current;
        body.receiverTel = tel2Ref.current;
      }
      if (SelectedAddress === address3Ref.current) {
        body.receiver = receiver3Ref.current;
        body.receiverTel = tel3Ref.current;
      }
      if (SelectedAddress === changeAddressRef.current) {
        // 받는사람
        if (changeReceiverRef.current === "") {
          alert("Please enter the recipient's name");
          return false
        }
        // 받는사람의 전화번호
        if (changeTelRef.current === "") {
          alert("Please enter the recipient's phone number");
          return false
        }
  
        body.receiver = changeReceiverRef.current;
        body.receiverTel = changeTelRef.current;
      }
      
      try {
        // 임시 주문정보 저장
        const tmpOrderResult = await axios.post(`${ORDER_SERVER}/tmpRegister`, body);
        if (tmpOrderResult.data.success) {
          // 붙특정 사용자인 경우
          if (nameRef.current.substring(0, 9) === "Anonymous") {
            // 사용자 삭제
            await axios.post(`${USER_SERVER}/delete`, {userId : idRef.current});
            // 쿠키삭제
            cookies.remove('w_auth');
            cookies.remove('w_authExp');
            // 세션삭제
            sessionStorage.removeItem("userId");
            sessionStorage.removeItem("userName");
          }
        } else {
          alert("Please contact the administrator");
        }
      } catch (err) {
        alert("Please contact the administrator");
      }
  
      // 라이브에서 이동된 경우 구매상품의 포인트를 누적하기 위해 sod에 포인트를 추가
      // 라이브도 로그인한 사용자만이 사용할수 있기때문에 포인트 누적이 가능하다
      let arr = uniqueField.split('_');
      // 카트페이지에서 오지 않은 경우
      if (arr[0].trim() !== "cart") {
        sod = acquisitionPointsRef.current + "_" + sod;
      }
  
      // UPC 데이타 전송(위쳇 결제 처리)
      let wechat_variable = {
        'sid': sid,
        'svid': '23',
        'ptype': '8',
        'job': 'REQUEST',
        'rt': '4', // wechat만 있는 항목
        'sod': sod, // 카트인 경우 포인트, 라이브인 경우는 결제일및 포인트가 들어있음, sodRef는 둘다 결제일을 넣어서 sod 와는 다르다.
        'tn': telRef.current,
        'em': emailRef.current,
        'lang': 'cn',
        'sinm1': 'Furuokadrug Product',
        'siam1': siam1Ref.current, // 상품금액
        'sisf1': '0',
        'method': 'QR', // wechat만 있는 항목
        'uniqueField': uniqueFieldRef.current
      }

      // 팝업을 전체화면으로 열기
      const settings = 'resizable=no, status=no, height=' + window.screen.height  + ', width=' + window.screen.width  + ', fullscreen=yes';
      
      let url = UPC_PAYMENT;
      Object.keys(wechat_variable).forEach(function(key, index) {
        url = url + (index === 0 ? "?" : "&") + key + "=" + wechat_variable[key];
      });
  
      // UPC 결제 팝업창을 닫는지 1초마다 확인, 닫았을때 화면을 이동
      const openDialog = (url, settings, closeCallback) => {
        let win = window.open(url, "_blank", settings);
        interval = window.setInterval(() => {
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
        // 불특정 사용자가 아닌경우 (붙특정 사용자인 경우 위에서 삭제처리 됨)
        if (nameRef.current.substring(0, 9) !== "Anonymous") {
          // 토큰 유효기간 연장
          await updateTokenExp();
        }
        // 초기화면 이동
        // history.push("/");
      });
  
      // 로컬에서 하면 localhost에서 보내는 거라서 UPC에서 거절당한다
      // 테스트를 하려면 아래와 같이 DB에 직접 데이타를 보내서 해야 한다
      // ##########################TEST##########################
      // const paymentResult = axios.get(`${PAYMENT_SERVER}/wechat/register?rst=1&pid=1239&sod=${sodRef.current}&uniqueField=${uniqueField.current}`);
      // ##########################TEST##########################  

    } catch (err) {
      console.log("err: ", err);
      alert("Please contact the administrator");
    }
  }

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
        <h1>Wechat payment confirm</h1>
      </div>

      <Form style={{ height:'80%', margin:'1em' }} onSubmit={sendPaymentInfo} {...formItemLayout} >
        {/* 불특정 사용자가 아닌경우 */}
        { roleRef.current !== 3 && 
          <>
            <Form.Item label="Name">
              <Input name="name" type="text" value={nameRef.current} readOnly />
            </Form.Item>
            <Form.Item label="LastName">
              <Input name="lastName" type="text" value={lastNameRef.current} readOnly />
            </Form.Item>
            <Form.Item label="Email">
              <Input name="email" type="text" value={emailRef.current} readOnly />
            </Form.Item>
          </>
        }
        <Form.Item required label="Address">
          { roleRef.current !== 3 && 
            <Radio.Group onChange={handleRadioChange} value={SelectedAddress}>
              <Tooltip title={address1Ref.current}>
                <Radio value={address1Ref.current}>{shortAddress1Ref.current}
                  &nbsp;&nbsp;{receiver1Ref.current}
                  &nbsp;&nbsp;{tel1Ref.current}
                </Radio>
              </Tooltip>
              <br />
              <br />
              { address2Ref.current !== "" && 
                <Tooltip title={address2Ref.current}>
                  <Radio value={address2Ref.current}>{shortAddress2Ref.current}
                    &nbsp;&nbsp;{receiver2Ref.current}
                    &nbsp;&nbsp;{tel2Ref.current}
                  </Radio> 
                </Tooltip>
              }
              { address2Ref.current !== "" && <br /> }
              { address2Ref.current !== "" && <br /> }
              { address3Ref.current !== "" && 
                <Tooltip title={address3Ref.current}>
                  <Radio value={address3Ref.current}>{shortAddress3Ref.current}
                    &nbsp;&nbsp;{receiver3Ref.current}
                    &nbsp;&nbsp;{tel3Ref.current}
                  </Radio> 
                </Tooltip>    
              }
              { address3Ref.current !== "" && <br /> }
              { address3Ref.current !== "" && <br /> }
              <Radio value={changeAddressRef.current}>
                <Input.Group compact>
                  <Input style={{ width: '55%' }} name="changeAddress" type="text" placeholder="Shipping address" value={changeAddressRef.current} onChange={handleAddressChange} />&nbsp;
                  <Input style={{ width: '20%' }} name="changeReceiver" type="text" placeholder="Name" value={changeReceiverRef.current} onChange={handleReceiverChange} />&nbsp;
                  <Input style={{ width: '20%' }} name="changeTel" type="text" placeholder="Phone" value={changeTelRef.current} onChange={handleTelChange} />
                </Input.Group>
              </Radio>
            </Radio.Group>
          }
          { roleRef.current === 3 && 
            <Input.Group compact>
              <Input style={{ width: '55%' }} name="changeAddress" type="text" placeholder="Shipping address" onChange={handleAnyAddressChange} required/>&nbsp;
              <Input style={{ width: '20%' }} name="changeReceiver" type="text" placeholder="Name" onChange={handleAnyReceiverChange} />&nbsp;
              <Input style={{ width: '20%' }} name="changeTel" type="text" placeholder="Phone" onChange={handleAnyTelChange} />
            </Input.Group>
          }
        </Form.Item>
        <Form.Item label="Amount">
          <Input name="amount" type="text" value={Number(siam1Ref.current).toLocaleString()} readOnly />
        </Form.Item>
        
        <Form.Item {...tailFormItemLayout}>
          <Button onClick={listHandler}>
            Landing page
          </Button>
          {ShowButton &&
            <Button htmlType="submit" type="primary">
              Send
            </Button>
          }
        </Form.Item>
      </Form>
    </div>
  );
};

export default ConfirmWechatPage;