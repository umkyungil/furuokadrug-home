import React, { useEffect } from 'react';
import { Button, Descriptions } from 'antd';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { ORDER_SERVER } from '../../../Config.js';
import { useSelector } from "react-redux";
import { useTranslation } from 'react-i18next';

function OrderInfo(props) {
  const history = useHistory();
  const user = useSelector(state => state.user)

  useEffect(() => {
    // 다국적언어 설정
    setMultiLanguage(localStorage.getItem("i18nextLng"));
  }, [])
  
  function deleteHandler() {
    // 주문정보 및 결제정보 삭제
    let body = {orderId:props.detail._id, type:props.detail.type, uniqueField:props.detail.uniqueField}
		axios.post(`${ORDER_SERVER}/delete`, body)
      .then(response => {
        if (response.data.success) {
					history.push("/order/list");
        } else {
          alert("Failed to delete order information.")
        }
      })
	}

  // 주문일람에 이동
  const listHandler = () => {
    history.push("/order/list");
  }

  // 다국적언어
	const {t, i18n} = useTranslation();
  function setMultiLanguage(lang) {
    i18n.changeLanguage(lang);		
  }

  // 데이타 변형
  let paymentTime = "";
  let staffName = "";
  if(props) {
    // 날짜 변형
    if (props.detail.sod) {
      let tmpSod = new Date(props.detail.sod);
      let date = new Date(tmpSod.getTime() - (tmpSod.getTimezoneOffset() * 60000)).toISOString();
      paymentTime = date.replace('T', ' ').substring(0, 19) + ' (JST)';
    }
    // 스텝이름 변형
    if (props.detail.staffName) {
      staffName = props.detail.staffName;
    } else {
      staffName = "未設定";
    }
  }

  if (user.userData) {
		if (user.userData.role === 1) {
      return (
        <div>
          <Descriptions>
            <Descriptions.Item label={t('Order.type')}>{props.detail.type}</Descriptions.Item>
            <Descriptions.Item label={t('Order.userId')}>{props.detail.userId}</Descriptions.Item>
            <Descriptions.Item label={t('Order.name')}>{props.detail.name}</Descriptions.Item>
            <Descriptions.Item label={t('Order.lastName')}>{props.detail.lastName}</Descriptions.Item>
            <Descriptions.Item label={t('Order.tel')}>{props.detail.tel}</Descriptions.Item>
            <Descriptions.Item label={t('Order.email')}>{props.detail.email}</Descriptions.Item>
            <Descriptions.Item label={t('Order.shippingAddress')}>{props.detail.address}</Descriptions.Item>
            <Descriptions.Item label={t('Order.paymentTime')}>{paymentTime}</Descriptions.Item>
            <Descriptions.Item label={t('Order.uniqueField')}>{props.detail.uniqueField}</Descriptions.Item>
            <Descriptions.Item label={t('Order.amount')}>￥{Number(props.detail.amount).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label={t('Order.paymentStatus')}>{props.detail.paymentStatus}</Descriptions.Item>
            <Descriptions.Item label={t('Order.deliveryStatus')}>{props.detail.deliveryStatus}</Descriptions.Item>
            <Descriptions.Item label={t('Order.staffName')}>{staffName}</Descriptions.Item>
          </Descriptions>

          <br />
          <br />
          <br />
          <div style={{ display: 'flex', justifyContent: 'center' }} >
            <Button size="large" onClick={listHandler}>
              Order List
            </Button>
          </div>
        </div>
      )
    } else {
      return (
        <div>
          <Descriptions>
            <Descriptions.Item label={t('Order.type')}>{props.detail.type}</Descriptions.Item>
            <Descriptions.Item label={t('Order.userId')}>{props.detail.userId}</Descriptions.Item>
            <Descriptions.Item label={t('Order.name')}>{props.detail.name}</Descriptions.Item>
            <Descriptions.Item label={t('Order.lastName')}>{props.detail.lastName}</Descriptions.Item>
            <Descriptions.Item label={t('Order.tel')}>{props.detail.tel}</Descriptions.Item>
            <Descriptions.Item label={t('Order.email')}>{props.detail.email}</Descriptions.Item>
            <Descriptions.Item label={t('Order.shippingAddress')}>{props.detail.address}</Descriptions.Item>
            <Descriptions.Item label={t('Order.paymentTime')}>{paymentTime}</Descriptions.Item>
            <Descriptions.Item label={t('Order.uniqueField')}>{props.detail.uniqueField}</Descriptions.Item>
            <Descriptions.Item label={t('Order.amount')}>￥{Number(props.detail.amount).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label={t('Order.paymentStatus')}>{props.detail.paymentStatus}</Descriptions.Item>
            <Descriptions.Item label={t('Order.deliveryStatus')}>{props.detail.deliveryStatus}</Descriptions.Item>
            <Descriptions.Item label={t('Order.staffName')}>{staffName}</Descriptions.Item>
          </Descriptions>

          <br />
          <br />
          <br />
          <div style={{ display: 'flex', justifyContent: 'center' }} >
            <Button size="large" onClick={listHandler}>
              Order List
            </Button>
            &nbsp;&nbsp;&nbsp;
            <Button size="large" type="danger" onClick={deleteHandler}>
              Delete
            </Button>
          </div>
        </div>
      )
    }
  } else {
    return (
      <div>
        <Descriptions>
          <Descriptions.Item label={t('Order.type')}>{props.detail.type}</Descriptions.Item>
          <Descriptions.Item label={t('Order.userId')}>{props.detail.userId}</Descriptions.Item>
          <Descriptions.Item label={t('Order.name')}>{props.detail.name}</Descriptions.Item>
          <Descriptions.Item label={t('Order.lastName')}>{props.detail.lastName}</Descriptions.Item>
          <Descriptions.Item label={t('Order.tel')}>{props.detail.tel}</Descriptions.Item>
          <Descriptions.Item label={t('Order.email')}>{props.detail.email}</Descriptions.Item>
          <Descriptions.Item label={t('Order.shippingAddress')}>{props.detail.address}</Descriptions.Item>
          <Descriptions.Item label={t('Order.paymentTime')}>{paymentTime}</Descriptions.Item>
          <Descriptions.Item label={t('Order.uniqueField')}>{props.detail.uniqueField}</Descriptions.Item>
          <Descriptions.Item label={t('Order.amount')}>￥{Number(props.detail.amount).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label={t('Order.paymentStatus')}>{props.detail.paymentStatus}</Descriptions.Item>
          <Descriptions.Item label={t('Order.deliveryStatus')}>{props.detail.deliveryStatus}</Descriptions.Item>
          <Descriptions.Item label={t('Order.staffName')}>{staffName}</Descriptions.Item>
        </Descriptions>

        <br />
        <br />
        <br />
        <div style={{ display: 'flex', justifyContent: 'center' }} >
            <Button size="large" onClick={listHandler}>
              Order List
            </Button>
          </div>
      </div>
    )
  }
}

export default OrderInfo