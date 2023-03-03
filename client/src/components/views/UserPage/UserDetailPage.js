import React, { useEffect, useState, useContext } from 'react';
import UserInfo from './Sections/UserInfo'
import { Row, Col } from 'antd';
import { getUser } from '../../utils/CommonFunction';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext';
import axios from 'axios';
// CORS 대책
axios.defaults.withCredentials = true;

function UserDetailPage(props) {
  const [User, setUser] = useState({});
  const userId = props.match.params.userId;
  const {isLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  useEffect(() => {
    // 다국어 설정
    i18n.changeLanguage(isLanguage);
    // 사용자 정보 취득
    getUserInfo(userId);
  }, [])
  
  // 사용자 정보 가져오기
  const getUserInfo = async (userId) => {
    try {
      const userInfo = await getUser(userId);
      // 사용자 정보를 상태에 저장하기
      setUser(userInfo);
    } catch (err) {
      console.log("UserDetailPage userInfo err: ",err);
    }
  }

  return (
    <div style={{ width:'100%', padding:'3rem 4rem' }}>
      <div style={{ display:'flex', justifyContent:'center' }}>
        <h1>{t('User.detailTitle')}</h1>
      </div>
      <br />
      
      {/* 여백설정 */}
      <Row gutter={[16, 16]} >
        <Col lg={32} sm={24}>
          {/* ProductInfo */}
          <UserInfo detail={User} />
        </Col>
      </Row>
    </div>
  )
}

export default UserDetailPage