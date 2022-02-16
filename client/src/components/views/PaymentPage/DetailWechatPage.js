import React, { useEffect, useState } from 'react';
import axios from 'axios';
import WechatInfo from './Sections/WechatInfo'
import { Row, Col } from 'antd';
import { PAYMENT_SERVER } from '../../Config.js';
// CORS 대책
axios.defaults.withCredentials = true;

function DetailAlipayPage(props) {
  const [Wechat, setWechat] = useState({});
  const wechatId = props.match.params.wechatId;

  useEffect(() => {
    axios.get(`${PAYMENT_SERVER}/wechat_by_id?id=${wechatId}&type=single`)
      .then(response => {
        if (response.data.success) {
          setWechat(response.data.wechat[0])
        } else {
          alert("Failed to get Wechat payment result information.")
        }
      })
  }, [])

  return (
    <div style={{ width:'100%', padding:'3rem 4rem' }}>
      <div style={{ display:'flex', justifyContent:'center' }}>
        <h1>Wechat payment result</h1>
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

export default DetailAlipayPage