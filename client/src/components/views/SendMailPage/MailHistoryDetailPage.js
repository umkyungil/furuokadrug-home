import React, { useEffect, useState, useContext } from 'react';
import MailHistoryInfo from './Sections/MailHistoryInfo'
import { Row, Col } from 'antd';
import { MAIL_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext';
import '../ProductPage/Sections/product.css';
import { getLanguage } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

function MailHistoryDetailPage(props) {
  const [MailHistory, setMailHistory] = useState({});
  const mailId = props.match.params.mailId;

  const {isLanguage, setIsLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  useEffect(() => {
    // 다국어 설정
		i18n.changeLanguage(isLanguage);
    // 메일정보 취득
    getMailHistory();
  }, [])

  // 메일정보 취득
  const getMailHistory = async () => {
    try {
      const result = await axios.get(`${MAIL_SERVER}/mails_by_id?id=${mailId}`);
      if (result.data.success) {
        // 메일본문 /r/n 대응
        let tmp = result.data.mailInfo[0].message;
        if (tmp) {              
          result.data.mailInfo[0].message = convert(tmp);
        }
        setMailHistory(result.data.mailInfo[0])
      }
    } catch (err) {
      console.log("MailHistoryDetailPage err: ",err);
    }
  }

  // /r/n 대응
  const convert = (value) => {
    let tmpResult = value.split('\n').map((txt1, index1) => (
      <React.Fragment key={index1}>{txt1}<br /></React.Fragment>
    ))  
    return tmpResult;
  }

  return (
    <div style={{ width:'100%', padding:'3rem 4rem' }}>
      <div style={{ display:'flex', justifyContent:'center' }}>
        <h1>{t('Mail.detailTitle')}</h1>
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