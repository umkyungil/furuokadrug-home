import React, { useState } from 'react'
import Moment from 'moment';
import { LIVE_SERVER, MAIL_SERVER, USER_SERVER } from '../../Config';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';

function LiveStreaming(props) {
  const history = useHistory();
  const [Body, setBody] = useState({});
  const [URL, setUrl] = useState("");
  const [Visible, setVisible] = useState(false);
  const [Result, setResult] = useState(false);
  const [I18nLanguage, setI18nLanguage] = useState("");
  
  React.useEffect(() => {
    // 다국어 설정
    setLanguage(localStorage.getItem("i18nextLng"));

    // 사용자정보 취득
    if (localStorage.getItem("userId")) {
      getUserInfo(localStorage.getItem("userId"))
    } else {
      history.push("/");
    }
    
    // 자식화면에서 송신한 데이타를 수신(비디오 채팅 결제금액등) 
    window.addEventListener('message', function(e) {
      if(e.data.type != "exitRoom") {
        const type = e.data.type;       
        const loginUserId = e.data.loginUserId; // ECSystem 로그인 유저ID
        const sid = e.data.sid;
        const sod = e.data.sod;
        const siam1 = e.data.siam1; // amount
        const uniqueField = encodeURIComponent(e.data.uniqueField);
        let staffName = encodeURIComponent(e.data.guestName);
        
        // 결제 페이지 호출
        if (e.data.loginUserId && e.data.siam1) {
          if (type === "alipay") {
            let url = `/payment/alipay/confirm/${loginUserId}/${sid}/${sod}/${siam1}/${uniqueField}/${staffName}`
            window.open(url);
          } else if (type === "wechat") {
            let url = `/payment/wechat/confirm/${loginUserId}/${sid}/${sod}/${siam1}/${uniqueField}/${staffName}`
            window.open(url);
          }
        }
      } else {
        // 비디오 채팅화면에서 종료버튼을 눌렀을때 랜딩페이지로 이동
        history.push("/");
      }
    })
  }, [localStorage.getItem('i18nextLng')])

  // 다국어 설정
	const {t, i18n} = useTranslation();
  function setLanguage(lang) {
    i18n.changeLanguage(lang);
    setI18nLanguage(lang);
  }

  // 사용자 정보 취득
  async function getUserInfo(userId) {
    await axios.get(`${USER_SERVER}/users_by_id?id=${userId}`)
      .then(response => {
        if (response.data.success) {
          // 모달 뛰우고 메일및 주소정보 설정
          process(response.data.user[0]._id, response.data.user[0].name, response.data.user[0].lastName, response.data.user[0].email, response.data.user[0].role)
        } else {
          alert("Failed to get user information.")
        }
      })
  }

  // 모달 뛰우고 메일내용및 URL설정
  function process(userId, name, lastName, email, role ) {
    let date = new Date();
    // 룸넘버 설정(일시분초)
    let room = date.getFullYear().toString();
    room = room +  (date.getMonth() + 1).toString();
    room = room + date.getDate().toString();
    room = room + date.getHours().toString();
    room = room + date.getMinutes().toString();
    // 룸인 시간 설정    
    const roomInTime = Moment(date).format('YYYY-MM-DD HH:mm:ss');
    // 메일용의 성명
    const fullName = name + " " + lastName;
    // 라이브 스트리밍에 전달할 다국어
    const i18n = localStorage.getItem("i18nextLng");

    // 일반 사용자 
    if (role === 0) {
      // 모달창 보여주기
      showModal();
      
      // 관리자에 보낼 메일내용 설정
      let message = "管理者 様\n"
      message = message + "\n下記の顧客からライブストリーミングの依頼がございました。\nご対応をお願いいたします。\n";
      message = message + "------------------------------------------------------------\n";
      message = message + "\n【顧客名         】    " + fullName
      message = message + "\n【ルームNo      】    "  + room 
      message = message + "\n【ルームイン時刻 】    "  + roomInTime
      const body = {
        subject: "顧客対応の依頼",
        from: email,
        to: "umkyungil@hirosophy.co.jp", //"info@furuokadrug.com", 관리자메일 주소
        message: message
      }
      
      // 메일내용 보관
      setBody(body);
      // 일반 사용자의 다이렉트 URL 작성
      setUrl(LIVE_SERVER + "meet?name=" + name + "&lastName=" +  lastName + "&room=" + room + "&userId=" + userId + "&i18nextLng=" + i18n + "&type=ec");
      
    // 스텝 및 관리자는 라이브 초기화면을 표시
    } else {
      setUrl(LIVE_SERVER + "login?name=" + name + "&lastName=" +  lastName + "&userId=" + userId + "&i18nextLng=" + i18n + "&type=ec");
    }
  }  

  // 메일 송신
  async function sendEmail() {
    await axios.post(`${MAIL_SERVER}/notice`, Body)
      .then(response => {
        if (response.data.success) {
          console.log('Notification email has been sent normally');
        } else {
          alert('The call to the representative is being delayed.\nThank you for making a reservation.');
          history.push("/");
        }
      });
  }

  // 모달창 보여주기
  const showModal = (role) => {
    setVisible(true)
  }
  // 모달창에서 OK버튼 처리
  const handleOk = (e) => {
    setVisible(false);
    sendEmail();
  }
  // 모달창에서 취소버튼 처리
  const handleCancel = (e) => {
    setVisible(false);
    history.push("/");
  }

  return (
    <div>
      <Modal
        title={t('Modal.title')}
        visible={Visible}
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

export default LiveStreaming