import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AlipayInfo from './Sections/AlipayInfo'
import { Row, Col } from 'antd';
import { PAYMENT_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
// CORS 대책
axios.defaults.withCredentials = true;

function DetailAlipayPage(props) {
  const [Alipay, setAlipay] = useState({});
  const {t, i18n} = useTranslation();

  useEffect(() => {
    const alipayId = props.match.params.alipayId;
    // 알리페이 정보 취득
    getAlipay(alipayId);
    // 다국적언어
    i18n.changeLanguage(localStorage.getItem("i18nextLng"));
  }, [])

  // 알리페이 정보 취득
  const getAlipay = async (alipayId) => {
    try {
      const result = await axios.get(`${PAYMENT_SERVER}/alipay_by_id?id=${alipayId}&type=single`);
      if (result.data.success) {
        setAlipay(result.data.alipay[0]);
      }
    } catch (err) {
      console.log("DetailAlipayPage err: ",err);
    }
  }

  return (
    <div style={{ width:'100%', padding:'3rem 4rem' }}>
      <div style={{ display:'flex', justifyContent:'center' }}>
        <h1>{t('Alipay.detailTitle')}</h1>
      </div>
      <br />
      
      {/* 여백설정 */}
      <Row gutter={[16, 16]} >
        <Col lg={32} sm={24}>
          {/* ProductInfo */}
          <AlipayInfo detail={Alipay} />
        </Col>
      </Row>
    </div>
  )
}

export default DetailAlipayPage