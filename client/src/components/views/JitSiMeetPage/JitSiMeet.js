import React, { useState, useContext } from 'react'
import { USER_SERVER } from '../../Config';
import { useHistory } from 'react-router-dom';
import { Modal } from 'antd';
import { useTranslation } from 'react-i18next';

import { LanguageContext } from '../../context/LanguageContext';
import { getLanguage, setHtmlLangProps, getMessage } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

function JitSiMeet() {
  const history = useHistory();
  const [URL, setUrl] = useState("");
  const [Visible, setVisible] = useState(false);
  const {isLanguage, setIsLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();
  
  React.useEffect(() => {
    // 다국어 설정
    const lang = getLanguage(isLanguage);
    i18n.changeLanguage(lang);
    setIsLanguage(lang);

    // HTML lang속성 변경
    setHtmlLangProps(lang);
    
    // 사용자정보 취득
    if (localStorage.getItem("userId")) {
      getUserInfo(localStorage.getItem("userId"))
    } else {
      alert(getMessage(getLanguage(), 'key079'));
      history.push("/login");
    }
  }, [isLanguage])

  // 사용자 정보 취득
  async function getUserInfo(userId) {
    try {
      const response = await axios.get(`${USER_SERVER}/users_by_id?id=${userId}`);
      if (response.data.success) {
        // 모달 뛰우고 메일및 주소정보 설정
        mainProcess();
      } else {        
        alert(getMessage(getLanguage(), 'key070'));
      }
    } catch (err) {
      console.log("JitSiMeet getUserInfo err: ",err);
      alert(getMessage(getLanguage(), 'key001'));
    }
  }

  // 모달 뛰우고 사용자가 룸인 했을때 관리자에게 보낼 메일내용 및 URL설정
  function mainProcess() {
    // 모달창 보여주기
    showModal();
    // URL작성: 일반 사용자는 룸에 들어간 화면을 표시
    setUrl('https://meet.jit.si/');
  }  

  // 모달창 보여주기
  const showModal = (role) => {
    setVisible(true)
  }
  // 모달창에서 OK버튼 처리
  const handleOk = (e) => {
    setVisible(false);
  }
  // 모달창에서 취소버튼 처리
  const handleCancel = (e) => {
    setVisible(false);
    history.push("/");
  }

  return (
    <div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'}>
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

export default JitSiMeet;