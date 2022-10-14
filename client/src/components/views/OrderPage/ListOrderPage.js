import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table } from 'antd';
import SearchFeature from './Sections/SearchFeature';
import { ORDER_SERVER, USER_SERVER } from '../../Config.js';
import { Unidentified, DeliveryCompleted } from '../../utils/Const.js';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
// CORS 대책
axios.defaults.withCredentials = true;

function ListOrderPage(props) {
	const history = useHistory();
	const [OrderInfo, setOrderInfo] = useState([]);
	const [UserRole, setUserRole] = useState(0);
	const [DeliveryStatusChange, setDeliveryStatusChange] = useState("");	
	const [Mode, setMode] = useState(true); // 스텝 초기페이지 모드
	const [UserName, setUserName] = useState(""); // 스텝 초기검색

	// delivery 링크를 눌렀을때 다시 이 화면을 호출하면서 주문id를 보낸다
	const paramOrderId = props.match.params.orderId;	
	
	useEffect(() => {
		// 다국어 설정
		setMultiLanguage(localStorage.getItem("i18nextLng"));

		// 사용자 ID 취득
		let userId = "";
		if (localStorage.getItem("userId")) {
			userId = localStorage.getItem("userId");
		} else {
			alert("Please login");
			history.push("/login");
		}

		// 사용자 정보 취득
		getUserInfo(userId);

		// Delivery 링크를 눌렀을때 해당 주문정보의 배달 상태를 변경
		if(paramOrderId) {
			// 해당 주문의 지불정보 취득
			getOrderPaymentStatus(paramOrderId);
		}

		// Order정보 취득갯수 설정
		let body = {
			skip: 0,
			limit: 8,
			id: userId,
			mode: Mode, 	 			// 스텝권한의 사용자가 처음 검색시 스텝이 담당한 사용자만 검색하기 위한 구분자(초기페이지만 자신이 담당한 사용자정보 표시)
		}
		
		// Order정보 취득
		getOrderInfo(body);

	}, [DeliveryStatusChange])

	// 다국어 설정
	const {t, i18n} = useTranslation();
	function setMultiLanguage(lang) {
		i18n.changeLanguage(lang);
	}

	// 사용자정보 가지고 오기
	const getUserInfo = async (userId) => {
		try {
			const result = await axios.get(`${USER_SERVER}/users_by_id?id=${userId}`);
			if (result.data.success) {
				setUserRole(result.data.user[0].role);
				localStorage.setItem("userRole", result.data.user[0].role) // 사용자인 경우 이름검색조건을 삭제
				localStorage.setItem("userName", result.data.user[0].name)
			} else {
				alert("Failed to get user information.");
			}
		} catch (err) {
			console.log("ListOrderPage getUserInfo err: ",err);
		}
	}

	// 일반사용자
	const userColumns = [
    {
      title: t('Order.type'),
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: t('Order.name'),
      dataIndex: 'name',
      key: 'name',
    },    
    {
      title: t('Order.amount'),
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: t('Order.paymentStatus'),
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
    },
    {
      title: t('Order.deliveryStatus'),
      dataIndex: 'deliveryStatus',
      key: 'deliveryStatus',
    },
		{
      title: t('Order.staffName'),
      dataIndex: 'staffName',
      key: 'staffName',
    },
		{
      title: t('Order.paymentTime'),
      dataIndex: 'paymentTime',
      key: 'paymentTime',
    },
		{
			title: 'Action',
			key: 'action',
			render: (_, record) => (
				<a href={`/order/${record._id}`}>detail</a>
			),
		},
  ];
	
	// 스텝 및 관리자
	const adminColumns = [
    {
      title: t('Order.type'),
      dataIndex: 'type',
      key: 'type'
    },
    {
      title: t('Order.name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: t('Order.amount'),
      dataIndex: 'amount',
      key: 'amount',
    },
    {
      title: t('Order.paymentStatus'),
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
    },
    {
      title: t('Order.deliveryStatus'),
      dataIndex: 'deliveryStatus',
      key: 'deliveryStatus',
    },
		{
      title: t('Order.staffName'),
      dataIndex: 'staffName',
      key: 'staffName',
    },
		{
      title: t('Order.paymentTime'),
      dataIndex: 'paymentTime',
      key: 'paymentTime',
    },
		{
			title: 'Action',
			key: 'action',
			render: (_, record) => (
				<>
					<a href={`/order/${record._id}`}>detail</a>&nbsp;&nbsp;
					<a href={`/order/list/${record._id}`}>delivery</a>
				</>
			),
		},
  ];

	// Order정보 가지고 오기
	const getOrderInfo = async (body) => {
		let data = [];
    let count = 0;

		body.userName = localStorage.getItem("userName");

		try {
			const result = await axios.post(`${ORDER_SERVER}/list`, body);
			
			if (result.data.success) {
				for (let i=0; i<result.data.orderInfo.length; i++) {
					count++;
					let tmpOrderInfo = result.data.orderInfo[i];
					
					// 가격 변형
					tmpOrderInfo.amount = Number(tmpOrderInfo.amount).toLocaleString();
					// 결제날짜 변형
					if (tmpOrderInfo.sod) {
						// let tmpDate = new Date(tmpOrderInfo.sod);
						// const date = new Date(tmpDate.getTime() - (tmpDate.getTimezoneOffset() * 60000)).toISOString();
						// tmpOrderInfo.paymentTime = date.replace('T', ' ').substring(0, 19) + ' (JST)';
						tmpOrderInfo.paymentTime = tmpOrderInfo.sod.replace('T', ' ').substring(0, 19) + ' (JST)';
					}
					// 일본어의 경우(스텝이름 이외에는 기존 서버에서 셋팅한 값이 일본어 이기에 변경할 필요없다)
					if (!tmpOrderInfo.staffName) {
						tmpOrderInfo.staffName = Unidentified;
					}
					// key 추가
					tmpOrderInfo.key = count;
					data.push(tmpOrderInfo);
				};

				setOrderInfo([...data]);
				setMode(false); 
			}
		} catch (err) {
			console.log("ListOrderPage getOrderInfo err: ",err);
		}
	}

	// 해당 주문정보 가지고와서 결제상태 확인해서 배송상태 변경
	const getOrderPaymentStatus = async (orderId) => {
		const result = await axios.get(`${ORDER_SERVER}/orders_by_id?id=${orderId}`);

		if (result.data.success) {
			// 결제상태가 미확인이 아니면 배송상태 변경
			if (result.data.orders[0].paymentStatus !== Unidentified) {
				updateDeliveryStatus(orderId);
			} else {
				alert("Please confirm payment status")
			}
		} else {
			alert("Failed to get order information.")
		}
	}

	// 해당 주문정보의 배송상태 변경
	const updateDeliveryStatus = async (orderId) => {		
		const result = await axios.get(`${ORDER_SERVER}/deliveryStatus?id=${orderId}`);
			
		if (result.data.success) {
			setDeliveryStatusChange(DeliveryCompleted) // 화면을 리로드 해서 상태를 변경시켜야 하기에 일부러 스테이터스를 변경
			console.log("Order information registration successful");
		} else {
			console.log("Order information registration failed");
		}
	}

	// 주문정보 검색
	const updateSearchTerm = (newSearchTerm) => {
		if (localStorage.getItem("userId")) {
			let userId = localStorage.getItem("userId");
			let body = { 
				searchTerm: newSearchTerm, 
				id: userId
			}

			getOrderInfo(body);
		} else {
			alert("Please login");
			history.push("/login");
		}
	}

	// 일반사용자인 경우
	if (UserRole === 0) {
		return (
			<div style={{ width:'80%', margin: '3rem auto'}}>
				<div style={{ textAlign: 'center' }}>
					<h1>{t('Order.listTitle')}</h1>
				</div>

				{/* Filter */}
				{/* Search */}
				<div style={{ display:'flex', justifyContent:'flex-end', margin:'1rem auto' }}>
					<SearchFeature refreshFunction={updateSearchTerm} />
				</div>
				{/* Search */}

				<Table columns={userColumns} dataSource={OrderInfo} />
			</div>	
		)
	} else {
		return (
			<div style={{ width:'80%', margin: '3rem auto'}}>
				<div style={{ textAlign: 'center' }}>
					<h1>{t('Order.listTitle')}</h1>
				</div>
				<br />
				{/* Filter */}
				{/* Search */}
				<div style={{ display:'flex', justifyContent:'flex-end', margin:'1rem auto' }}>
					<SearchFeature refreshFunction={updateSearchTerm}/>
				</div>
				{/* Search */}

				<Table columns={adminColumns} dataSource={OrderInfo} />
			</div>
		)
	}
}

export default ListOrderPage