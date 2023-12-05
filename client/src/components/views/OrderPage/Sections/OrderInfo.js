import React, { useEffect, useContext } from 'react';
import { Button, Descriptions } from 'antd';
import { useHistory } from 'react-router-dom';
import { ORDER_SERVER } from '../../../Config.js';
import { useSelector } from "react-redux";
import { NOT_SET } from '../../../utils/Const';
import { useTranslation } from 'react-i18next';

import { LanguageContext } from '../../../context/LanguageContext.js';
import { getLanguage, setHtmlLangProps, getMessage } from '../../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

function OrderInfo(props) {
  const history = useHistory();
  const user = useSelector(state => state.user);
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
  
  // 주문정보 및 결제정보 삭제
  const deleteHandler = async () => {
    let body = { orderId:props.detail._id, type:props.detail.type, uniqueField:props.detail.uniqueField }
		await axios.post(`${ORDER_SERVER}/delete`, body)
      .then(response => {
        if (response.data.success) {
					history.push("/order/list");
        } else {
          alert(getMessage(getLanguage(), 'key015'));
        }
      })
	}

  // 주문일람에 이동
  const listHandler = () => {
    history.push("/order/list");
  }

  // 데이타 변형
  let paymentTime = "";
  let staffName = "";
  if(props) {
    // 날짜 변형
    if (props.detail.sod) {
      paymentTime = props.detail.sod.replace('T', ' ').substring(0, 19) + ' (JST)';
    }
    // 스텝이름 변형
    if (props.detail.staffName) {
      staffName = props.detail.staffName;
    } else {
      staffName = NOT_SET;
    }
  }

  if (user.userData) {
		if (user.userData.role === 2) {
      return (
        <div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'}>
          <Descriptions>
            <Descriptions.Item label={t('Order.type')}>{props.detail.type}</Descriptions.Item>
            <Descriptions.Item label={t('Order.userId')}>{props.detail.userId}</Descriptions.Item>
            <Descriptions.Item label={t('Order.name')}>{props.detail.name}</Descriptions.Item>
            <Descriptions.Item label={t('Order.lastName')}>{props.detail.lastName}</Descriptions.Item>
            <Descriptions.Item label={t('Order.tel')}>{props.detail.tel}</Descriptions.Item>
            <Descriptions.Item label={t('Order.email')}>{props.detail.email}</Descriptions.Item>
            <Descriptions.Item label={t('Order.staffName')}>{staffName}</Descriptions.Item>
            <Descriptions.Item label={t('Order.paymentTime')}>{paymentTime}</Descriptions.Item>
            <Descriptions.Item label={t('Order.uniqueField')}>{props.detail.uniqueField}</Descriptions.Item>
            <Descriptions.Item label={t('Order.amount')}>{Number(props.detail.amount).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label={t('Order.paymentStatus')}>{props.detail.paymentStatus}</Descriptions.Item>
            <Descriptions.Item label={t('Order.deliveryStatus')}>{props.detail.deliveryStatus}</Descriptions.Item>
            <Descriptions.Item label={t('Order.country')}>{props.detail.country}</Descriptions.Item>
            <Descriptions.Item label={t('Order.receiver')}>{props.detail.receiver}</Descriptions.Item>
            <Descriptions.Item label={t('Order.receiverTel')}>{props.detail.receiverTel}</Descriptions.Item>
            <Descriptions.Item label={t('Order.zip')}>{props.detail.zip}</Descriptions.Item>
            <Descriptions.Item label={t('Order.shippingAddress')}>{props.detail.address}</Descriptions.Item>
          </Descriptions>

          <br />
          <br />
          <br />
          <div style={{ display: 'flex', justifyContent: 'center' }} >
            <Button onClick={listHandler}>
              Order List
            </Button>
            &nbsp;&nbsp;&nbsp;
            <Button type="danger" onClick={deleteHandler}>
              Delete
            </Button>
          </div>
        </div>
      )
    } else {
      // 관리자가 아닌 경우
      return (
        <div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} >
          <Descriptions>
            <Descriptions.Item label={t('Order.type')}>{props.detail.type}</Descriptions.Item>
            <Descriptions.Item label={t('Order.userId')}>{props.detail.userId}</Descriptions.Item>
            <Descriptions.Item label={t('Order.name')}>{props.detail.name}</Descriptions.Item>
            <Descriptions.Item label={t('Order.lastName')}>{props.detail.lastName}</Descriptions.Item>
            <Descriptions.Item label={t('Order.tel')}>{props.detail.tel}</Descriptions.Item>
            <Descriptions.Item label={t('Order.email')}>{props.detail.email}</Descriptions.Item>
            <Descriptions.Item label={t('Order.staffName')}>{staffName}</Descriptions.Item>
            <Descriptions.Item label={t('Order.paymentTime')}>{paymentTime}</Descriptions.Item>
            <Descriptions.Item label={t('Order.uniqueField')}>{props.detail.uniqueField}</Descriptions.Item>
            <Descriptions.Item label={t('Order.amount')}>{Number(props.detail.amount).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label={t('Order.paymentStatus')}>{props.detail.paymentStatus}</Descriptions.Item>
            <Descriptions.Item label={t('Order.deliveryStatus')}>{props.detail.deliveryStatus}</Descriptions.Item>
            <Descriptions.Item label={t('Order.receiver')}>{props.detail.receiver}</Descriptions.Item>
            <Descriptions.Item label={t('Order.receiverTel')}>{props.detail.receiverTel}</Descriptions.Item>
            <Descriptions.Item label={t('Order.shippingAddress')}>{props.detail.address}</Descriptions.Item>
          </Descriptions>

          <br />
          <br />
          <br />
          <div style={{ display: 'flex', justifyContent: 'center' }} >
            <Button onClick={listHandler}>
              Order List
            </Button>
          </div>
        </div>
      )
    }
  } else {
    return (
      <div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'}>
        <Descriptions>
          <Descriptions.Item label={t('Order.type')}>{props.detail.type}</Descriptions.Item>
          <Descriptions.Item label={t('Order.userId')}>{props.detail.userId}</Descriptions.Item>
          <Descriptions.Item label={t('Order.name')}>{props.detail.name}</Descriptions.Item>
          <Descriptions.Item label={t('Order.lastName')}>{props.detail.lastName}</Descriptions.Item>
          <Descriptions.Item label={t('Order.tel')}>{props.detail.tel}</Descriptions.Item>
          <Descriptions.Item label={t('Order.email')}>{props.detail.email}</Descriptions.Item>
          <Descriptions.Item label={t('Order.staffName')}>{staffName}</Descriptions.Item>
          <Descriptions.Item label={t('Order.paymentTime')}>{paymentTime}</Descriptions.Item>
          <Descriptions.Item label={t('Order.uniqueField')}>{props.detail.uniqueField}</Descriptions.Item>
          <Descriptions.Item label={t('Order.amount')}>{Number(props.detail.amount).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label={t('Order.paymentStatus')}>{props.detail.paymentStatus}</Descriptions.Item>
          <Descriptions.Item label={t('Order.deliveryStatus')}>{props.detail.deliveryStatus}</Descriptions.Item>
          <Descriptions.Item label={t('Order.receiver')}>{props.detail.receiver}</Descriptions.Item>
          <Descriptions.Item label={t('Order.receiverTel')}>{props.detail.receiverTel}</Descriptions.Item>
          <Descriptions.Item label={t('Order.shippingAddress')}>{props.detail.address}</Descriptions.Item>
        </Descriptions>

        <br />
        <br />
        <br />
        <div style={{ display: 'flex', justifyContent: 'center' }} >
            <Button onClick={listHandler}>
              Order List
            </Button>
          </div>
      </div>
    )
  }
}

export default OrderInfo;