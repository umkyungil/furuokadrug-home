import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List, Avatar } from 'antd';
import SearchFeature from './Sections/SearchFeature';
import { USER_SERVER } from '../../Config.js';
// CORS 대책
axios.defaults.withCredentials = true;

function UserListPage() {
	const [Users, setUsers] = useState([]);
	const [SearchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		let body = {
			skip: 0,
			limit: 8
		}

		getUsers(body);
	}, [])

	const getUsers = (body) => {
		axios.post(`${USER_SERVER}/list`, body)
			.then(response => {
					if (response.data.success) {
						setUsers([...response.data.userInfo]);
					} else {
							alert("Failed to get users.")
					}
			})
	}

	// 키워드 검색시 고객정보가져오기
	const updateSearchTerm = (newSearchTerm) => {
		let body = {
			searchTerm: newSearchTerm
		}

		setSearchTerm(newSearchTerm);
		getUsers(body);
	}

	return (
		<div style={{ width:'75%', margin:'3rem auto' }}>

			<div style={{ textAlign:'center' }}>
				<h2>User List</h2>
			</div>

			{/* Filter */}
			{/* Search */}
			<div style={{ display:'flex', justifyContent:'flex-end', margin:'1rem auto' }}>
				<SearchFeature refreshFunction={updateSearchTerm}/>
			</div>
			{/* Search */}

      <div style={{ display:'flex', justifyContent:'center' }}>
				<List
					itemLayout="horizontal"
					dataSource={Users}
					renderItem={user => (
						<List.Item actions={[<a href={`/user/${user._id}`}>detail</a>, 
																	<a href={`/user/update/${user._id}`}>edit</a>,
																	<a href={`/mail/notice/${user.email}`}>email</a>]}>
							<List.Item.Meta
								avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
								title={user.name}
								description={`Name: ${user.name} ${user.lastName} / 
															email: ${user.email} / 
															Phone number: ${user.tel}`}
							/>
						</List.Item>
					)}
				/>
      </div>
	</div>	
	)
}

export default UserListPage
