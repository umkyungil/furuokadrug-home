import React, { useEffect, useRef, useState } from "react";
import { Form, Input, Button, Radio, Tooltip, Select } from 'antd';
import { USER_SERVER, ORDER_SERVER, PAYMENT_SERVER, UPC_PAYMENT, CODE_SERVER } from '../../Config.js';
import { NOT_SET, EC_SYSTEM, UNIDENTIFIED, ANONYMOUS } from '../../utils/Const.js';
import { useCookies } from 'react-cookie';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
// CORS 대책
axios.defaults.withCredentials = true;

const {Option} = Select;
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

function WechatConfirmPage(props) {
  const history = useHistory();
  const [cookies, setCookie, removeCookie] = useCookies(['w_auth', 'w_authExp']);
  const [SelectedAddress, setSelectedAddress] = useState("");
  const [ChangeZip, setChangeZip] = useState("");
  const [ChangeAddress, setChangeAddress] = useState("");
  const [ChangeReceiver, setChangeReceiver] = useState("");
  const [ChangeTel, setChangeTel] = useState("");
  const [Code, setCode] = useState([]);
  const [Country, setCountry] = useState("JAPAN");

  const idRef = useRef("");
  const nameRef = useRef("");  
  const lastNameRef = useRef("");
  const emailRef = useRef("");
  const telRef = useRef("");
  const siam1Ref = useRef("");
  const sodRef = useRef("");
  const uniqueFieldRef = useRef("");
  const roleRef = useRef(0);
  const zip1Ref = useRef("");
  const zip2Ref = useRef("");
  const zip3Ref = useRef("");
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
  const staffNameRef = useRef("");
  const acquisitionPointsRef = useRef(0);

  // query string 취득(live streaming에서 보낸 값)
  const userId = props.match.params.userId;
  const sid = props.match.params.sid;
  const staffName = decodeURIComponent(props.match.params.staffName);

  let sod = decodeURIComponent(props.match.params.sod);
  let siam1 = props.match.params.siam1;
  // 라이브 스트리밍: uniqueField = 'alipay' + '_' + loginUserId + '_' + uniqueDate;
  // 카트: uniqueField = 'cart_' + tmpPaymentId + '_' + uniqueDate;
  let uniqueField = decodeURIComponent(props.match.params.uniqueField);

  useEffect(() => {
    // 포인트 적용률이 없으면 포인트 테이블에서 가져와서 세션에 저장
    if (!sessionStorage.getItem("pointRate")) {
      getPointRate();
    }
    // 로그인 사용자정보 가져오기
    getUserInfo();
    // 코드테이블에서 국가정보 가져오기
    getCountry();
  }, [])

  // 퍼센트로 값 구하기(전체값 * 퍼센트 / 100)
  const percent = (total, rate) => {
    return parseInt((parseInt(total) * parseInt(rate)) / 100);
  }

  // 로그인 사용자정보 가져오기
  const getUserInfo = async () => {
    try {
      const userInfo = await axios.get(`${USER_SERVER}/users_by_id?id=${userId}`);

      if (userInfo.data.success) {
        nameRef.current = userInfo.data.user[0].name;
        lastNameRef.current = userInfo.data.user[0].lastName;
        emailRef.current = userInfo.data.user[0].email;
        telRef.current = userInfo.data.user[0].tel;

        // 사용자 정보 이외의 결재정보를 대입
        idRef.current = userId;
        siam1Ref.current = siam1; // 총 금액
        uniqueFieldRef.current = uniqueField;
        roleRef.current = parseInt(userInfo.data.user[0].role); // 뷸특정 사용자인지 확인을 위해 권한을 대입

        // sodRef: tmpOrder에 결제일자를 라이브, 카트 동일하게 저장하기 위해 sodRef에 날짜를 대입
        let arr = uniqueField.split('_');
        if (arr[0].trim() === "cart") {
          // 임시 주문정보 저장할때 sodRef에 uniqueKey의 날짜를 대입 
          sodRef.current = arr[2].trim();
        } else {
          // 임시 주문정보 저장할때 sodRef에 Live에서 이동된 sod를 그대로 대입(날짜만 들어있음)
          sodRef.current = sod;
        }

        // zip1
        if (userInfo.data.user[0].zip1) {
          zip1Ref.current = userInfo.data.user[0].zip1;
        }
        // 주소1
        if (userInfo.data.user[0].address1) {
          address1Ref.current = userInfo.data.user[0].address1;
          let address1 = userInfo.data.user[0].address1;
          if (address1.length > 10) {
            address1 = address1.slice(0, 10)
            address1 = address1 + "...";
            shortAddress1Ref.current = address1;
          } else {
            shortAddress1Ref.current = address1;
          }
        }
        // 수신자1
        if (userInfo.data.user[0].receiver1) {
          receiver1Ref.current = userInfo.data.user[0].receiver1;
        }
        // 전화번호1
        if (userInfo.data.user[0].tel1) {
          tel1Ref.current = userInfo.data.user[0].tel1;
        }
        // zip2
        if (userInfo.data.user[0].zip2) {
          zip2Ref.current = userInfo.data.user[0].zip2;
        }
        // 주소2
        if (userInfo.data.user[0].address2) {
          address2Ref.current = userInfo.data.user[0].address2;
          let address2 = userInfo.data.user[0].address2;
          if (address2.length > 10) {
            address2 = address2.slice(0, 10)
            address2 = address2 + "...";
            shortAddress2Ref.current = address2;
          } else {
            shortAddress2Ref.current = address2;
          }
        }
        // 수신자2
        if (userInfo.data.user[0].receiver2) {
          receiver2Ref.current = userInfo.data.user[0].receiver2;
        }
        // 전화번호2
        if (userInfo.data.user[0].tel2) {
          tel2Ref.current = userInfo.data.user[0].tel2;
        }
        // zip3
        if (userInfo.data.user[0].zip3) {
          zip3Ref.current = userInfo.data.user[0].zip3;
        }
        // 주소3
        if (userInfo.data.user[0].address3) {
          address3Ref.current = userInfo.data.user[0].address3;
          let address3 = userInfo.data.user[0].address3;
          if (address3.length > 10) {
            address3 = address3.slice(0, 10);
            address3 = address3 + "...";
            shortAddress3Ref.current = address3;
          } else {
            shortAddress3Ref.current = address3;
          }
        }
        // 수신자3
        if (userInfo.data.user[0].receiver3) {
          receiver3Ref.current = userInfo.data.user[0].receiver3;
        }
        // 전화번호3
        if (userInfo.data.user[0].tel3) {
          tel3Ref.current = userInfo.data.user[0].tel3;
        }
        // 스텝이름 가져오기
        // live streaming에서 이동된 경우 전달받은 step이름으로 step정보 가져오기
        // cart 에서 이동된 경우 전달된 스텝이름은 'ECSystem'이라서 검색할 필요가 없다
        if (staffName) {
          if (staffName === EC_SYSTEM) {
            staffNameRef.current = EC_SYSTEM;
          } else {
            await getStaffInfo(staffName);
          }
        } else {
          staffNameRef.current = NOT_SET;
        }
      } else {
        alert("Please contact the administrator");
        history.push("/");
      }
    } catch (err) {
      console.log("err: ", err);
      alert("Please contact the administrator");
      history.push("/");
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
          staffNameRef.current = UNIDENTIFIED;
        }
      } else {
        alert("Please contact the administrator");
        return false;
      }
    } catch (err) {
      console.log("err: ", err);
      alert("Please contact the administrator");
      return false;
    }
  }

  // 국가정보 가져오기
  const getCountry = async () => {
    try {
      const codes = await axios.get(`${CODE_SERVER}/code_by_code?code=COUNTRY`);
      if (codes.data.success) {
        let arrCodes = [];

        // 코드마스타의 값이 value7까지 있다        
        if (codes.data.codeInfo.value1 !== "") arrCodes.push(codes.data.codeInfo.value1);
        if (codes.data.codeInfo.value2 !== "") arrCodes.push(codes.data.codeInfo.value2);
        if (codes.data.codeInfo.value3 !== "") arrCodes.push(codes.data.codeInfo.value3);
        if (codes.data.codeInfo.value4 !== "") arrCodes.push(codes.data.codeInfo.value4);
        if (codes.data.codeInfo.value5 !== "") arrCodes.push(codes.data.codeInfo.value5);
        if (codes.data.codeInfo.value6 !== "") arrCodes.push(codes.data.codeInfo.value6);
        if (codes.data.codeInfo.value7 !== "") arrCodes.push(codes.data.codeInfo.value7);

        setCode(arrCodes);
      }
    } catch (err) {
      alert('Please contact the administrator');
      console.log("err: ",err);
      history.push("/");
    }
  }

  // 포인트 적용률정보 가져와서 세션에 저장
  const getPointRate = async () => {
    try {
      const pointRate = await axios.get(`${CODE_SERVER}/code_by_code?code=POINT`);

      // 세션에 저장
      if (pointRate) {
        sessionStorage.setItem("pointRate", pointRate.data.codeInfo.value1);
      }
    } catch (err) {
      alert('Please contact the administrator');
      console.log("err: ",err);
      history.push("/");
    }
  }

  // Radio 값 저장(주소를 입력하지 않을때)
  const handleRadioChange = (e) => {
    setSelectedAddress(e.target.value);

    setChangeReceiver("");
    setChangeTel("");
    setChangeZip("");
    setChangeAddress("");
  };
  // 배송지 주소 입력할때
  const handleAddressChange = (e) => {
    // 입력을 하는 라디오 버튼을 클릭해도 값이 대입이 안되니까 값을 셋팅한다
    setSelectedAddress(e.target.value);
    setChangeAddress(e.target.value);
  }
  // 우편번호
  const handleZipChange = (e) => {
    setChangeZip(e.target.value);
  }
  // 수신자 이름
  const handleReceiverChange = (e) => {
    setChangeReceiver(e.target.value);
  }
  // 수신자 전화번호
  const handleTelChange = (e) => {
    setChangeTel(e.target.value);
  }
  // 국가지정
  const handleCountry = (value) => {
    setCountry(value);
  }
  // Logout
  const handleLogout = async () => {
    try {
        await axios.get(`${USER_SERVER}/logout?id=${userId}`);
        // 로컬스토리지 사용자 정보 삭제
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        localStorage.removeItem("userRole");
        localStorage.removeItem("i18nextLng");
        // 세션스토리지 사용자 정보 삭제
        sessionStorage.removeItem("userId");
        sessionStorage.removeItem("userName");
        // 세션스토리지 랜딩페이지 비디오 정보 삭제
        sessionStorage.removeItem("video_cn");
        sessionStorage.removeItem("video_en");
        sessionStorage.removeItem("video_jp");
        // 토큰 연장시간 삭제
        sessionStorage.removeItem("tokenAddedTime");
        // 포인트 적용률 삭제
        sessionStorage.removeItem("pointRate");
        // 쿠키 삭제
        removeCookie('w_auth');
        removeCookie('w_authExp');
    } catch (err) {
        console.log("err: ", err);
        alert("Please contact the administrator");
    }
  }

  // 임시 주문정보 저장, UPC 데이타 전송
  const sendPaymentInfo = async (e) => {
    e.preventDefault();

    try {
      let body = {
        type: "Wechat",
        userId: idRef.current,
        name: nameRef.current,
        lastName: lastNameRef.current,
        tel: telRef.current,
        email: emailRef.current,
        address: SelectedAddress,
        country: Country,
        // 카트에서 온 경우 유니크필드의 결제일자를 sodRef에 대입했고 
        // 라이브에서 이동된 경우는 sod에 결제일자만 들어있어서 그대로 sodRef에 대입했다 
        sod: sodRef.current,
        // tmpOrder에 등록할때는 userId를 붙이지 않은 uniqueFieldRef로 등록한다
        // userId를 붙이면 50자가 넘어서 검색이 안되기 때문이다
        uniqueField: uniqueFieldRef.current,
        amount: siam1Ref.current,
        staffName: staffNameRef.current,
        paymentStatus: UNIDENTIFIED,
        deliveryStatus: UNIDENTIFIED
      }

      // 선택된 주소의 수취인 정보를 설정하기
      if (SelectedAddress === address1Ref.current) {
        body.receiver = receiver1Ref.current;
        body.receiverTel = tel1Ref.current;
        body.zip = zip1Ref.current;
      }
      if (SelectedAddress === address2Ref.current) {
        body.receiver = receiver2Ref.current;
        body.receiverTel = tel2Ref.current;
        body.zip = zip2Ref.current;
      }
      if (SelectedAddress === address3Ref.current) {
        body.receiver = receiver3Ref.current;
        body.receiverTel = tel3Ref.current;
        body.zip = zip3Ref.current;
      }
      
      // 주소를 입력한 경우 또는 불특정 사용자인 경우
      if (SelectedAddress === ChangeAddress) {
        // 받는사람
        if (ChangeReceiver === "") {
          alert("Please enter the recipient's name");
          return false;
        }
        // 전화번호
        if (ChangeTel === "") {
          alert("Please enter the recipient's phone number");
          return false;
        }
        // 받는사람의 전화번호가 숫자인지
        if (isNaN(ChangeTel)){
          alert("Please enter only numbers for the recipient's phone number");
          return false;
        }
        // 라디오 선택만 하고 주소값을 대입하지 않은경우
        if (ChangeAddress === "") {
          alert("Please enter the recipient's address");
          return false;
        }
        
        body.receiver = ChangeReceiver;
        body.receiverTel = ChangeTel;
        body.zip = ChangeZip;
      }

      // 임시 주문정보 저장
      const tmpOrderResult = await axios.post(`${ORDER_SERVER}/tmpRegister`, body);
      if (tmpOrderResult.data.success) {
        // 붙특정 사용자인 경우 아이디 및 로그인 정보를 삭제한다
        if (nameRef.current.substring(0, 9) === ANONYMOUS) {
          // 사용자 삭제
          await axios.post(`${USER_SERVER}/delete`, {userId : idRef.current});
          // 세션삭제
          sessionStorage.removeItem("userId");
          sessionStorage.removeItem("userName");
          // 쿠키삭제
          removeCookie('w_auth');
          removeCookie('w_authExp');
        } else {
          // 일반 사용자는 UPC에 접속하기 전에 로그아웃 시킨다
          handleLogout();
        }
      } else {
        alert("Please contact the administrator");
        return false;
      }
      
      let arr = uniqueField.split('_');
      if (arr[0].trim() === "cart") {
        // redirect를 위해 userId를 붙여서 UPC에 전송한다
        // 위쳇결제는 결제후 리다이렉드는 안되지만 알리페이와 동일하게 로그인 아이디를 추가한다
        // Cart에서 온 경우는 uniqueField에 로그인 아이디가 없어서 로그인 아이디를 추가한다
        // Live에서 이동된 경우 paymentId 대신 userId가 들어있어서 userId를 붙이지 않아도 된다
        uniqueFieldRef.current = uniqueFieldRef.current + '_' + userId;
      } else {
        // 카트에서 이동된 경우는 sod에 포인트가 추가되어 있어서 동일하게
        // Live도 로그인한 사용자가 사용하니깐 포인트 누적이 가능하도록 sod에 포인트를 추가한다
        // Live에서 이동된 경우 총금액에 해당하는 포인트를 구한다 (소숫점을 자른다)
        acquisitionPointsRef.current = percent(siam1, sessionStorage.getItem("pointRate"));
        sod = acquisitionPointsRef.current + "_" + sod;
      }
  
      // UPC 데이타 전송(위쳇 결제 처리)
      let weChatQueryString = {
        'sid': sid,
        'svid': '23',
        'ptype': '8',
        'job': 'REQUEST',
        'rt': '4', // wechat만 있는 항목
        'sod': sod, // tmpOrder에 등록하는 sod는 결제일자만 들어있는 sodRef를 대입하고, 위쳇에 전송하는 sod는 포인트가 들어있다.
        'tn': telRef.current,
        'em': emailRef.current,
        'lang': 'cn',
        'sinm1': 'Furuokadrug Product',
        'siam1': siam1Ref.current, // 상품금액
        'sisf1': '0', // 배송요금
        'method': 'QR',
        'uniqueField': uniqueFieldRef.current
      }
      
      // Query string작성
      let url = UPC_PAYMENT;
      Object.keys(weChatQueryString).forEach(function(key, index) {
        url = url + (index === 0 ? "?" : "&") + key + "=" + weChatQueryString[key];
      });
  
      // 로컬에서 하면 localhost에서 보내는 거라서 UPC에서 거절당한다
      // 테스트를 하려면 아래와 같이 DB에 직접 데이타를 보내서 해야 한다
      // ##########################TEST##########################
      // const paymentResult = axios.get(`${PAYMENT_SERVER}/wechat/register?rst=1&pid=1239&sod=${sod}&uniqueField=${uniqueFieldRef.current}`);
      // ##########################TEST##########################  

      // 윈도우 오픈(UPC화면을 기존 탭에 열리도록 한다)
      window.open(url, "_self");

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
      
      <Form style={{ height:'80%', margin:'1em' }} {...formItemLayout} onSubmit={sendPaymentInfo} >
        {/* 일반 사용자 */}
        { roleRef.current !== 3 && 
          <>
            <Form.Item label="Name">
              <Input type="text" style={{ width: '95%', backgroundColor: '#f2f2f2' }} value={nameRef.current} readOnly />
            </Form.Item>
            <Form.Item label="LastName">
              <Input type="text" style={{ width: '95%', backgroundColor: '#f2f2f2' }} value={lastNameRef.current} readOnly />
            </Form.Item>
            <Form.Item label="Email">
              <Input type="text" style={{ width: '95%', backgroundColor: '#f2f2f2' }} value={emailRef.current} readOnly />
            </Form.Item>
            {/* 국가는 여기서 선택해서 등록하도록 한다 */}
            <Form.Item required label={'Country'} >
              <Select style={{ width: '55%' }} value={Country} onChange={handleCountry}>
                {Code.map(item => (
                  <Option key={item} value={item}> {item} </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item required label="Address">
              <Radio.Group onChange={handleRadioChange} value={SelectedAddress}>
                <Tooltip title={address1Ref.current}>
                  <Radio value={address1Ref.current}>
                    {shortAddress1Ref.current}&nbsp;&nbsp;{receiver1Ref.current}&nbsp;&nbsp;{tel1Ref.current}
                  </Radio>
                </Tooltip>
                <br />
                <br />
                { address2Ref.current !== "" && 
                  <>
                    <Tooltip title={address2Ref.current}>
                      <Radio value={address2Ref.current}>
                        {shortAddress2Ref.current}&nbsp;&nbsp;{receiver2Ref.current}&nbsp;&nbsp;{tel2Ref.current}
                      </Radio> 
                    </Tooltip>
                    <br />
                    <br />
                  </>
                }
                { address3Ref.current !== "" && 
                  <>
                    <Tooltip title={address3Ref.current}>
                      <Radio value={address3Ref.current}>
                        {shortAddress3Ref.current}&nbsp;&nbsp;{receiver3Ref.current}&nbsp;&nbsp;{tel3Ref.current}
                      </Radio> 
                    </Tooltip>
                    <br />
                    <br />
                  </>
                }
                <Radio value={ChangeAddress}>
                  <Input.Group compact>
                    <Input type="text" style={{ width: '30%' }} placeholder="Name" value={ChangeReceiver} onChange={handleReceiverChange} />&nbsp;
                    <Input type="text" style={{ width: '30%' }} placeholder="Tel" value={ChangeTel} onChange={handleTelChange} />&nbsp;
                    <Input type="text" style={{ width: '29%' }} placeholder="Zip" value={ChangeZip} onChange={handleZipChange} />
                    <br />
                    <br />
                    <Input type="text" style={{ width: '91%' }} placeholder="Enter address" value={ChangeAddress} onChange={handleAddressChange} />
                  </Input.Group>
                </Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="Amount">
              <Input type="text" style={{ width: '95%', backgroundColor: '#f2f2f2' }} value={Number(siam1Ref.current).toLocaleString()} readOnly />
            </Form.Item>
          </>
        }
        {/* 불특정 사용자 */}
        { roleRef.current === 3 && 
          <>
            {/* 국가 */}
            <Form.Item required label={'Country'} >
              <Select style={{ width: '55%' }} value={Country} onChange={handleCountry}>
                {Code.map(item => (
                  <Option key={item} value={item}> {item} </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item required label={'Name'}>
              <Input type="text" style={{ width: '55%' }} placeholder="Name" value={ChangeReceiver} onChange={handleReceiverChange} />
            </Form.Item>
            <Form.Item required label={'Tel'}>
              <Input type="text" style={{ width: '55%' }} placeholder="Tel" value={ChangeTel} onChange={handleTelChange} />
            </Form.Item>
            <Form.Item label={'Zip'}>
              <Input type="text" style={{ width: '55%' }} placeholder="Zip" value={ChangeZip} onChange={handleZipChange} />
            </Form.Item>
            <Form.Item required label={'Address'}>
              <Input type="text" placeholder="Address" value={ChangeAddress} onChange={handleAddressChange} />
            </Form.Item>
            <Form.Item label="Amount">
              <Input type="text" style={{ width: '55%', backgroundColor: '#f2f2f2' }} value={Number(siam1Ref.current).toLocaleString()} readOnly />
            </Form.Item>
          </>
        }

        <Form.Item {...tailFormItemLayout}>
          <Button htmlType="submit" type="primary">
            Send
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default WechatConfirmPage;