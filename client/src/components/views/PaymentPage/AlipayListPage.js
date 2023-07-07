import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Table } from 'antd';
import SearchFeature from './Sections/AlipaySearchFeature';
import { useTranslation } from 'react-i18next';
import { PAYMENT_SERVER } from '../../Config.js';
import { LanguageContext } from '../../context/LanguageContext';
// CORS 대책
axios.defaults.withCredentials = true;

function AlipayListPage() {
	const [AlipayInfo, setAlipayInfo] = useState([]);
	const {isLanguage} = useContext(LanguageContext);
	const {t, i18n} = useTranslation();

	useEffect(() => {
		// 다국어 설정
		i18n.changeLanguage(isLanguage);
		// 알리페이 정보 취득
		let body = {skip: 0, limit: 8}
		getAlipayInfo(body);
	}, [])

	// 알리페이 정보 취득
	const getAlipayInfo = async (body) => {
		let data = [];
    let count = 0;

		try {
			const result = await axios.post(`${PAYMENT_SERVER}/alipay/list`, body);
		
			if (result.data.success) {
				for (let i=0; i<result.data.alipayInfo.length; i++) {
					count++;
					let tmpAlipayInfo = result.data.alipayInfo[i];

					// 결제결과 변형
					if(tmpAlipayInfo.rst) {
						if(tmpAlipayInfo.rst === "1") {
							tmpAlipayInfo.rst = "Success";
						} else {
							tmpAlipayInfo.rst = "Fail";
						}						
					}
					// 결제금액 변형
					if(tmpAlipayInfo.ta) {
						tmpAlipayInfo.ta = Number(tmpAlipayInfo.ta).toLocaleString();
					}
					// 날짜 추가
          let tmpDate = new Date(tmpAlipayInfo.createdAt);
					const date = new Date(tmpDate.getTime() - (tmpDate.getTimezoneOffset() * 60000)).toISOString();
          tmpAlipayInfo.dateOfPurchase = date.replace('T', ' ').substring(0, 19) + ' (JST)';
					// key 추가
					tmpAlipayInfo.key = count;
					data.push(tmpAlipayInfo);
				}

				setAlipayInfo([...data]);
			}
		} catch (err) {
			console.log("AlipayListPage err: ",err);
		}
	}

	// Alipay 결제정보 검색
	const updateSearchTerm = (newSearchTerm) => {
		let body = { searchTerm: newSearchTerm };
		getAlipayInfo(body);
	}
	// 컬럼정의
	const columns = [
    {
      title: t('Alipay.paymentNumber'),
      dataIndex: 'pid',
      key: 'pid'
    },
    {
      title: t('Alipay.result'),
      dataIndex: 'rst',
      key: 'rst',
    },
    {
      title: t('Alipay.controlNumber'),
      dataIndex: 'ap',
      key: 'ap',
    },
    {
      title: t('Alipay.amount'),
      dataIndex: 'ta',
      key: 'ta',
    },
    {
      title: t('Alipay.uniqueKey'),
      dataIndex: 'uniqueField',
      key: 'uniqueField',
    },
		{
      title: t('Alipay.date'),
      dataIndex: 'dateOfPurchase',
      key: 'dateOfPurchase',
    },
		{
			title: t('Alipay.action'),
			key: 'action',
			render: (_, record) => (
				<>
					<a href={`/payment/alipay/${record._id}`}>detail</a>
				</>
			),
		},
  ];

	return (
		<div style={{ width:'80%', margin: '3rem auto'}}>
			<div style={{ textAlign: 'center' }}>
				<h1>{t('Alipay.listTitle')}</h1>
			</div>

			{/* Filter */}
			{/* Search */}
			<div style={{ display:'flex', justifyContent:'flex-end', margin:'1rem auto' }}>
				<SearchFeature refreshFunction={updateSearchTerm}/>
			</div>
			{/* Search */}

			<Table columns={columns} dataSource={AlipayInfo} />
		</div>
	)
}

export default AlipayListPage;