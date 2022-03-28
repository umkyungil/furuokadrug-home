import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List } from 'antd';
import SearchFeature from './Sections/SearchFeature';
import { ORDER_SERVER } from '../../Config.js';
// CORS 대책
axios.defaults.withCredentials = true;

function ListOrderPage(props) {
	const [OrderInfo, setOrderInfo] = useState([]);
	const [SearchTerm, setSearchTerm] = useState("");

	// delivery 링크를 눌렀을때 다시 이 화면을 호출하면서 주문id를 보낸다
	const paramOrderId = props.match.params.orderId;
	
	useEffect(() => {
		let body = {
			skip: 0,
			limit: 8
		}
		// delivery 링크를 눌렀을때 해당 주문정보의 배달 상태를 변경
		if(paramOrderId) {
			// 해당 주문의 지불정보 취득
			getOrderPaymentStatus(paramOrderId);
		} 
			// 주문정보 취득		
			getOrderInfo(body);
	}, [])

	// 주문정보 가지고 오기
	async function getOrderInfo(body) {
		await axios.post(`${ORDER_SERVER}/list`, body)
			.then(response => {
				if (response.data.success) {
					setOrderInfo([...response.data.orderInfo]);
				} else {
						alert("Failed to get Order info");
				}
			})
	}

	// 해당 주문정보 가지고와서 결제상태 확인해서 배송상태 변경
	async function getOrderPaymentStatus(orderId) {
		const state = "未確認"
		axios.get(`${ORDER_SERVER}/orders_by_id?id=${orderId}`)
      .then(response => {
        if (response.data.success) {
					if (response.data.orders[0].paymentStatus !== state) {
						// 결제상태가 미확인이 아니면 배송상태 변경
						updateDeliveryStatus(orderId);
					} else {
						alert("Please confirm payment status")
					}
        } else {
          alert("Failed to get order information.")
        }
      })
	}

	// 해당 주문정보의 배송상태 변경
	async function updateDeliveryStatus(orderId) {		
		await axios.get(`${ORDER_SERVER}/deliveryStatus?id=${orderId}`)
			.then(response => {
				if (response.data.success) {
					console.log("Order information registration successful");
				} else {
					console.log("Order information registration failed");
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
						<List.Item actions={[<a href={`/order/${order._id}`}>detail</a>,
																<a href={`/order/list/${order._id}`}>delivery</a>]}>
							<List.Item.Meta
								description={`決済種類: ${order.type} / 名前: ${order.name} ${order.lastName} / メール: ${order.email} / 
								決済金額: ¥${Number(order.amount).toLocaleString()} / 決済確認: ${order.paymentStatus} / 
								配送確認: ${order.deliveryStatus} / 接客者: ${order.stepName} `}
								/>
						</List.Item>
					)}
				/>
      </div>
	</div>	
	)
}

export default ListOrderPage