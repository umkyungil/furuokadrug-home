import React, { useEffect } from 'react';
import { Button, Descriptions } from 'antd';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function AlipayInfo(props) {
  const history = useHistory();

  useEffect(() => {
    // 다국어 설정
    setMultiLanguage(localStorage.getItem("i18nextLng"));
	}, [])
  
  // 다국어 설정
  const {t, i18n} = useTranslation();
  function setMultiLanguage(lang) {
    i18n.changeLanguage(lang);
  }
  // 리스트 이동
  const listHandler = () => {
    history.push("/payment/alipay/list");
  }
  // 날짜 변형
  let sod = "";
  let createdAt = "";
  let updatedAt = "";
  if(props) {
    if (props.detail.sod) {
      let tmpSod = new Date(props.detail.sod);
      let date = new Date(tmpSod.getTime() - (tmpSod.getTimezoneOffset() * 60000)).toISOString();
      sod = date.replace('T', ' ').substring(0, 19) + ' (JST)'
    }
    if (props.detail.createdAt) {
      let tmpCreated = new Date(props.detail.createdAt);
      let date = new Date(tmpCreated.getTime() - (tmpCreated.getTimezoneOffset() * 60000)).toISOString();
      createdAt = date.replace('T', ' ').substring(0, 19) + ' (JST)'
    }
    if (props.detail.updatedAt) {
      let tmpUpdated = new Date(props.detail.updatedAt);
      let date = new Date(tmpUpdated.getTime() - (tmpUpdated.getTimezoneOffset() * 60000)).toISOString();
      updatedAt = date.replace('T', ' ').substring(0, 19) + ' (JST)'
    }
  }
  // 처리결과 변형
  let rst = "";
  if(props) {
    let tmpRst = props.detail.rst;
    if (tmpRst) {
      if (tmpRst === "1") {
        rst = "Success"
      } else {
        rst = "Fail"
      }
    }
  }

  return (
    <div>
      <Descriptions>
        <Descriptions.Item label={t('Alipay.type')}>Alipay決済</Descriptions.Item>
        <Descriptions.Item label={t('Alipay.paymentNumber')}>{props.detail.pid}</Descriptions.Item>
        <Descriptions.Item label={t('Alipay.result')}>{rst}</Descriptions.Item>
        <Descriptions.Item label={t('Alipay.controlNumber')}>{props.detail.ap}</Descriptions.Item>
        <Descriptions.Item label={t('Alipay.err')}>{props.detail.ec}</Descriptions.Item>
        <Descriptions.Item label={t('Alipay.shopOrderNumber')}>{sod}</Descriptions.Item>
        <Descriptions.Item label={t('Alipay.amount')}>{Number(props.detail.ta).toLocaleString()}</Descriptions.Item>
        <Descriptions.Item label={t('Alipay.paymentJob')}>{props.detail.job}</Descriptions.Item>
        <Descriptions.Item label={t('Alipay.paymentOrderNumber')}>{props.detail.pod1}</Descriptions.Item>
        <Descriptions.Item label={t('Alipay.uniqueKey')}>{props.detail.uniqueField}</Descriptions.Item>
        <Descriptions.Item label={t('Alipay.createdDate')}>{createdAt}</Descriptions.Item>
        <Descriptions.Item label={t('Alipay.updatedDate')}>{updatedAt}</Descriptions.Item>
      </Descriptions>

      <br />
      <br />
      <br />
      <div style={{ display: 'flex', justifyContent: 'center' }} >
        <Button size="large" onClick={listHandler}>
          Alipay List
        </Button>
      </div>
    </div>
  )
}

export default AlipayInfo