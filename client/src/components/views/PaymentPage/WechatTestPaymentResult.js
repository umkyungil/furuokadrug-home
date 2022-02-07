import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PAYMENT_SERVER } from '../../Config.js';
import { Button } from 'antd';

// CORS 대책
axios.defaults.withCredentials = true;

function WechatTestPaymentResult() {
  // UnivaPayCast API
  const queryStringHandler = () => {
    axios.get(`${PAYMENT_SERVER}/wechat/register?pid=2005128&rst=1&ap=2005128&ec=ER000000000&sod=オーダー番号&ta=1500&job=SALES&pod1=1&bank_type=CFT&uniqueField=1234`)
      .then(response => {
        if (response.data.success) {
          console.log("success");
        } 
      })
  }

  return (
    <div style={{ width:'90%', padding:'3rem 4rem' }}>
      <div style={{ display:'flex', justifyContent:'center' }}>
        <h1>Wechat test payment result</h1>
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

export default WechatTestPaymentResult