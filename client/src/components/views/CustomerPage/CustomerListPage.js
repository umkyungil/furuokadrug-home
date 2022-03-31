import React, { useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import axios from 'axios';
import { List, Avatar, Icon } from 'antd';
import SearchFeature from './Sections/SearchFeature';
import { CUSTOMER_SERVER } from '../../Config.js';
// CORS 대책
axios.defaults.withCredentials = true;

function CustomerListPage() {
	const [Customers, setCustomers] = useState([]);
	const [SearchTerm, setSearchTerm] = useState("");

	const user = useSelector(state => state.user)

	useEffect(() => {
		let body = {
			skip: 0,
			limit: 8
		}

		getCustomers(body);
	}, [])

	// 모든 고객정보 가져오기
	const getCustomers = (body) => {
		axios.post(`${CUSTOMER_SERVER}/list`, body)
			.then(response => {
				if (response.data.success) {
					setCustomers([...response.data.customerInfo]);
				} else {
					alert("Failed to get customers.")
				}
			})
	}

	// 키워드 검색시 해당 고객정보가져오기
	const updateSearchTerm = (newSearchTerm) => {
		let body = {
			searchTerm: newSearchTerm
		}

		setSearchTerm(newSearchTerm);
		getCustomers(body);
	}		
	
	if (user.userData) {
		if (user.userData.role === 1) {
			return (
				<div style={{ width:'75%', margin:'3rem auto' }}>

					<div style={{ textAlign:'center' }}>
						<h2>Customer List<Icon type="rocket" /></h2>
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
							dataSource={Customers}
							renderItem={customer => (
								<List.Item actions={[<a href={`/customer/${customer._id}`}>detail</a>,
																			<a href={`/mail/notice/${customer.email}`}>email</a>]}>
									<List.Item.Meta
										avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
										title={customer.name}
										description={`Smaregi ID: ${customer.smaregiId} / 
																	Phone number: ${customer.tel} / 
																	E-mail: ${customer.email} / 
																	Salesman: ${customer.salesman}
																`}
									/>
								</List.Item>
							)}
						/>
					</div>
				</div>	
			)
		} else {
			return (
				<div style={{ width:'75%', margin:'3rem auto' }}>

					<div style={{ textAlign:'center' }}>
						<h2>Customer List<Icon type="rocket" /></h2>
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
							dataSource={Customers}
							renderItem={customer => (
								<List.Item actions={[<a href={`/customer/${customer._id}`}>detail</a>,
																			<a href={`/customer/update/${customer._id}`}>edit</a>,
																			<a href={`/mail/notice/${customer.email}`}>email</a>]}>
									<List.Item.Meta
										avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
										title={customer.name}
										description={`Smaregi ID: ${customer.smaregiId} / 
																	Phone number: ${customer.tel} / 
																	E-mail: ${customer.email} / 
																	Salesman: ${customer.salesman}
																`}
									/>
								</List.Item>
							)}
						/>
					</div>
				</div>	
			)
		}
	} else {
		return (
			<div style={{ width:'75%', margin:'3rem auto' }}>

				<div style={{ textAlign:'center' }}>
					<h2>Customer List<Icon type="rocket" /></h2>
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
						dataSource={Customers}
						renderItem={customer => (
							<List.Item actions={[<a href={`/customer/${customer._id}`}>detail</a>,
																		<a href={`/mail/notice/${customer.email}`}>email</a>]}>
								<List.Item.Meta
									avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
									title={customer.name}
									description={`Smaregi ID: ${customer.smaregiId} / 
																Phone number: ${customer.tel} / 
																E-mail: ${customer.email} / 
																Salesman: ${customer.salesman}
															`}
								/>
							</List.Item>
						)}
					/>
				</div>
			</div>	
		)
	}	
}

export default CustomerListPage