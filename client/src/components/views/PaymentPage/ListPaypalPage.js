import React, { useEffect, useState } from 'react'
import { Table } from 'antd';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { USER_SERVER } from '../../Config.js';
import { useHistory } from 'react-router-dom';
import SearchFeature from './Sections/PaypalSearchFeature';

function ListPaypalPage() {
  const [PaypalInfo, setPaypalInfo] = useState([]);
  const history = useHistory();

  useEffect(() => {
    // 다국어 설정
    setMultiLanguage(localStorage.getItem("i18nextLng"));

    // 사용자정보 취득
    if (localStorage.getItem("userId")) {
      getUserInfo(localStorage.getItem("userId"))
    } else {
      console.log("no user id in localStorage");
      history.push("/login");
    }
	}, [])

  // 다국어 설정
  const {t, i18n} = useTranslation();
  function setMultiLanguage(lang) {
    i18n.changeLanguage(lang);
  }

  // 사용자 자신의 결제 history정보 취득
  async function getUserInfo(userId) {
    let data = [];
    let count = 0;
    try {
      const result = await axios.get(`${USER_SERVER}/users_by_id?id=${userId}`);

      if (result.data.success) {
        for (let i=0; i<result.data.user[0].history.length; i++) {
          count++
          let products = result.data.user[0].history[i];
           // 가격 변형
          let tmpPrice = result.data.user[0].history[i].price;
          products.price = Number(tmpPrice).toLocaleString();
          // 날짜 변형
          let tmpDate = result.data.user[0].history[i].dateOfPurchase;
          products.dateOfPurchase = tmpDate.replace('T', ' ').substring(0, 19) + ' (JST)'
          // key 추가
          products.key = count;
          data.push(products);
          // 내림차순 정렬
          data.sort(function(a, b) {
            if(a.dateOfPurchase < b.dateOfPurchase) return 1;
            if(a.dateOfPurchase > b.dateOfPurchase) return -1;
            if(a.dateOfPurchase === b.dateOfPurchase) return 0;
          });

          setPaypalInfo([...data]);
        }
      }
    } catch (err) {
      console.log("ListPaypalPage err: ",err);
    }
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
      title: t('Paypal.date'),
      dataIndex: 'dateOfPurchase',
      key: 'dateOfPurchase',
    },    
  ];

  // 사용자의 결제 history정보 취득
	const updateSearchTerm = (newSearchTerm) => {
		let body = {
			searchTerm: newSearchTerm
		}

		getUserInfo(body);
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