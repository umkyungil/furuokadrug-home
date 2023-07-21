import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Table } from 'antd';
import SearchFeature from './Sections/SearchFeature';
import { USER_SERVER } from '../../Config.js';
import { ENGLISH, CHINESE, JAPANESE, NOTHING, I18N_ENGLISH, I18N_JAPANESE, I18N_CHINESE } from '../../utils/Const.js'
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext';
// CORS 대책
axios.defaults.withCredentials = true;

function UserListPage() {
	const [Users, setUsers] = useState([]);
	const {isLanguage} = useContext(LanguageContext);
	const {t, i18n} = useTranslation();

	useEffect(() => {
		// 다국어 설정
    i18n.changeLanguage(isLanguage);
		// 사용자정보 취득	
		let body = {skip: 0, limit: 8}
		getUsers(body);
	}, [])

	// 사용자 정보 가져오기
	const getUsers = async (body) => {
		let data = [];
    let count = 0;
		
		try {
			const result = await axios.post(`${USER_SERVER}/list`, body);

			if (result.data.success)  {
				for (let i=0; i<result.data.userInfo.length; i++) {
					count++;

					// 언어 명칭 변경(chgLanguage 추가)
					let tmpLanguage = result.data.userInfo[i].language;
					if (tmpLanguage) {
						if (tmpLanguage === I18N_ENGLISH) {
							tmpLanguage = ENGLISH;
						} else if(tmpLanguage === I18N_CHINESE) {
							tmpLanguage = CHINESE;
						} else if(tmpLanguage === I18N_JAPANESE) {
							tmpLanguage = JAPANESE;
						}
						result.data.userInfo[i].chgLanguage = tmpLanguage;
					}
					// // 주소1 길이 조정(shortAddress 추가)
					// let tmpAddress = result.data.userInfo[i].address1;
					// if (tmpAddress) {
					// 	if (tmpAddress.length > 21) {
					// 		tmpAddress = tmpAddress.slice(0, 21)
					// 		tmpAddress = tmpAddress + "...";
					// 	}
					// 	result.data.userInfo[i].shortAddress = tmpAddress;
					// }
					// 최근 로그인날짜 변형(date 추가)
					if(result.data.userInfo[i].lastLogin) {
						let tmpDate = new Date(result.data.userInfo[i].lastLogin);
						const date = new Date(tmpDate.getTime() - (tmpDate.getTimezoneOffset() * 60000)).toISOString();
						result.data.userInfo[i].date = date.replace('T', ' ').substring(0, 19) + ' (JST)';

						console.log("tmpDate: ", tmpDate);
						console.log("date: ", date);
						console.log("result.data.userInfo[i].date: ", result.data.userInfo[i].date);
					}
					// 삭제날짜 변형(delDate 추가)
					if(result.data.userInfo[i].deletedAt) {
						let tmpDate = new Date(result.data.userInfo[i].deletedAt);
						const date = new Date(tmpDate.getTime() - (tmpDate.getTimezoneOffset() * 60000)).toISOString();
						result.data.userInfo[i].delDate = date.replace('T', ' ').substring(0, 19) + ' (JST)';
					} else {
						result.data.userInfo[i].delDate = NOTHING;
					}

					// 메일전송　타입추가(Notice 메일전송시 customer list와 구분하기 위한 타입)
					result.data.userInfo[i].type = 'User';

					// key 추가
          result.data.userInfo[i].key = count;
					data.push(result.data.userInfo[i]);
				}

				setUsers([...data]);
				
			}
		} catch (err) {
			console.log("UserListPage err: ",err);
		}
	}

	// 키워드 검색시 고객정보가져오기
	const updateSearchTerm = (newSearchTerm) => {
		let body = {
			searchTerm: newSearchTerm
		}

		getUsers(body);
	}

	const columns = [
    {
      title: t('User.name'),
      dataIndex: 'lastName',
      key: 'lastName'
    },
    {
      title: t('User.email'),
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: t('User.tel'),
      dataIndex: 'tel',
      key: 'tel',
    },
    {
      title: t('User.language'),
      dataIndex: 'chgLanguage',
      key: 'chgLanguage',
    },
		// {
    //   title: t('User.address'),
    //   dataIndex: 'shortAddress',
    //   key: 'shortAddress',
    // },
    {
      title: t('User.lastLogin'),
      dataIndex: 'date',
      key: 'data',
    },
		{
      title: t('User.deletedAt'),
      dataIndex: 'delDate',
      key: 'delDate',
    },    
		{
			title: t('User.action'),
			key: 'action',
			render: (_, record) => (
				<>
					<a href={`/user/${record._id}`}>detail</a>&nbsp;&nbsp;
					<a href={`/user/update/${record._id}`}>edit</a>&nbsp;&nbsp;
					<a href={`/mail/notice/${record.type}/${record.email}`}>email</a>&nbsp;&nbsp;
					<a href={`/point/list/${record._id}`}>point</a>
				</>
			),
		},
  ];

	return (
		<div style={{ width:'80%', margin: '3rem auto'}}>
			<div style={{ textAlign: 'center', paddingTop: '38px' }}>
				<h1>{t('User.listTitle')}</h1>
			</div>

			{/* Filter */}
			{/* Search */}
			<div style={{ display:'flex', justifyContent:'flex-end', margin:'1rem auto' }}>
				<SearchFeature refreshFunction={updateSearchTerm}/>
			</div>
			{/* Search */}

			<Table columns={columns} dataSource={Users} />
		</div>	
	)
}

export default UserListPage;