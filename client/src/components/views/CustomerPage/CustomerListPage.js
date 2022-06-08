import React, { useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import axios from 'axios';
import { List, Avatar, Alert, Table } from 'antd';
import SearchFeature from './Sections/SearchFeature';
import { CUSTOMER_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
// CORS 대책
axios.defaults.withCredentials = true;

function CustomerListPage() {
	const history = useHistory();
	const user = useSelector(state => state.user)
	const [Customers, setCustomers] = useState([]);

	useEffect(() => {
		// 다국어 설정
		setMultiLanguage(localStorage.getItem("i18nextLng"));

		let body = {
			skip: 0,
			limit: 8
		}
		// 고객정보 취득
		getCustomers(body);

	}, [])

	// 다국적언어 설정
	const {t, i18n} = useTranslation();
  function setMultiLanguage(lang) {
    i18n.changeLanguage(lang);
	}

	const columns = [
    {
      title: t('Customer.smaregiId'),
      dataIndex: 'smaregiId',
      key: 'smaregiId'
    },
		{
      title: t('Customer.tel'),
      dataIndex: 'tel',
      key: 'tel',
    },
    {
      title: t('Customer.email'),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: t('Customer.address1'),
      dataIndex: 'address1',
      key: 'address1',
    },
    {
      title: t('Customer.salesman'),
      dataIndex: 'salesman',
      key: 'salesman',
    },
		{
			title: t('Customer.action'),
			key: 'action',
			render: (_, record) => (
				<>
					<a href={`/customer/${record._id}`}>detail</a>&nbsp;&nbsp;
					<a href={`/customer/update/${record._id}`}>edit</a>&nbsp;&nbsp;
					<a href={`/mail/notice/${record.type}/${record.email}`}>email</a>
				</>
			),
		},
  ];

	// 모든 고객정보 가져오기
	const getCustomers = async (body) => {
		let data = [];
    let count = 0;

		try {
			const result = await axios.post(`${CUSTOMER_SERVER}/list`, body);
			if (result.data.success) {
				for (let i=0; i<result.data.customerInfo.length; i++) {
					count++;

					// 주소1 길이 조정(shortAddress 추가)
					let tmpAddress = result.data.customerInfo[i].address1;
					if (tmpAddress) {
						if (tmpAddress.length > 21) {
							tmpAddress = tmpAddress.slice(0, 21)
							tmpAddress = tmpAddress + "...";
						}
						result.data.customerInfo[i].shortAddress = tmpAddress;
					}
					// 메일전송 타입추가(Notice 메일전송시 user list와 구분하기 위한 타입)					
					result.data.customerInfo[i].type = 'Customer';
					// key 추가
          result.data.customerInfo[i].key = count;
					data.push(result.data.customerInfo[i]);
				}
				
				setCustomers([...data]);
			}
		} catch (err) {
			console.log("CustomerListPage err: ",err);
		}
	}

	// 키워드 검색시 해당 고객정보가져오기
	const updateSearchTerm = (newSearchTerm) => {
		let body = {
			searchTerm: newSearchTerm
		}
		
		getCustomers(body);
	}

	return (
		<div style={{ width:'80%', margin: '3rem auto'}}>
			<div style={{ textAlign: 'center' }}>
				<h1>{t('Customer.listTitle')}</h1>
			</div>

			{/* Filter */}
			{/* Search */}
			<div style={{ display:'flex', justifyContent:'flex-end', margin:'1rem auto' }}>
				<SearchFeature refreshFunction={updateSearchTerm}/>
			</div>
			{/* Search */}

			<Table columns={columns} dataSource={Customers} />
		</div>
	)
}

export default CustomerListPage