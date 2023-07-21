import React, { useEffect, useState, useContext } from 'react';
import WechatInfo from './Sections/WechatInfo'
import { Row, Col } from 'antd';
import { PAYMENT_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext';
import axios from 'axios';
// CORS 대책
axios.defaults.withCredentials = true;

function WechatDetailPage(props) {
  const [Wechat, setWechat] = useState({});
  const {isLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  useEffect(() => {
    const wechatId = props.match.params.wechatId;
    // 알리페이 정보 취득
    getWechat(wechatId);
    // 다국적언어
    i18n.changeLanguage(isLanguage);
  }, [])

  // 위쳇 정보 취득
  const getWechat = async (wechatId) => {
    try {
      const result = await axios.get(`${PAYMENT_SERVER}/wechat_by_id?id=${wechatId}&type=single`);
      if (result.data.success) {
        setWechat(result.data.wechat[0]);
      }
    } catch (err) {
      console.log("WechatDetailPage err: ",err);
    }
  }

  return (
    <div style={{ width:'80%', margin: '3rem auto'}}>
      <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
        <h1>{t('Wechat.detailTitle')}</h1>
      </div>
      <br />
      
      {/* 여백설정 */}
      <Row gutter={[16, 16]} >
        <Col lg={32} sm={24}>
          {/* ProductInfo */}
          <WechatInfo detail={Wechat} />
        </Col>
      </Row>
    </div>
  )
}

export default WechatDetailPage;