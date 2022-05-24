import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MailHistoryInfo from './Sections/MailHistoryInfo'
import { Row, Col } from 'antd';
import { MAIL_SERVER } from '../../Config.js';
// CORS 대책
axios.defaults.withCredentials = true;

function MailHistoryDetailPage(props) {
  const [MailHistory, setMailHistory] = useState({});
  const mailId = props.match.params.mailId;

  useEffect(() => {
    axios.get(`${MAIL_SERVER}/mails_by_id?id=${mailId}`)
      .then(response => {

        console.log("response.data.mailInfo: ", response.data.mailInfo);

        if (response.data.success) {
          // 메일본문 /r/n 대응
          let tmp = response.data.mailInfo[0].message;
          if (tmp) {              
            response.data.mailInfo[0].message = convert(tmp);
          }
          setMailHistory(response.data.mailInfo[0])
        } else {
          alert("Failed to get mail information")
        }
      })
  }, [])

  function convert(value) {
    let tmpResult = value.split('\n').map((txt1, index1) => (
      <React.Fragment key={index1}>{txt1}<br /></React.Fragment>
    ))  
    return tmpResult;
  }

  return (
    <div style={{ width:'100%', padding:'3rem 4rem' }}>
      <div style={{ display:'flex', justifyContent:'center' }}>
        <h1>Mail History Detail</h1>
      </div>
      <br />
      
      {/* 여백설정 */}
      <Row gutter={[16, 16]} >
        <Col lg={32} sm={24}>
          {/* ProductInfo */}
          <MailHistoryInfo detail={MailHistory} />
        </Col>
      </Row>
    </div>
  )
}

export default MailHistoryDetailPage