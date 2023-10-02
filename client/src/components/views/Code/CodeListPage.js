import React, { useEffect, useState, useContext } from 'react';
import { Table } from 'antd';
import { CODE_SERVER } from '../../Config';
import { getLocalTime } from '../../utils/CommonFunction';
import { useTranslation } from 'react-i18next';

import { LanguageContext } from '../../context/LanguageContext';
import '../ProductPage/Sections/product.css';
import { getLanguage, setHtmlLangProps } from '../../utils/CommonFunction';


// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

function CodeListPage() {
	const [Code, setCode] = useState([]);
	const {isLanguage, setIsLanguage} = useContext(LanguageContext);
	const {t, i18n} = useTranslation();

	useEffect(() => {
		// 다국어 설정
    const lang = getLanguage(isLanguage);
    i18n.changeLanguage(lang);
    setIsLanguage(lang);

		// HTML lang속성 변경
    setHtmlLangProps(lang);

		// 코드정보 가져오기
		getCode();
	}, [isLanguage])

	// 코드정보 가져오기
	const getCode = async () => {
		let data = [];

		try {
			const code = await axios.get(`${CODE_SERVER}/list`);

			for(let i=0; i < code.data.codeInfos.length; i++) {
				let value1 = code.data.codeInfos[i].value1;
				if (value1.length > 10) {
					value1 = value1.slice(0, 10)
					value1 += "...";
					code.data.codeInfos[i].value1 = value1;
				} else {
					code.data.codeInfos[i].value1 = value1;
				}

				let value2 = code.data.codeInfos[i].value2;
				if (value2.length > 10) {
					value2 = value2.slice(0, 10)
					value2 += "...";
					code.data.codeInfos[i].value2 = value2;
				} else {
					code.data.codeInfos[i].value2 = value2;
				}

				let value3 = code.data.codeInfos[i].value3;
				if (value3.length > 10) {
					value3 = value3.slice(0, 10)
					value3 += "...";
					code.data.codeInfos[i].value3 = value3;
				} else {
					code.data.codeInfos[i].value3 = value3;
				}

				let value4 = code.data.codeInfos[i].value4;
				if (value4.length > 10) {
					value4 = value4.slice(0, 10)
					value4 += "...";
					code.data.codeInfos[i].value4 = value4;
				} else {
					code.data.codeInfos[i].value4 = value4;
				}

				let value5 = code.data.codeInfos[i].value5;
				if (value5.length > 10) {
					value5 = value5.slice(0, 10)
					value5 += "...";
					code.data.codeInfos[i].value5 = value5;
				} else {
					code.data.codeInfos[i].value5 = value5;
				}

				let value6 = code.data.codeInfos[i].value6;
				if (value6.length > 10) {
					value6 = value6.slice(0, 10)
					value6 += "...";
					code.data.codeInfos[i].value6 = value6;
				} else {
					code.data.codeInfos[i].value6 = value6;
				}

				let value7 = code.data.codeInfos[i].value7;
				if (value7.length > 10) {
					value7 = value7.slice(0, 10)
					value7 += "...";
					code.data.codeInfos[i].value7 = value7;
				} else {
					code.data.codeInfos[i].value7 = value7;
				}

				code.data.codeInfos[i].createdAt = getLocalTime(code.data.codeInfos[i].createdAt);
				// key 추가
				code.data.codeInfos[i].key = i;
				data.push(code.data.codeInfos[i]);
			}

			setCode([...data]);
		} catch (err) {
			console.log("err: ",err);
		}
	}

	const columns = [
		{
      title: t('Code.code'),
      dataIndex: 'code',
      key: 'code'
    },
		{
      title: t('Code.description'),
      dataIndex: 'name',
      key: 'name'
    },
		{
      title: t('Code.value1'),
      dataIndex: 'value1',
      key: 'value1'
    },
		{
      title: t('Code.value2'),
      dataIndex: 'value2',
      key: 'value2'
    },
    {
      title: t('Code.value3'),
      dataIndex: 'value3',
      key: 'value3'
    },
		{
      title: t('Code.value4'),
      dataIndex: 'value4',
      key: 'value4'
    },
		{
      title: t('Code.value5'),
      dataIndex: 'value5',
      key: 'value5'
    },
		{
      title: t('Code.value6'),
      dataIndex: 'value6',
      key: 'value6'
    },
		{
      title: t('Code.value7'),
      dataIndex: 'value7',
      key: 'value7'
    },
		{
      title: t('Code.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt'
    },
		{
			title: t('Code.action'),
			key: 'action',
			render: (_, record) => (
				<>
					<a href={`/code/detail/${record._id}`}>detail</a>&nbsp;&nbsp;
					<a href={`/code/update/${record._id}`}>edit</a>
				</>
			),
		},
  ];

	return (
		<div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} style={{ width:'80%', margin: '3rem auto'}}>
			<div style={{ textAlign: 'center', paddingTop: '38px' }}>
				<h1>{t('Code.listTitle')}</h1>
			</div>
			<Table columns={columns} dataSource={Code} />
		</div>	
	)
}

export default CodeListPage;