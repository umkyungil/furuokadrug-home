import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List } from 'antd';
import SearchFeature from './Sections/SearchFeature';
import { ORDER_SERVER, USER_SERVER } from '../../Config.js';
// Multi Language
import { useTranslation } from 'react-i18next';
// CORS 대책
axios.defaults.withCredentials = true;

function ListOrderPage(props) {
	const [OrderInfo, setOrderInfo] = useState([]);
	const [SearchTerm, setSearchTerm] = useState("");
	const [UserRole, setUserRole] = useState(0);

	const [Type, setType] = useState("");
	const [Name, setName] = useState("");
	const [Email, setEmail] = useState("");
	const [Amount, setAmount] = useState("");
	const [PaymentStatus, setPaymentStatus] = useState("");
	const [PaymentStatusValue, setPaymentStatusValue] = useState("");
	const [DeliveryStatus, setDeliveryStatus] = useState("");
	const [DeliveryStatusValue, setDeliveryStatusValue] = useState("");
	const [StaffName, setStaffName] = useState("");


	// delivery 링크를 눌렀을때 다시 이 화면을 호출하면서 주문id를 보낸다
	const paramOrderId = props.match.params.orderId;	
	
	useEffect(() => {
		// 다국어 설정
		setLanguage(localStorage.getItem("i18nextLng"));

		// 사용자 권한정보 취득
		let userId = localStorage.getItem("userId") ? localStorage.getItem("userId") : '';
		axios.get(`${USER_SERVER}/users_by_id?id=${userId}`)
      .then(response => {
        if (response.data.success) {
          setUserRole(response.data.user[0].role)
        } else {
          alert("Failed to get user information.")
        }
      })

		// 주문정보 취득갯수 설정
		let body = {
			skip: 0,
			limit: 8,
			id: userId
		}
		
		// delivery 링크를 눌렀을때 해당 주문정보의 배달 상태를 변경
		if(paramOrderId) {
			// 해당 주문의 지불정보 취득
			getOrderPaymentStatus(paramOrderId);
		}
		// 주문정보 취득		
		getOrderInfo(body);
	}, [localStorage.getItem('i18nextLng')])

	// 주문정보 가지고 오기
	function getOrderInfo(body) {
		axios.post(`${ORDER_SERVER}/list`, body)
			.then(response => {
				if (response.data.success) {
					response.data.orderInfo.map((value, index) => {
						// 다국어 대응
						if(localStorage.getItem("i18nextLng") == "en") {
							if (value.paymentStatus === "入金済み") {
								value.paymentStatus = "deposited";
							} else {
								value.paymentStatus = "unconfirmed";
							}
							if (value.deliveryStatus === "配送手続き完了") {
								value.deliveryStatus = "procedure completed";
							} else {
								value.deliveryStatus = "unconfirmed";
							}
							if (!value.staffName) {
								value.staffName = "unconfirmed";
							}
						} else if(localStorage.getItem("i18nextLng") == "cn") {
							if (value.paymentStatus === "入金済み") {
								value.paymentStatus = "已付款";
							} else {
								value.paymentStatus = "未确认";
							}
							if (value.deliveryStatus === "配送手続き完了") {
								value.deliveryStatus = "发货程序已完成";
							} else {
								value.deliveryStatus = "未确认";
							}
							if (!value.staffName) {
								value.staffName = "未确认";
							}
						}
						// 일본어의 경우
						if (!value.staffName) {
							value.staffName = "未確認";
						}
					});

					setOrderInfo([...response.data.orderInfo]);
				} else {
					alert("Failed to get Order info");
				}
			})
	}

	// 해당 주문정보 가지고와서 결제상태 확인해서 배송상태 변경
	function getOrderPaymentStatus(orderId) {
		axios.get(`${ORDER_SERVER}/orders_by_id?id=${orderId}`)
      .then(response => {
        if (response.data.success) {
					if (response.data.orders[0].paymentStatus !== "未確認") {
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
	function updateDeliveryStatus(orderId) {		
		axios.get(`${ORDER_SERVER}/deliveryStatus?id=${orderId}`)
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
		let userId = localStorage.getItem("userId");
		let body = { searchTerm: newSearchTerm, id: userId}

		setSearchTerm(newSearchTerm);
		getOrderInfo(body);
	}

	// 다국어 설정
	const {t, i18n} = useTranslation();
  function setLanguage(lang) {
    i18n.changeLanguage(lang);

		if (lang === "en") {
			setType("Type")
			setName("Name")
			setEmail("E-mail")
			setAmount("Amount")
			setPaymentStatus("Payment status")
			setDeliveryStatus("Delivery status")
			setStaffName("Service staff")
		} else if (lang === "cn") {
			setType("付款方式")
			setName("姓名")
			setEmail("电子邮件")
			setAmount("付款金额")
			setPaymentStatus("支付状态")
			setDeliveryStatus("邮寄状态")
			setStaffName("服务人员")
		} else {
			setType("決済種類")
			setName("名前")
			setEmail("E-mail")
			setAmount("決済金額")
			setPaymentStatus("決済確認")
			setDeliveryStatus("配送確認")
			setStaffName("接客担当")
		}
  }

	if (UserRole === 0) {
		return (
			<div style={{ width:'75%', margin:'3rem auto' }}>
				<div style={{ textAlign:'center' }}>
					<h1><b>{t('Order.listTitle')}</b></h1>
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
							<List.Item >
								<List.Item.Meta
									description={`${Type}: ${order.type} / ${Name}: ${order.name} ${order.lastName} / ${Email}: ${order.email} / 
									${Amount}: ¥${Number(order.amount).toLocaleString()} / ${PaymentStatus}: ${order.paymentStatus} / 
									${DeliveryStatus}: ${order.deliveryStatus} / ${StaffName}: ${order.staffName} `}
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
					<h1>{t('Order.listTitle')}</h1>
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
									description={`${Type}: ${order.type} / ${Name}: ${order.name} ${order.lastName} / ${Email}: ${order.email} / 
									${Amount}: ¥${Number(order.amount).toLocaleString()} / ${PaymentStatus}: ${order.paymentStatus} / 
									${DeliveryStatus}: ${order.deliveryStatus} / ${StaffName}: ${order.staffName} `}
									/>
							</List.Item>
						)}
					/>
				</div>
		</div>	
		)
	}
}

export default ListOrderPage