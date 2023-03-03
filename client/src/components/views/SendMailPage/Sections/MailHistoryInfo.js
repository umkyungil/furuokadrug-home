import React, { useEffect, useContext } from 'react';
import { Button, Descriptions } from 'antd';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../../context/LanguageContext';

function MailHistoryInfo(props) {
  const history = useHistory();
  const {isLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  useEffect(() => {
    // 다국어 설정
		i18n.changeLanguage(isLanguage);
  }, [])

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
    <div>
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
        <Button size="large" onClick={listHandler}>
          Mail History List
        </Button>
      </div>
    </div>
  )
}

export default MailHistoryInfo