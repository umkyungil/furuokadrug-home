import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PAYMENT_SERVER } from '../../Config.js';
import { Button } from 'antd';

// CORS 대책
axios.defaults.withCredentials = true;

function TestPaymentResultAliPay() {
  // UnivaPayCast API
  const queryStringHandler = () => {
    axios.get(`${PAYMENT_SERVER}/alipay/register?pid=3000059&rst=1&ap=3000059&ec=ER000000000&sod=&ta=1500&job=SALES&pod1=1234&uniqueField=1234`)
      .then(response => {
        if (response.data.success) {
          console.log("OK");
        }
      })
  }

  return (
    <div style={{ width:'90%', padding:'3rem 4rem' }}>
      <div style={{ display:'flex', justifyContent:'center' }}>
        <h1>Test UnivaPayCast API</h1>
      </div>
      <br />
      <div style={{ display:'flex', justifyContent:'center' }}>
        <Button size="large" type="primary" onClick={queryStringHandler}>
          Submit
        </Button>
      </div>
    </div>
  )
}

export default TestPaymentResultAliPay