import React, { useEffect, useState } from 'react';
import axios from 'axios';
import WechatInfo from './Sections/WechatInfo'
import { Row, Col } from 'antd';
import { PAYMENT_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
// CORS 대책
axios.defaults.withCredentials = true;

function DetailWechatPage(props) {
  const [Wechat, setWechat] = useState({});

  useEffect(() => {
    const wechatId = props.match.params.wechatId;
    // 알리페이 정보 취득
    getWechat(wechatId);
    // 다국적언어
    setMultiLanguage(localStorage.getItem("i18nextLng"));
  }, [])

  // 다국적언어 설정
	const {t, i18n} = useTranslation();
  function setMultiLanguage(lang) {
    i18n.changeLanguage(lang);
  }

  // 위쳇 정보 취득
  const getWechat = async (wechatId) => {
    try {
      const result = await axios.get(`${PAYMENT_SERVER}/wechat_by_id?id=${wechatId}&type=single`);
      if (result.data.success) {
        setWechat(result.data.wechat[0]);
      }
    } catch (err) {
      console.log("DetailWechatPage err: ",err);
    }
  }

  return (
    <div style={{ width:'100%', padding:'3rem 4rem' }}>
      <div style={{ display:'flex', justifyContent:'center' }}>
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

export default DetailWechatPage