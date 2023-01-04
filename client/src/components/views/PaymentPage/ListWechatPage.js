import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table } from 'antd';
import SearchFeature from './Sections/WechatSearchFeature';
import { PAYMENT_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
// CORS 대책
axios.defaults.withCredentials = true;

function ListWechatPage() {
	const [WechatInfo, setWechatInfo] = useState([]);
	const {t, i18n} = useTranslation();

	useEffect(() => {
		// 다국어 설정
		i18n.changeLanguage(localStorage.getItem("i18nextLng"));
		// 위쳇 정보 취득
		let body = {skip: 0, limit: 8}
		getWechatInfo(body);
	}, [])

	// 위쳇 정보 취득
	const getWechatInfo = async (body) => {
		let data = [];
    let count = 0;	

		try {
			const result = await axios.post(`${PAYMENT_SERVER}/wechat/list`, body)
			if (result.data.success) {
				for (let i=0; i<result.data.wechatInfo.length; i++) {
					count++;
					let tmpWechatInfo = result.data.wechatInfo[i];
				
					// 결제결과 변형
					if(tmpWechatInfo.rst) {
						if(tmpWechatInfo.rst === "1") {
							tmpWechatInfo.rst = "Success";
						} else {
							tmpWechatInfo.rst = "Fail";
						}						
					}
					// 결제금액 변형
					if(tmpWechatInfo.ta) {
						tmpWechatInfo.ta = Number(tmpWechatInfo.ta).toLocaleString();
					}
					// 날짜 추가
					let tmpDate = new Date(tmpWechatInfo.createdAt);
					const date = new Date(tmpDate.getTime() - (tmpDate.getTimezoneOffset() * 60000)).toISOString();
          tmpWechatInfo.dateOfPurchase = date.replace('T', ' ').substring(0, 19) + ' (JST)';

					// key 추가
					tmpWechatInfo.key = count;
					data.push(tmpWechatInfo);
				};

				setWechatInfo([...data]);
			}
		} catch (err) {
			console.log("ListAlipayPage err: ",err);
		}	
	}

	// Wechat 결제정보 검색
	const updateSearchTerm = (newSearchTerm) => {
		let body = { searchTerm: newSearchTerm }
		getWechatInfo(body);
	}
	// 컬럼정의
	const columns = [
    {
      title: t('Wechat.paymentNumber'),
      dataIndex: 'pid',
      key: 'pid'
    },
    {
      title: t('Wechat.result'),
      dataIndex: 'rst',
      key: 'rst',
    },
    {
      title: t('Wechat.controlNumber'),
      dataIndex: 'ap',
      key: 'ap',
    },
    {
      title: t('Wechat.amount'),
      dataIndex: 'ta',
      key: 'ta',
    },
    {
      title: t('Wechat.uniqueKey'),
      dataIndex: 'uniqueField',
      key: 'uniqueField',
    },
		{
      title: t('Wechat.date'),
      dataIndex: 'dateOfPurchase',
      key: 'dateOfPurchase',
    },
		{
			title: t('Wechat.action'),
			key: 'action',
			render: (_, record) => (
				<>
					<a href={`/payment/wechat/${record._id}`}>detail</a>
				</>
			),
		},
  ];

	return (
		<div style={{ width:'80%', margin: '3rem auto'}}>
			<div style={{ textAlign: 'center' }}>
				<h1>{t('Wechat.listTitle')}</h1>
			</div>

			{/* Filter */}
			{/* Search */}
			<div style={{ display:'flex', justifyContent:'flex-end', margin:'1rem auto' }}>
				<SearchFeature refreshFunction={updateSearchTerm}/>
			</div>
			{/* Search */}

			<Table columns={columns} dataSource={WechatInfo} />
		</div>
	)
}

export default ListWechatPage