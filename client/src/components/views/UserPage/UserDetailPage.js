import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserInfo from './Sections/UserInfo'
import { Row, Col } from 'antd';
import { USER_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
// CORS 대책
axios.defaults.withCredentials = true;

function UserDetailPage(props) {
  const [User, setUser] = useState({});
  const userId = props.match.params.userId;
  const {t, i18n} = useTranslation();

  useEffect(() => {
    // 다국어 설정
    i18n.changeLanguage(localStorage.getItem("i18nextLng"));
    // 사용자 정보 취득
    getUser(userId);
  }, [])

  // 사용자 정보 취득
  const getUser = async (userId) => {
    try {
      const result = await axios.get(`${USER_SERVER}/users_by_id?id=${userId}&type=single`);
      if (result.data.success) {
        setUser(result.data.user[0])
      }
    } catch (err) {
      console.log("UserDetailPage err: ",err);
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