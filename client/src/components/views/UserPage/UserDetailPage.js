import React, { useEffect, useContext } from 'react';
import UserInfo from './Sections/UserInfo'
import { Row, Col } from 'antd';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext';
import '../ProductPage/Sections/product.css';
import { getLanguage } from '../../utils/CommonFunction';

function UserDetailPage(props) {
  const userId = props.match.params.userId;
  const {isLanguage, setIsLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  useEffect(() => {
    // 다국어 설정
    i18n.changeLanguage(isLanguage);
  }, [])

  return (
    <div style={{ width:'100%', padding:'3rem 4rem' }}>
      <div style={{ textAlign: 'center', paddingTop: '38px' }}>
        <h1>{t('User.detailTitle')}</h1>
      </div>
      <br />
      
      {/* 여백설정 */}
      <Row gutter={[16, 16]} >
        <Col lg={32} sm={24}>
          {/* ProductInfo */}
          <UserInfo userId={userId} />
        </Col>
      </Row>
    </div>
  )
}

export default UserDetailPage;