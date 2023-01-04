import React, {useEffect, useRef} from "react";
import { Form, Input, Button, Radio, Tooltip } from 'antd';
import axios from 'axios';
import { USER_SERVER, ORDER_SERVER, PAYMENT_SERVER } from '../../Config.js';
import { useHistory } from 'react-router-dom';
import { NotSet, ECSystem, Unidentified } from '../../utils/Const';
import { useCookies } from "react-cookie";
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
  // const [UserId, setUserId] = useState("");
  // const [Name, setName] = useState("");  
  // const [LastName, setLastName] = useState("");
  // const [Email, setEmail] = useState("");
  // const [Tel, setTel] = useState("");
  // const [Siam1, setSiam1] = useState("");
  // const [Sod, setSod] = useState("");
  // const [UniqueField, setUniqueField] = useState("");
  // const [Address1, setAddress1] = useState("");
  // const [Address2, setAddress2] = useState("");
  // const [Address3, setAddress3] = useState("");
  // const [ShortAddress1, setShortAddress1] = useState("");
  // const [ShortAddress2, setShortAddress2] = useState("");
  // const [ShortAddress3, setShortAddress3] = useState("");
  // const [Receiver1, setReceiver1] = useState("");
  // const [Receiver2, setReceiver2] = useState("");
  // const [Receiver3, setReceiver3] = useState("");
  // const [Tel1, setTel1] = useState("");
  // const [Tel2, setTel2] = useState("");
  // const [Tel3, setTel3] = useState("");
  // const [ChangeAddress, setChangeAddress] = useState("");
  // const [ChangeReceiver, setChangeReceiver] = useState("");
  // const [ChangeTel, setChangeTel] = useState("");
  // const [SelectedAddress, setSelectedAddress] = useState(""); // Radio 선택된 값
  // const [StaffName, setStaffName] = useState("");
  // const [AcquisitionPoints, setAcquisitionPoints] = useState(0);
  // const [Role, setRole] = useState(0);
  const [Cookies, setCookie, removeCookie] = useCookies(["w_auth"]);

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
  const sod = decodeURIComponent(props.match.params.sod);
  const siam1 = props.match.params.siam1;
  const uniqueField = decodeURIComponent(props.match.params.uniqueField);
  const staffName = decodeURIComponent(props.match.params.staffName);

  const history = useHistory();

  useEffect(() => {
    // 로그인 사용자정보 가져오기
    getUserInfo();
  }, [])

  // 로그인 사용자정보 가져오기
  const getUserInfo = async () => {
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
      // 뷸특정 사용자인지 확인을 위해 권한을 대입
      roleRef.current = userInfo.data.user[0].role;

      // 임시주문 정보에 결제일자를 라이브, 카트 동일하게 저장하기 위해 Sod에 날짜를 대입
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
          getStaffInfo(staffName);
        }
      } else {
        staffNameRef.current = NotSet;
      }
    } else {
      alert("Please contact the administrator");
      history.push("/");
    }
  }

  // step 정보취득
  const getStaffInfo = async (staffName) => {
    // 성으로 전체 검색해서 권한이 스텝인 사람을 추출
    // 동명이인인 경우는 첫번째 사람의 이름으로 설정한다
    let body = {searchTerm: staffName}
    const staffInfo = await axios.post(`${USER_SERVER}/list`, body);

    if (staffInfo.data.success) {
      if (staffInfo.data.userInfo.length > 0 && staffInfo.data.userInfo[0].role !== "0") {
        staffNameRef.current = staffInfo.data.userInfo[0].name + " " + staffInfo.data.userInfo[0].lastName;
      } else {
        staffNameRef.current = Unidentified;
      }
    } else {
      alert("Please contact the administrator");
      history.push("/");
    }
  }

  // Radio 값 저장
  const handleRadioChange = (e) => {
    selectedAddressRef.current = e.target.value;
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
    selectedAddressRef.current = e.target.value;
  }
  // 불특정 사용자인 경우의 수취자
  const handleAnyReceiverChange = (e) => {
    changeReceiverRef.current = e.target.value;
  }
  // 불특정 사용자인 경우의 전화번호
  const handleAnyTelChange = (e) => {
    changeTelRef.current = e.target.value;
  }

  // 임시 주문정보 저장, UPC 데이타 전송, 팝업창 표시
  const sendPaymentInfo = async (e) => {
    e.preventDefault();

    let body = {
      type: "Alipay",
      userId: idRef.current,
      name: nameRef.current, 
      lastName: lastNameRef.current,
      tel: telRef.current,
      email: emailRef.current,
      address: selectedAddressRef.current,
      sod: sodRef.current, // 카트에서 온 경우 유니크필드의 결제일자를 Sod에 대입했고 라이브에서는 날짜가 원래 들어있음
      uniqueField: uniqueFieldRef.current,
      amount: siam1Ref.current,
      staffName: staffNameRef.current,
      paymentStatus: Unidentified,
      deliveryStatus: Unidentified
    }

    // 주소 라디오 버튼
    if (selectedAddressRef.current === "") {
      alert("Please select or enter an address")
      return;
    }
    // 선택된 주소로 수취인 정보 설정
    if (selectedAddressRef.current === address1Ref.current) {
      body.receiver = receiver1Ref.current;
      body.receiverTel = tel1Ref.current;
    }
    if (selectedAddressRef.current === address2Ref.current) {
      body.receiver = receiver2Ref.current;
      body.receiverTel = tel2Ref.current;
    }
    if (selectedAddressRef.current === address3Ref.current) {
      body.receiver = receiver3Ref.current;
      body.receiverTel = tel3Ref.current;
    }
    // 입력한 주소
    if (selectedAddressRef.current === changeAddressRef.current) {
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

        // 붙특정 사용자인 경우 논리삭제
        if (nameRef.current.substring(0, 9) === "Anonymous") {
          await axios.post(`${USER_SERVER}/logicalDelete`, { userId: idRef.current });

          // 쿠키삭제
          removeCookie("w_auth", { path: '/' });
          removeCookie("w_authExp", { path: '/' });
          // 세션삭제
          sessionStorage.removeItem("userId");
          sessionStorage.removeItem("userName");
        }

        console.log('Shipping information registration success');
      } else {
        console.log('Failed to register shipping information. Please try again later');
      }
    } catch (error) {
      alert("Please contact the administrator");
      history.push("/");
    }

    // 라이브에서 이동된 경우 구매상품의 포인트를 누적하기 위해 sod에 포인트를 추가
    // 라이브도 로그인한 사용자만이 사용할수 있기때문에 포인트 누적이 가능하다
    let arr = uniqueField.split('_');
    if (arr[0].trim() !== "cart") {
      sod = acquisitionPointsRef.current + "_" + sod;
    }
    
    // UPC 데이타 전송(알리페이 결제 처리)
    let alipay_variable = {
      'sid': sid,
      'svid': '6',
      'ptype': '8',
      'job': 'REQUEST',
      'sod': sod, // 카트인 경우 포인트, 라이브인 경우는 결제일및 포인트가 들어있음, Sod는 둘다 결제일을 넣어서 sod 와는 다르다.
      'tn': telRef.current,
      'em': emailRef.current,
      'lang': 'cn',
      'sinm1': 'Furuokadrug Product',
      'siam1': siam1Ref.current, // 상품금액
      'sisf1': '0',   // 배달요금
      'uniqueField': uniqueFieldRef.current
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
      let interval = window.setInterval(() => {
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
      if (staffName) {
        if (staffName === ECSystem) {
          history.push("/");
        } else {
          window.close();
        }
      }
    });

    // ##########################TEST##########################
    // const paymentResult = await axios.get(`${PAYMENT_SERVER}/alipay/register?rst=1&pid=1239&sod=${sodRef.current}&uniqueField=${uniqueFieldRef.current}`);
    // ##########################TEST##########################

  }

  return (
    <div className="app">
      <h1>Alipay payment confirm</h1>
      <br />
      <Form style={{ minWidth: '500px' }} onSubmit={sendPaymentInfo} {...formItemLayout} >
        { roleRef.current !== 3 && 
          <Form.Item label="Name">
            <Input name="name" type="text" value={nameRef.current} readOnly />
          </Form.Item>
        }
        { roleRef.current !== 3 && 
          <Form.Item label="LastName">
            <Input name="lastName" type="text" value={lastNameRef.current} readOnly />
          </Form.Item>
        }
        { roleRef.current !== 3 && 
          <Form.Item label="Email">
            <Input name="email" type="text" value={emailRef.current} readOnly />
          </Form.Item>
        }
        <Form.Item required label="Address" >
          { roleRef.current !== 3 && 
            <Radio.Group onChange={handleRadioChange} value={selectedAddressRef.current}>
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
          {/* 불특정 사용자 */}
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
          <Button htmlType="submit" type="primary">
            Send
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ConfirmAlipayPage