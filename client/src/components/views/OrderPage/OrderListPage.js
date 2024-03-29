import React, { useEffect, useState, useContext } from 'react';
import { Table } from 'antd';
import SearchFeature from './Sections/SearchFeature';
import { ORDER_SERVER, USER_SERVER } from '../../Config.js';
import { UNIDENTIFIED, DeliveryCompleted } from '../../utils/Const.js';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';

import { LanguageContext } from '../../context/LanguageContext';
import { getLanguage, setHtmlLangProps, getMessage } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

function OrderListPage(props) {
	const history = useHistory();
	const [OrderInfo, setOrderInfo] = useState([]);
	const [UserRole, setUserRole] = useState(0);
	const [DeliveryStatusChange, setDeliveryStatusChange] = useState("");	
	const [Mode, setMode] = useState(true); // 스텝 초기페이지 모드
	const paramOrderId = props.match.params.orderId; // delivery 링크를 눌렀을때 다시 이 화면을 호출하면서 주문id를 보낸다
	const {isLanguage, setIsLanguage} = useContext(LanguageContext);
	const {t, i18n} = useTranslation();
	
	useEffect(() => {
		// 다국어 설정
    const lang = getLanguage(isLanguage);
    i18n.changeLanguage(lang);
    setIsLanguage(lang);

		// HTML lang속성 변경
    setHtmlLangProps(lang);

		// 사용자 ID 취득
		let userId = "";
		if (localStorage.getItem("userId")) {
			userId = localStorage.getItem("userId");
		} else {
			alert(getMessage(getLanguage(), 'key079'));
			history.push("/login");
		}

		// 사용자 정보 취득
		getUserInfo(userId);

		// Delivery 링크를 눌렀을때 해당 주문정보의 배달 상태를 변경
		if(paramOrderId) {
			// 해당 주문의 지불정보 취득
			getOrderPaymentStatus(paramOrderId);
		}

		// Mode: 스텝권한의 사용자가 처음 검색시 스텝이 담당한 사용자만 검색하기 위한 구분자(초기페이지만 자신이 담당한 사용자정보를 표시)
		// Order정보 취득
		getOrderInfo({ skip: 0,	limit: 8, id: userId, mode: Mode });

	}, [DeliveryStatusChange, isLanguage])

	// 사용자정보 가지고 오기
	const getUserInfo = async (userId) => {
		try {
			const result = await axios.get(`${USER_SERVER}/users_by_id?id=${userId}`);
			if (result.data.success) {
				setUserRole(result.data.user[0].role);
				localStorage.setItem("userRole", result.data.user[0].role) // 권한이 사용자인 경우 이름검색조건을 삭제하기 위해 권한을 취득
				localStorage.setItem("userName", result.data.user[0].name)
			} else {
				alert(getMessage(getLanguage(), 'key070'));
			}
		} catch (err) {
			console.log("OrderListPage getUserInfo err: ",err);
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
						tmpOrderInfo.staffName = UNIDENTIFIED;
					}
					// key 추가
					tmpOrderInfo.key = count;
					data.push(tmpOrderInfo);
				};

				setOrderInfo([...data]);
				setMode(false); 
			}
		} catch (err) {
			console.log("OrderListPage getOrderInfo err: ",err);
		}
	}

	// 해당 주문정보 가지고와서 결제상태 확인해서 배송상태 변경
	const getOrderPaymentStatus = async (orderId) => {
		const result = await axios.get(`${ORDER_SERVER}/orders_by_id?id=${orderId}`);

		if (result.data.success) {
			// 결제상태가 미확인이 아니면 배송상태 변경
			if (result.data.orders[0].paymentStatus !== UNIDENTIFIED) {
				updateDeliveryStatus(orderId);
			} else {
				alert(getMessage(getLanguage(), 'key078'));
			}
		} else {
			alert(getMessage(getLanguage(), 'key074'));
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
			alert(getMessage(getLanguage(), 'key079'));
			history.push("/login");
		}
	}
	
	return (
		<div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} style={{ width:'80%', margin: '3rem auto'}}>
			<div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
				<h1>{t('Order.listTitle')}</h1>
			</div>
			
			{/* Search */}
			<div style={{ display:'flex', justifyContent:'flex-end', margin:'1rem auto' }}>
				<SearchFeature refreshFunction={updateSearchTerm} />
			</div>
			{/* 일반사용자인 경우 */}
			{UserRole === 0 &&
				<Table columns={userColumns} dataSource={OrderInfo} />
			}
			{UserRole !== 0 &&
				<Table columns={adminColumns} dataSource={OrderInfo} />
			}
		</div>	
	)
}

export default OrderListPage;