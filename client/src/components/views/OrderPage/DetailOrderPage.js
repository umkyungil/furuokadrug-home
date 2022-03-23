import React, { useEffect, useState } from 'react';
import axios from 'axios';
import OrderInfo from './Sections/OrderInfo'
import { Row, Col } from 'antd';
import { ORDER_SERVER } from '../../Config.js';
// CORS 대책
axios.defaults.withCredentials = true;

function DetailOrderPage(props) {
  const [Order, setOrder] = useState({});
  const orderId = props.match.params.orderId;

  useEffect(() => {
    axios.get(`${ORDER_SERVER}/orders_by_id?id=${orderId}`)
      .then(response => {
        if (response.data.success) {
          setOrder(response.data.order[0])
        } else {
          alert("Failed to get order information.")
        }
      })
  }, [])

  return (
    <div style={{ width:'100%', padding:'3rem 4rem' }}>
      <div style={{ display:'flex', justifyContent:'center' }}>
        <h1>Order Info</h1>
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

export default DetailOrderPage