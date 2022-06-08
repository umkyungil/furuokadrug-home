import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { List, Table } from 'antd';
import SearchFeature from './Sections/PaypalAdminSearchFeature';
import { PAYMENT_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
// CORS 대책
axios.defaults.withCredentials = true;

function ListPaypalPage(props) {
  const [PaypalInfo, setPaypalInfo] = useState([]);

  useEffect(() => {
    // 다국어 설정
    setMultiLanguage(localStorage.getItem("i18nextLng"));

    let body = {
			skip: 0,
			limit: 8
		}
    // 결제 정보 취득
    getPaypalInfo(body);

  }, [])

  // 다국어 설정
  const {t, i18n} = useTranslation();
  function setMultiLanguage(lang) {
    i18n.changeLanguage(lang);
  }

  const columns = [
    {
      title: t('Paypal.paymentId'),
      dataIndex: 'paymentId',
      key: 'paymentId',
      render: (text) => <a>{text}</a>,
    },
    {
      title: t('Paypal.productName'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('Paypal.price'),
      dataIndex: 'price',
      key: 'price',
    },
    {
      title: t('Paypal.quantity'),
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: t('Paypal.userName'),
      dataIndex: 'userName',
      key: 'userName',
    },
    {
      title: t('Paypal.date'),
      dataIndex: 'dateOfPurchase',
      key: 'dateOfPurchase',
    },    
  ];

  // 결제 정보 취득
  const getPaypalInfo = async (body) => {
    let count = 0;
    try {
      const result = await axios.post(`${PAYMENT_SERVER}/paypal/admin/list`, body);
      if (result.data.success) {        
        let data = [];

        for (let i=0; i<result.data.paypalInfo.length; i++) {
          count++
          for (let j=0; j<result.data.paypalInfo[i].product.length; j++) {
            count++
            let products = result.data.paypalInfo[i].product[j];
            products.userId = result.data.paypalInfo[i].user[0].id;
            products.userName = result.data.paypalInfo[i].user[0].name;
            // 가격 변형
            let tmpPrice = result.data.paypalInfo[i].product[j].price;
            products.price = Number(tmpPrice).toLocaleString();
            // 날짜 변형
            let tmpDate = result.data.paypalInfo[i].product[j].dateOfPurchase;
            products.dateOfPurchase = tmpDate.replace('T', ' ').substring(0, 19) + ' (JST)'
            // key 추가
            products.key = count;
            data.push(products);
          }
        }
        setPaypalInfo([...data]);
      }
    } catch (err) {
      console.log("getPaypalInfo err: ", err);
    }
  }

  // Paypal 결제정보 검색
	const updateSearchTerm = (newSearchTerm) => {
		let body = {searchTerm: newSearchTerm}
		getPaypalInfo(body);
	}
  
  return (
    <div style={{ width:'80%', margin: '3rem auto'}}>
      <div style={{ textAlign: 'center' }}>
        <h1>{t('Paypal.title')}</h1>
      </div>
      
      {/* Search */}
      <br />
			<div style={{ display:'flex', justifyContent:'flex-end', margin:'1rem auto' }}>
				<SearchFeature refreshFunction={updateSearchTerm}/>
			</div>
			<br />
			{/* Search */}

      <Table columns={columns} dataSource={PaypalInfo} />
    </div>
  )
}

export default ListPaypalPage;