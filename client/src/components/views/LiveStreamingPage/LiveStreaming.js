import React, { useState, useContext } from 'react'
import moment from 'moment';
import { LIVE_SERVER, MAIL_SERVER, USER_SERVER } from '../../Config';
import { useHistory } from 'react-router-dom';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext';
import axios from 'axios';
// CORS 대책
axios.defaults.withCredentials = true;

function LiveStreaming() {
  const history = useHistory();
  const [Body, setBody] = useState({});
  const [URL, setUrl] = useState("");
  const [ShowModal, setShowModal] = useState(false);
  const {isLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();
  
  React.useEffect(() => {
    // 다국어 설정
    i18n.changeLanguage(isLanguage);
    
    // 사용자정보 취득
    if (localStorage.getItem("userId")) {
      getUserInfo(localStorage.getItem("userId"))
    } else {
      alert("Please login");
      history.push("/login");
    }
    
    // 자식화면에서(비디오 채팅) 보낸 데이타를 수신 (결제금액등) 
    window.addEventListener('message', function(e) {
      // 라이브 채팅후 화면 이동할때 토큰 유효기간을 늘려준다
      updateTokenExp();

      // 비디오 채팅에서 결제버튼 클릭 했을때
      if(e.data.type !== "exitRoom") {
        const type = e.data.type;
        const loginUserId = e.data.loginUserId; // ECSystem 로그인 유저ID
        const sid = e.data.sid;
        const sod = e.data.sod;
        const siam1 = e.data.siam1; // amount
        const uniqueField = encodeURIComponent(e.data.uniqueField); // uniqueField = 'alipay' + '_' + loginUserId + '_' + uniqueDate;
        let staffName = encodeURIComponent(e.data.guestName);
        
        // 결제 페이지 호출
        // 화면이동으로 비디오 채팅창을 닫고 결제확인 화면으로 이동한다
        if (e.data.loginUserId && e.data.siam1) {
          if (type === 'alipay') {
            history.push(`/payment/alipay/confirm/${loginUserId}/${sid}/${sod}/${siam1}/${uniqueField}/${staffName}/`);
          } else if (type === 'wechat') {
            history.push(`/payment/wechat/confirm/${loginUserId}/${sid}/${sod}/${siam1}/${uniqueField}/${staffName}/`);
          } else {
            alert("Please contact the administrator");
          }
        }
      } else {
        // 비디오 채팅화면에서 종료버튼을 눌렀을때 랜딩페이지로 이동
        history.push("/");
      }
    })
  }, [])

  // 토큰 유효기간 연장
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

  // 사용자 정보 취득
  async function getUserInfo(userId) {
    try {
      const response = await axios.get(`${USER_SERVER}/users_by_id?id=${userId}`);
      if (response.data.success) {
        // 모달 뛰우고 메일및 주소정보 설정
        mainProcess(response.data.user[0]._id, response.data.user[0].name, response.data.user[0].lastName, 
          response.data.user[0].email, parseInt(response.data.user[0].role));
      } else {
        alert("Failed to get user information.")
      }
    } catch (err) {
      console.log("err: ",err);
      alert("Please contact the administrator");
    }
  }

  // 모달 뛰우고 사용자가 룸인 했을때 관리자에게 보낼 메일내용 및 URL설정
  function mainProcess(userId, name, lastName, email, role ) {
    let date = new Date();
    // 룸넘버 설정(일시분초)
    let room = date.getFullYear().toString();
    room = room +  (date.getMonth() + 1).toString();
    room = room + date.getDate().toString();
    room = room + date.getHours().toString();
    room = room + date.getMinutes().toString();
    // 룸인 시간 설정    
    const roomInTime = moment(date).format('YYYY-MM-DD HH:mm:ss');
    // 메일용의 성명
    const fullName = name + " " + lastName;
    // 라이브 스트리밍에 전달할 다국어
    const i18n = localStorage.getItem("i18nextLng");

    // 일반 사용자 
    if (role === 0) {
      // 모달창 보여주기
      showModal();
      // 메일내용 보관
      const body = { from: email, fullName: fullName, room: room, roomInTime: roomInTime };
      setBody(body);
      // URL작성: 일반 사용자는 룸에 들어간 화면을 표시
      setUrl(LIVE_SERVER + "meet?name=" + name + "&lastName=" +  lastName + "&room=" + room + "&userId=" + userId + "&i18nextLng=" + i18n + "&type=ec");
    } else {
      // URL작성: 스텝 및 관리자는 라이브 로그인 화면을 표시
      setUrl(LIVE_SERVER + "login?name=" + name + "&lastName=" +  lastName + "&userId=" + userId + "&i18nextLng=" + i18n + "&type=ec");
    }
  }  

  // 관리자에게 메일 송신
  async function sendEmail() {
    try {
      await axios.post(`${MAIL_SERVER}/live`, Body)
        .then(response => {
          if (response.data.success) {
            console.log('Notification email has been sent normally');
          } else {
            console.log('The call to the representative is being delayed.\nThank you for making a reservation.');
            history.push("/");
          }
        });
    } catch(err) {
      console.log("err: ",err);
      alert("Please contact the administrator");
    }
  }
  // 모달창 보여주기
  const showModal = (role) => {
    setShowModal(true)
  }
  // 모달창에서 OK버튼 처리
  const handleOk = (e) => {
    setShowModal(false);
    sendEmail();
  }
  // 모달창에서 취소버튼 처리
  const handleCancel = (e) => {
    setShowModal(false);
    history.push("/");
  }

  return (
    <div>
      <Modal
        title={t('Modal.title')}
        visible={ShowModal}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <p>{t('Modal.message')}</p>
      </Modal>
      <iframe style={{
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          width: '100%',
          height: '100%',
        }} allow="microphone; camera" src={URL} frameBorder="0" scrolling="yes"/>
    </div>
  )
}

export default LiveStreaming;