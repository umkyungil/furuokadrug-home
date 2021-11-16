import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { List, Avatar, Icon } from 'antd';

function CustomerListPage() {
	const [Customers, setCustomers] = useState([]);

	useEffect(() => {
		getCustomers();
	}, [])

	const getCustomers = () => {
		axios.post('/api/customers/list')
			.then(response => {
					if (response.data.success) {
						setCustomers([...Customers, ...response.data.customerInfo]);
					} else {
							alert("Failed to get customers.")
					}
			})
	}

	return (
		<div style={{ width:'75%', margin:'3rem uto' }}>

			<div style={{ textAlign:'center' }}>
				<h2>Customer List<Icon type="rocket" /></h2>
			</div>

			{/* Filter */}

			{/* Search */}

      <div style={{ display:'flex', justifyContent:'center' }}>
				<List
					itemLayout="horizontal"
					dataSource={Customers}
					renderItem={customer => (
						<List.Item>
							<List.Item.Meta
								avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
								title={<a href="/customer/register">{customer.name}</a>}
								description={`Smaregi ID: ${customer.smaregiId} / 
															phone number: ${customer.tel} / 
															emal: ${customer.email} / 
															address: ${customer.address} / 
															salesman: ${customer.salesman} / 
															point:  ${customer.point}
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
