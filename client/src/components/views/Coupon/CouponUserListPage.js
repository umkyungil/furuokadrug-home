import React, { useEffect, useState, useContext } from 'react';
import { Table, Button } from 'antd';
import SearchFeature from './Sections/SearchFeature';
import { USER_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext';
import '../ProductPage/Sections/product.css';
import { getLanguage } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

function CouponUserListPage() {
	const [Users, setUsers] = useState([]);
	const {t, i18n} = useTranslation();
	const {isLanguage, setIsLanguage} = useContext(LanguageContext);

	useEffect(() => {
    i18n.changeLanguage(isLanguage);
		// 사용자정보 취득	
		let body = {skip: 0, limit: 8}
		getUsers(body);
	}, [])

	const columns = [
    {
      title: t('User.name'),
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: t('User.email'),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: t('User.phone'),
      dataIndex: 'tel',
      key: 'tel',
    },
		{
			title: t('User.action'),
			key: 'action',
			render: (_, record) => (
				<>
					<Button type="link" onClick={(e) => {clickHandler(record._id, e)}} >select</Button>
				</>
			),
		},
  ];

	// 사용자 정보 취득
	const getUsers = async (body) => {
		let data = [];
    let count = 0;
		
		try {
			const result = await axios.post(`${USER_SERVER}/coupon/list`, body);

			if (result.data.success) {
				for (let i=0; i<result.data.userInfo.length; i++) {
					count++;

					// 이름 변경
					let name = "";
					name = result.data.userInfo[i].lastName + " " + result.data.userInfo[i].name;
					result.data.userInfo[i].name = name;

					// 메일전송　타입추가
					result.data.userInfo[i].type = 'Coupon';
					// key 추가
          result.data.userInfo[i].key = count;
					data.push(result.data.userInfo[i]);
				}

				setUsers([...data]);
			}
		} catch (err) {
			console.log("getUsers err: ",err);
		}
	}

	// 키워드 검색시 고객정보가져오기
	const updateSearchTerm = (newSearchTerm) => {
		let body = {
			searchTerm: newSearchTerm
		}
		getUsers(body);
	}

	// 부모창의 함수를 호출해서 userId를 전달
	const clickHandler = (params, e) => {
		window.opener.clickHandler(params);
		window.close();
	}

	return (
		<div style={{ maxWidth: '700px', margin: '3rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
        <h1>{t('User.listTitle')}</h1>
      </div>
			{/* Search */}
			<div style={{ display:'flex', justifyContent:'flex-end', margin:'1rem auto' }}>
				<SearchFeature refreshFunction={updateSearchTerm}/>
			</div>
			{/* Search */}
			<Table columns={columns} dataSource={Users} />
		</div>	
	)
}

export default CouponUserListPage;