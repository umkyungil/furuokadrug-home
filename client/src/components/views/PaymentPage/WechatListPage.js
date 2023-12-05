import React, { useEffect, useState, useContext } from 'react';
import { Table } from 'antd';
import SearchFeature from './Sections/WechatSearchFeature';
import { PAYMENT_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';

import { LanguageContext } from '../../context/LanguageContext';
import { getLanguage, setHtmlLangProps, getMessage } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

function WechatListPage() {
	const [WechatInfo, setWechatInfo] = useState([]);
	const {isLanguage, setIsLanguage} = useContext(LanguageContext);
	const {t, i18n} = useTranslation();

	useEffect(() => {
		// 다국어 설정
    const lang = getLanguage(isLanguage);
    i18n.changeLanguage(lang);
    setIsLanguage(lang);

		// HTML lang속성 변경
    setHtmlLangProps(lang);

		// 위쳇 정보 취득
		getWechatInfo({skip: 0, limit: 8});
	}, [isLanguage])

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
			console.log("WechatListPage getWechatInfo err: ",err);
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
		<div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} style={{ width:'80%', margin: '3rem auto'}}>
			<div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
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

export default WechatListPage;