import React, { useEffect, useState, useContext } from 'react'
import { Table } from 'antd';
import { useTranslation } from 'react-i18next';
import { USER_SERVER } from '../../Config.js';
import { useHistory } from 'react-router-dom';
import SearchFeature from './Sections/PaypalSearchFeature.js';
import { LanguageContext } from '../../context/LanguageContext.js';
import axios from 'axios';
// CORS 대책
axios.defaults.withCredentials = true;

function PaypalListPage() {
  const [PaypalInfo, setPaypalInfo] = useState([]);
  const history = useHistory();
  const {isLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  useEffect(() => {
    // 다국어 설정
    i18n.changeLanguage(isLanguage);
    // 사용자정보 취득
    if (localStorage.getItem("userId")) {
      let body = {userId: localStorage.getItem("userId")}
      getUserInfo(body);
    } else {
      console.log("no user id in localStorage");
      history.push("/login");
    }
	}, [])

  // 사용자 자신의 결제 history정보 취득
  async function getUserInfo(body) {
    const userId = body.userId;
    
    let data = [];
    let count = 0;
    try {
      const result = await axios.get(`${USER_SERVER}/users_by_id?id=${userId}`);
      if (result.data.success) {
        if (result.data.user[0].history.length > 0) {
          for (let i=0; i<result.data.user[0].history.length; i++) {
            // 검색조건 체크
            if (body.searchTerm) {
              let tmp1 = new Date(result.data.user[0].history[i].dateOfPurchase);
              let tmp2 = new Date(body.searchTerm[0]);
              let tmp3 = new Date(body.searchTerm[1]);

              if (tmp1 < tmp2 || tmp1 > tmp3) continue;
            }

            count++
            let products = result.data.user[0].history[i];
            // 가격 변형
            const tmpQuantity = result.data.user[0].history[i].quantity;
            let tmpPrice = result.data.user[0].history[i].price;
            let total = Number(tmpPrice) * Number(tmpQuantity);
            products.price = total.toLocaleString();
            // 날짜 변형(dateOfPurchase는 데이타베이스에 JST 시간으로 등록되서 시간을 계산할 필요가 없다)
            let tmpDate = new Date(result.data.user[0].history[i].dateOfPurchase);
            const date = tmpDate.toISOString();
            products.dateOfPurchase = date.replace('T', ' ').substring(0, 19) + ' (JST)'
            // key 추가
            products.key = count;
            data.push(products);
          }
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
      console.log("PaypalListPage err: ",err);
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
			searchTerm: newSearchTerm,
      userId: localStorage.getItem("userId")
		}
		getUserInfo(body);
	}

  return (
    <div style={{ width:'80%', margin: '3rem auto'}}>
      <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
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

export default PaypalListPage;