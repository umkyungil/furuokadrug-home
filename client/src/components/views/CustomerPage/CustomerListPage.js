import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { List, Avatar, Icon } from 'antd';
import SearchFeature from './Sections/SearchFeature';

function CustomerListPage() {
	const [Customers, setCustomers] = useState([]);
	const [SearchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		let body = {
			skip: 0,
			limit: 8
		}

		getCustomers(body);
	}, [])

	const getCustomers = (body) => {
		axios.post('/api/customers/list', body)
			.then(response => {
					if (response.data.success) {
						setCustomers([...response.data.customerInfo]);
					} else {
							alert("Failed to get customers.")
					}
			})
	}

	// 키워드 검색시 고객정보가져오기
	const updateSearchTerm = (newSearchTerm) => {
		let body = {
			searchTerm: newSearchTerm
		}

		setSearchTerm(newSearchTerm);
		getCustomers(body);
	}

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
						<List.Item>
							<List.Item.Meta
								avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
								title={<a href={`/customer/${customer._id}`}>{customer.name}</a>}
								description={`Smaregi ID: ${customer.smaregiId} / 
															Phone number: ${customer.tel} / 
															Emal: ${customer.email} / 
															Address: ${customer.address} / 
															Salesman: ${customer.salesman} / 
															Point:  ${customer.point}
														`}
							/>
						</List.Item>
					)}
				/>
      </div>
	</div>	
	)
}

export default CustomerListPage
