import React, { useEffect, useState, useContext } from 'react';
import { Table } from 'antd';
import { AWS_SERVER } from '../../Config';
import { getLocalTime } from '../../utils/CommonFunction';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext';
import axios from 'axios';
// CORS 대책
axios.defaults.withCredentials = true;

function AWSListPage() {
	const [Aws, setAws] = useState([]);
	const {isLanguage} = useContext(LanguageContext);
	const {t, i18n} = useTranslation();

	useEffect(() => {
		// 다국어 설정
    i18n.changeLanguage(isLanguage);
		// AWS정보 가져오기
		getAWS();
	}, [])

	// AWS정보 가져오기
	const getAWS = async () => {
		let data = [];

		try {
			const aws = await axios.get(`${AWS_SERVER}/list`);

			for(let i=0; i < aws.data.awsInfos.length; i++) {
				aws.data.awsInfos[i].secret = truncate(aws.data.awsInfos[i].secret, 20);
				aws.data.awsInfos[i].createdAt = getLocalTime(aws.data.awsInfos[i].createdAt);

				// key 추가
				aws.data.awsInfos[i].key = i;
				data.push(aws.data.awsInfos[i]);
			}

			setAws([...data]);

		} catch (err) {
			console.log("err: ",err);
		}
	}

	const truncate = (str, n) => {
		return str?.length > n ? str.substr(0, n-1) + "..." : str;
	}

	const columns = [
		{
      title: t('AWS.type'),
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: t('AWS.access'),
      dataIndex: 'access',
      key: 'access'
    },
		{
      title: t('AWS.secret'),
      dataIndex: 'secret',
      key: 'secret'
    },
		{
      title: t('AWS.region'),
      dataIndex: 'region',
      key: 'region'
    },
    {
      title: t('AWS.createdDate'),
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
		{
			title: t('Images.action'),
			key: 'action',
			render: (_, record) => (
				<>
					<a href={`/aws/delete/${record._id}`}>delete</a>
				</>
			),
		},
  ];

	return (
		<div style={{ width:'80%', margin: '3rem auto'}}>
			<div style={{ textAlign: 'center', paddingTop: '38px' }}>
				<h1>{t('AWS.listTitle')}</h1>
			</div>
			<Table columns={columns} dataSource={Aws} />
		</div>	
	)
}

export default AWSListPage;