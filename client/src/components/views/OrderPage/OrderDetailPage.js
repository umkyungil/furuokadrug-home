import React, { useEffect, useState, useContext } from 'react';
import OrderInfo from './Sections/OrderInfo'
import { Row, Col } from 'antd';
import { ORDER_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';

import { LanguageContext } from '../../context/LanguageContext';
import '../ProductPage/Sections/product.css';
import { getLanguage, setHtmlLangProps } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

function OrderDetailPage(props) {
  const [Order, setOrder] = useState({});
  const orderId = props.match.params.orderId;
  const {isLanguage, setIsLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  useEffect(() => {
    // 다국어 설정
    const lang = getLanguage(isLanguage);
    i18n.changeLanguage(lang);
    setIsLanguage(lang);

    // HTML lang속성 변경
    setHtmlLangProps(lang);

    axios.get(`${ORDER_SERVER}/orders_by_id?id=${orderId}`)
      .then(response => {
        if (response.data.success) {
          setOrder(response.data.orders[0]);
          // 다국적언어 설정
          i18n.changeLanguage(lang);
        } else {
          alert("Failed to get order information");
        }
      })
  }, [isLanguage])

  return (
    <div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} style={{ width:'80%', margin: '3rem auto'}}>
			<div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
				<h1>{t('Order.detailTitle')}</h1>
			</div>
      <br />
      
      {/* 여백설정 */}
      <Row gutter={[16, 16]} >
        <Col lg={32} sm={24}>
          {/* ProductInfo */}
          <OrderInfo detail={ Order } />
        </Col>
      </Row>
    </div>
  )
}

export default OrderDetailPage;