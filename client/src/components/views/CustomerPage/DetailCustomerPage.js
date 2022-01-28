import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CustomerInfo from './Sections/CustomerInfo'
import { Row, Col } from 'antd';
import { CUSTOMER_SERVER } from '../../Config.js';
// CORS 대책
axios.defaults.withCredentials = true;

function DetailCustomerPage(props) {
  const [Customer, setCustomer] = useState({});
  const customerId = props.match.params.customerId;

  useEffect(() => {
    axios.get(`${CUSTOMER_SERVER}/customers_by_id?id=${customerId}&type=single`)
      .then(response => {
        if (response.data.success) {
          setCustomer(response.data.customer[0])
        } else {
          alert("Failed to get customer information.")
        }
      })
  }, [])

  return (
    <div style={{ width:'100%', padding:'3rem 4rem' }}>
      <div style={{ display:'flex', justifyContent:'center' }}>
        <h1>Customer Info</h1>
      </div>
      <br />
      
      {/* 여백설정 */}
      <Row gutter={[16, 16]} >
        <Col lg={32} sm={24}>
          {/* ProductInfo */}
          <CustomerInfo detail={Customer} />
        </Col>
      </Row>
    </div>
  )
}

export default DetailCustomerPage