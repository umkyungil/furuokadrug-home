import React, { useEffect, useContext } from 'react';
import { Button, Descriptions } from 'antd';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { LanguageContext } from '../../../context/LanguageContext';
import '../../ProductPage/Sections/product.css';
import { getLanguage, setHtmlLangProps } from '../../../utils/CommonFunction';

function MailHistoryInfo(props) {
  const history = useHistory();
  const {isLanguage, setIsLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  useEffect(() => {
    // 다국어 설정
    const lang = getLanguage(isLanguage);
    i18n.changeLanguage(lang);
    setIsLanguage(lang);

    // HTML lang속성 변경
    setHtmlLangProps(lang);
  }, [isLanguage])

  // 메일 이력리스트 화면에 이동
  const listHandler = () => {
    history.push("/mail/list");
  }
  // 날짜 변형
  let createdAt = "";
  if (props.detail.createdAt) {
    let tmpDate = new Date(props.detail.createdAt);
    let date = new Date(tmpDate.getTime() - (tmpDate.getTimezoneOffset() * 60000)).toISOString();
    createdAt = date.replace('T', ' ').substring(0, 19) + ' (JST)';
  }
	
  return (
    <div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} >
      <Descriptions>
        <Descriptions.Item label={t('Mail.type')}>{props.detail.type}</Descriptions.Item>
        <Descriptions.Item label={t('Mail.mailId')}>{props.detail._id}</Descriptions.Item>
        <Descriptions.Item label={t('Mail.from')}>{props.detail.from}</Descriptions.Item>
        <Descriptions.Item label={t('Mail.to')}>{props.detail.to}</Descriptions.Item>
        <Descriptions.Item label={t('Mail.subject')}>{props.detail.subject}</Descriptions.Item>          
        <Descriptions.Item label={t('Mail.date')}>{createdAt}</Descriptions.Item>          
      </Descriptions>
      <Descriptions>
        <Descriptions.Item label={t('Mail.message')}>{props.detail.message}</Descriptions.Item>
      </Descriptions>

      <br />
      <br />
      <br />
      <div style={{ display: 'flex', justifyContent: 'center' }} >
        <Button onClick={listHandler}>
          Mail List
        </Button>
      </div>
    </div>
  )
}

export default MailHistoryInfo;