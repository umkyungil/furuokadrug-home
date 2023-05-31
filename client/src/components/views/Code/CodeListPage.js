import React, { useEffect, useState, useContext } from 'react';
import { Table } from 'antd';
import { CODE_SERVER } from '../../Config';
import { getLocalTime } from '../../utils/CommonFunction';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext';
import axios from 'axios';
// CORS 대책
axios.defaults.withCredentials = true;

function CodeListPage() {
	const [Code, setCode] = useState([]);
	const {isLanguage} = useContext(LanguageContext);
	const {t, i18n} = useTranslation();

	useEffect(() => {
		// 다국어 설정
    i18n.changeLanguage(isLanguage);
		// 코드정보 가져오기
		getCode();
	}, [])

	// 코드정보 가져오기
	const getCode = async () => {
		let data = [];

		try {
			const code = await axios.get(`${CODE_SERVER}/list`);

			for(let i=0; i < code.data.codeInfos.length; i++) {
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
      title: t('Code.name'),
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
		<div style={{ width:'80%', margin: '3rem auto'}}>
			<div style={{ textAlign: 'center', paddingTop: '38px' }}>
				<h1>{t('Code.listTitle')}</h1>
			</div>
			<Table columns={columns} dataSource={Code} />
		</div>	
	)
}

export default CodeListPage;