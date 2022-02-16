import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AlipayInfo from './Sections/AlipayInfo'
import { Row, Col } from 'antd';
import { PAYMENT_SERVER } from '../../Config.js';
// CORS 대책
axios.defaults.withCredentials = true;

function DetailAlipayPage(props) {
  const [Alipay, setAlipay] = useState({});
  const alipayId = props.match.params.alipayId;

  useEffect(() => {
    axios.get(`${PAYMENT_SERVER}/alipay_by_id?id=${alipayId}&type=single`)
      .then(response => {
        if (response.data.success) {
          setAlipay(response.data.alipay[0])
        } else {
          alert("Failed to get Alipay payment result information.")
        }
      })
  }, [])

  return (
    <div style={{ width:'100%', padding:'3rem 4rem' }}>
      <div style={{ display:'flex', justifyContent:'center' }}>
        <h1>Alipay payment result</h1>
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