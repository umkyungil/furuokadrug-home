import React, { useEffect, useContext, useState } from 'react';
import { Row, Col, Button, Descriptions } from 'antd';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { NOTHING, ENGLISH, JAPANESE, CHINESE, I18N_ENGLISH, I18N_CHINESE, I18N_JAPANESE } from '../../utils/Const';
import { LanguageContext } from '../../context/LanguageContext';
import { USER_SERVER } from '../../Config';
import '../ProductPage/Sections/product.css';
import { getLanguage } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

function MyInfoDetailPage() {
  const [User, setUser] = useState({});
  const history = useHistory();
  const {isLanguage, setIsLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  useEffect(() => {
		// 다국어 설정
    i18n.changeLanguage(isLanguage);
    
    process();
	}, [])

  const process = async () => {
    // 사용자정보 가져오기
    const userInfo = await getUserInfo();

    // 주소값1 변경
    if (userInfo.address1) {
      if (userInfo.address1.length > 21) {
        userInfo.address1 = userInfo.address1.slice(0, 21)
        userInfo.address1 = userInfo.address1 + "...";
      }
    }
    // 주소값2 변경
    if (userInfo.address2) {
      if (userInfo.address2.length > 21) {
        userInfo.address2 = userInfo.address2.slice(0, 21)
        userInfo.address2 = userInfo.address2 + "...";
      }
    }
    // 주소값3 변경
    if (userInfo.address3) {
      if (userInfo.address3.length > 21) {
        userInfo.address3 = userInfo.address3.slice(0, 21);
        userInfo.address3 = userInfo.address3 + "...";
      }
    }
    // 언어값 변경
    if (userInfo.language === I18N_ENGLISH) userInfo.language = ENGLISH;
    if (userInfo.language === I18N_CHINESE) userInfo.language = CHINESE;
    if (userInfo.language === I18N_JAPANESE) userInfo.language = JAPANESE;

    // 최근 로그인날짜 변형(date 추가)
    if (userInfo.lastLogin) {
      let tmpDate = new Date(userInfo.lastLogin);

      let lastLoginDate = new Date(tmpDate.getTime() - (tmpDate.getTimezoneOffset() * 60000)).toISOString();
      userInfo.lastLogin = lastLoginDate.replace('T', ' ').substring(0, 19) + ' (JST)';
    } else {
      userInfo.lastLogin = NOTHING;
    }
    
    setUser(userInfo);
  }

  // 사용자 정보 가져오기
  const getUserInfo = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const userInfo = await axios.get(`${USER_SERVER}/users_by_id?id=${userId}&type=single`);

      if (userInfo.data.success) {
        return userInfo.data.user[0];
      }
    } catch (err) {
      console.log("err: ",err);
    }
  }
  
  const handleModify = () => {
    history.push(`/myInfo/update/${User._id}`);
  }
  
  return (
    <div style={{ width:'100%', padding:'3rem 4rem' }}>
      <div style={{ textAlign: 'center', paddingTop: '38px' }}>
        <h1>MyInfo detail</h1>
      </div>
      <br />
      
      {/* 여백설정 */}
      <Row gutter={[16, 16]} >
        <Col lg={32} sm={24}>
          {/* ProductInfo */}
          <div>
            <Descriptions>
              <Descriptions.Item label={t('User.lastName')}>{User.lastName}</Descriptions.Item>
              <Descriptions.Item label={t('User.name')}>{User.name}</Descriptions.Item>
              <Descriptions.Item label={t('User.birth')}>{User.birthday}</Descriptions.Item>
              <Descriptions.Item label={t('User.tel')}>{User.tel}</Descriptions.Item>
              <Descriptions.Item label={t('User.email')}>{User.email}</Descriptions.Item>
              <Descriptions.Item label={t('User.point')}>{User.myPoint}</Descriptions.Item>
              <Descriptions.Item label={t('User.address1')}>{User.address1}</Descriptions.Item>
              <Descriptions.Item label={t('User.zip1')}>{User.zip1}</Descriptions.Item>
              <Descriptions.Item label={t('User.receiver1')}>{User.receiver1}</Descriptions.Item>
              <Descriptions.Item label={t('User.tel1')}>{User.tel1}</Descriptions.Item>
              <Descriptions.Item label={t('User.address2')}>{User.address2}</Descriptions.Item> 
              <Descriptions.Item label={t('User.zip2')}>{User.zip2}</Descriptions.Item>
              <Descriptions.Item label={t('User.receiver2')}>{User.receiver2}</Descriptions.Item>
              <Descriptions.Item label={t('User.tel2')}>{User.tel2}</Descriptions.Item>
              <Descriptions.Item label={t('User.address3')}>{User.address3}</Descriptions.Item>
              <Descriptions.Item label={t('User.zip3')}>{User.zip3}</Descriptions.Item>
              <Descriptions.Item label={t('User.receiver3')}>{User.receiver3}</Descriptions.Item>
              <Descriptions.Item label={t('User.tel3')}>{User.tel3}</Descriptions.Item>
              <Descriptions.Item label={t('User.language')}>{User.language}</Descriptions.Item>
              <Descriptions.Item label={t('User.lastLogin')}>{User.lastLogin}</Descriptions.Item>
            </Descriptions>

            <br />
            <br />
            <br />
            <div style={{ display: 'flex', justifyContent: 'center' }} >
              <Button type="primary" onClick={handleModify}>
                Modify
              </Button>
            </div>
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default MyInfoDetailPage;