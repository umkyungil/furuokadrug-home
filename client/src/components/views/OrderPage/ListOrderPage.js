import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List } from 'antd';
import SearchFeature from './Sections/SearchFeature';
import { ORDER_SERVER } from '../../Config.js';
// CORS 대책
axios.defaults.withCredentials = true;

function ListOrderPage() {
	const [OrderInfo, setOrderInfo] = useState([]);
	const [SearchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		let body = {
			skip: 0,
			limit: 8
		}
		getOrderInfo(body);
	}, [])

	const getOrderInfo = (body) => {
		axios.post(`${ORDER_SERVER}/list`, body)
			.then(response => {
					if (response.data.success) {
						// response.data.orderInfo.map((value, index) => {
						// 	if (value.rst === "1") {
						// 		value.rst = "成功";
						// 	} else {
						// 		value.rst = "失敗";
						// 	}
						// });

						setOrderInfo([...response.data.orderInfo]);
					} else {
							alert("Failed to get Order info")
					}
			})
	}

	// 주문정보 검색
	const updateSearchTerm = (newSearchTerm) => {
		console.log("newSearchTerm: ", newSearchTerm);

		let body = {
			searchTerm: newSearchTerm
		}

		setSearchTerm(newSearchTerm);
		getOrderInfo(body);
	}

	return (
		<div style={{ width:'75%', margin:'3rem auto' }}>
			<div style={{ textAlign:'center' }}>
				<h2>Order List</h2>
			</div>

			{/* Filter */}
			{/* Search */}
			<br />
			<div style={{ display:'flex', justifyContent:'flex-end', margin:'1rem auto' }}>
				<SearchFeature refreshFunction={updateSearchTerm}/>
			</div>
			<br />
			<br />
			{/* Search */}

      <div style={{ display:'flex', justifyContent:'center' }}>
				<List
					itemLayout="horizontal"
					dataSource={OrderInfo}
					renderItem={order => (
						<List.Item actions={[<a href={`/order/${order._id}`}>detail</a>]}>
							<List.Item.Meta
								description={`決済種類: ${order.type} / 名前: ${order.name} ${order.lastName} / 電話番号: ${order.tel} / メール: ${order.email} / 
								決済金額: ¥${Number(order.amount).toLocaleString()} / 決済確認: ${order.confirm}`}
								/>
						</List.Item>
					)}
				/>
      </div>
	</div>	
	)
}

export default ListOrderPage