import React, {useEffect} from 'react';
import { Button, Descriptions } from 'antd';
import { useDispatch } from 'react-redux';
import { deleteCustomer } from '../../../../_actions/customer_actions';
import { useHistory } from 'react-router-dom';
import { useSelector } from "react-redux";
import { useTranslation } from 'react-i18next';

function CustomerInfo(props) {
  const history = useHistory();
  const user = useSelector(state => state.user)
  const dispatch = useDispatch();

  useEffect(() => {
		setLanguage(localStorage.getItem("i18nextLng"));
	}, [])

  const deleteHandler = () => {
    dispatch(deleteCustomer(props.detail._id))
      .then(response => {
        if (response.payload.success) {
          history.push("/customer/list");
        } else {
          alert("Failed to delete customer information.")
        }
      }
    )
  }
  
  const listHandler = () => {
    history.push("/customer/list");
  }

  // 다국적언어 설정
	const {t, i18n} = useTranslation();
  function setLanguage(lang) {
    i18n.changeLanguage(lang);
  }
  
  if (user.userData) {
		if (user.userData.role === 1) {
      return (
        <div>
          <Descriptions>            
            <Descriptions.Item label={t('Customer.smaregi')}>{props.detail.smaregiId}</Descriptions.Item>
            <Descriptions.Item label={t('Customer.name')}>{props.detail.name}</Descriptions.Item>
            <Descriptions.Item label={t('Customer.tel')}>{props.detail.tel}</Descriptions.Item>
            <Descriptions.Item label={t('Customer.email')}>{props.detail.email}</Descriptions.Item>
            <Descriptions.Item label={t('Customer.address1')}>{props.detail.address1}</Descriptions.Item>
            <Descriptions.Item label={t('Customer.address2')}>{props.detail.address2}</Descriptions.Item>
            <Descriptions.Item label={t('Customer.address3')}>{props.detail.address3}</Descriptions.Item>
            <Descriptions.Item label={t('Customer.salesman')}>{props.detail.salesman}</Descriptions.Item>
            <Descriptions.Item label={t('Customer.point')}>{props.detail.point}</Descriptions.Item>
          </Descriptions>

          <br />
          <br />
          <br />
          <div style={{ display: 'flex', justifyContent: 'center' }} >
            <Button size="large" onClick={listHandler}>
              Customer List
            </Button>
          </div>
        </div>
      )
    } else {
      return (
        <div>
          <Descriptions>
            <Descriptions.Item label={t('Customer.smaregi')}>{props.detail.smaregiId}</Descriptions.Item>
            <Descriptions.Item label={t('Customer.name')}>{props.detail.name}</Descriptions.Item>
            <Descriptions.Item label={t('Customer.tel')}>{props.detail.tel}</Descriptions.Item>
            <Descriptions.Item label={t('Customer.email')}>{props.detail.email}</Descriptions.Item>
            <Descriptions.Item label={t('Customer.address1')}>{props.detail.address1}</Descriptions.Item>
            <Descriptions.Item label={t('Customer.address2')}>{props.detail.address2}</Descriptions.Item>
            <Descriptions.Item label={t('Customer.address3')}>{props.detail.address3}</Descriptions.Item>
            <Descriptions.Item label={t('Customer.salesman')}>{props.detail.salesman}</Descriptions.Item>
            <Descriptions.Item label={t('Customer.point')}>{props.detail.point}</Descriptions.Item>
          </Descriptions>

          <br />
          <br />
          <br />
          <div style={{ display: 'flex', justifyContent: 'center' }} >
            <Button size="large" onClick={listHandler}>
              Customer List
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
          <Descriptions.Item label={t('Customer.smaregi')}>{props.detail.smaregiId}</Descriptions.Item>
          <Descriptions.Item label={t('Customer.name')}>{props.detail.name}</Descriptions.Item>
          <Descriptions.Item label={t('Customer.tel')}>{props.detail.tel}</Descriptions.Item>
          <Descriptions.Item label={t('Customer.email')}>{props.detail.email}</Descriptions.Item>
          <Descriptions.Item label={t('Customer.address1')}>{props.detail.address1}</Descriptions.Item>
          <Descriptions.Item label={t('Customer.address2')}>{props.detail.address2}</Descriptions.Item>
          <Descriptions.Item label={t('Customer.address3')}>{props.detail.address3}</Descriptions.Item>
          <Descriptions.Item label={t('Customer.salesman')}>{props.detail.salesman}</Descriptions.Item>
          <Descriptions.Item label={t('Customer.point')}>{props.detail.point}</Descriptions.Item>
        </Descriptions>

        <br />
        <br />
        <br />
        <div style={{ display: 'flex', justifyContent: 'center' }} >
          <Button size="large" onClick={listHandler}>
            Customer List
          </Button>
        </div>
      </div>
    )
  }
}

export default CustomerInfo