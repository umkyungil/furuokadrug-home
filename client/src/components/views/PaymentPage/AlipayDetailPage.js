import React, { useEffect, useState, useContext } from 'react';
import AlipayInfo from './Sections/AlipayInfo'
import { Row, Col } from 'antd';
import { PAYMENT_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';

import { LanguageContext } from '../../context/LanguageContext';
import '../ProductPage/Sections/product.css';
import { getLanguage, setHtmlLangProps } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

function AlipayDetailPage(props) {
  const [Alipay, setAlipay] = useState({});
  const {isLanguage, setIsLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  useEffect(() => {
    // 다국어 설정
    const lang = getLanguage(isLanguage);
    i18n.changeLanguage(lang);
    setIsLanguage(lang);

    // HTML lang속성 변경
    setHtmlLangProps(lang);

    // 알리페이 정보 취득
    getAlipay(props.match.params.alipayId);
  }, [isLanguage])

  // 알리페이 정보 취득
  const getAlipay = async (alipayId) => {
    try {
      const result = await axios.get(`${PAYMENT_SERVER}/alipay_by_id?id=${alipayId}&type=single`);
      if (result.data.success) {
        setAlipay(result.data.alipay[0]);
      }
    } catch (err) {
      console.log("AlipayDetailPage err: ",err);
    }
  }

  return (
    <div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} style={{ width:'80%', margin: '3rem auto'}}>
      <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
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

export default AlipayDetailPage;