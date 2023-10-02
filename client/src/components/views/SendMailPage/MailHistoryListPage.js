import React, { useEffect, useState, useContext } from 'react';
import { Tooltip, Table } from 'antd';
import SearchFeature from './Sections/SearchFeature';
import { MAIL_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext';
import '../ProductPage/Sections/product.css';
import { getLanguage, setHtmlLangProps } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

function MailHistoryListPage() {
	const [MailHistory, setMailHistory] = useState([]);

	const {isLanguage, setIsLanguage} = useContext(LanguageContext);
	const {t, i18n} = useTranslation();
	
	useEffect(() => {
		// 다국어 설정
    const lang = getLanguage(isLanguage);
    i18n.changeLanguage(lang);
    setIsLanguage(lang);

		// HTML lang속성 변경
    setHtmlLangProps(lang);

		// 메일정보 취득
		getMailHistory({skip: 0, limit: 8});
	},[isLanguage])

	const columns = [
    {
      title: t('Mail.type'),
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: t('Mail.from'),
      dataIndex: 'from',
      key: 'from',
    },
    {
      title: t('Mail.to'),
      dataIndex: 'to',
      key: 'to',
    },
    {
      title: t('Mail.subject'),
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: t('Mail.date'),
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: t('Mail.message'),
      dataIndex: 'shortMessage',
      key: 'shortMessage',
    },
		{
			title: t('Mail.action'),
			key: 'action',
			render: (_, record) => (
				<Tooltip title={record.message}><a href={`/mail/${record._id}`}>detail</a></Tooltip>
			),
		},
  ];

	// 모든 메일정보 가져오기
	const getMailHistory = async (body) => {
		let data = [];
    let count = 0;
		try {
			const result = await axios.post(`${MAIL_SERVER}/list`, body);

			if (result.data.success) {
				for (let i=0; i<result.data.mailInfo.length; i++) {
					count++;
					// 메세지 길이 조정(shortMessage)
					let tmpMessage = result.data.mailInfo[i].message;
					if (tmpMessage.length > 21) {
						tmpMessage = tmpMessage.slice(0, 21)
						tmpMessage = tmpMessage + "...";
					}
					result.data.mailInfo[i].shortMessage = tmpMessage;
			    // 날짜 변형(date 추가)
          let tmpDate = new Date(result.data.mailInfo[i].createdAt);
					const date = new Date(tmpDate.getTime() - (tmpDate.getTimezoneOffset() * 60000)).toISOString();
          result.data.mailInfo[i].date = date.replace('T', ' ').substring(0, 19) + ' (JST)';
					// key 추가
          result.data.mailInfo[i].key = count;
					data.push(result.data.mailInfo[i]);
				}
				setMailHistory([...data]);
			}
		} catch (err) {
			console.log("MailHistoryListPage err: ",err);
		}
	}

	// 키워드 검색시 해당 메일정보가져오기
	const updateSearchTerm = (newSearchTerm) => {
		let body = {searchTerm: newSearchTerm}
		getMailHistory(body);
	}
	
	return (
		<div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} style={{ width:'80%', margin: '3rem auto'}}>
			<div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
				<h1>{t('Mail.listTitle')}</h1>
			</div>

			{/* Filter */}
			{/* Search */}
			<div style={{ display:'flex', justifyContent:'flex-end', margin:'1rem auto' }}>
				<SearchFeature refreshFunction={updateSearchTerm}/>
			</div>
			{/* Search */}

			<Table columns={columns} dataSource={MailHistory} />
		</div>	
	)
}

export default MailHistoryListPage;