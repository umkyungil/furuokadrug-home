import React, { useEffect, useState, useContext } from 'react'
import { Table } from 'antd';
import SearchFeature from './Sections/PaypalAdminSearchFeature';
import { PAYMENT_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';

import { LanguageContext } from '../../context/LanguageContext';
import { getLanguage, setHtmlLangProps, getMessage } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

function PaypalListAdminPage(props) {
  const [PaypalInfo, setPaypalInfo] = useState([]);
  const {isLanguage, setIsLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  useEffect(() => {
    // 다국어 설정
    const lang = getLanguage(isLanguage);
    i18n.changeLanguage(lang);
    setIsLanguage(lang);

    // HTML lang속성 변경
    setHtmlLangProps(lang);

    // 결제 정보 취득
    getPaypalInfo({skip: 0, limit: 8});
  }, [isLanguage])

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

        const paypalInfo = result.data.paypalInfo;

        for (let i=0; i<paypalInfo.length; i++) {
          count++
          for (let j=0; j<paypalInfo[i].product.length; j++) {
            count++
            let products = paypalInfo[i].product[j];
            products.userId = paypalInfo[i].user[0].id;
            products.userName = paypalInfo[i].user[0].name;
            // 가격 변형
            const tmpQuantity = paypalInfo[i].product[j].quantity;
            let tmpPrice = paypalInfo[i].product[j].price;
            let total = Number(tmpPrice) * Number(tmpQuantity);
            products.price = total.toLocaleString();
            // 날짜 변형(dateOfPurchase는 데이타베이스에 JST 시간으로 등록되서 시간을 계산할 필요가 없다)
            let tmpDate = new Date(paypalInfo[i].product[j].dateOfPurchase);
            const date = tmpDate.toISOString();
            products.dateOfPurchase = date.replace('T', ' ').substring(0, 19) + ' (JST)'
            // key 추가
            products.key = count;
            data.push(products);
          }
        }
        // 내림차순 정렬
        data.sort(function(a, b) {
          if(a.dateOfPurchase < b.dateOfPurchase) return 1;
          if(a.dateOfPurchase > b.dateOfPurchase) return -1;
          if(a.dateOfPurchase === b.dateOfPurchase) return 0;
        });

        setPaypalInfo([...data]);
      }
    } catch (err) {
      console.log("PaypalListAdminPage getPaypalInfo err: ", err);
    }
  }

  // Paypal 결제정보 검색
	const updateSearchTerm = (newSearchTerm) => {
		let body = {searchTerm: newSearchTerm}
		getPaypalInfo(body);
	}
  
  return (
    <div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} style={{ width:'80%', margin: '3rem auto'}}>
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

export default PaypalListAdminPage;