import React, { useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import axios from 'axios';
import { List, Avatar, Alert } from 'antd';
import SearchFeature from './Sections/SearchFeature';
import { CUSTOMER_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
// CORS 대책
axios.defaults.withCredentials = true;

function CustomerListPage() {
	const history = useHistory();
	const user = useSelector(state => state.user)
	const [Customers, setCustomers] = useState([]);
	const [SearchTerm, setSearchTerm] = useState("");
	const [SmaregiId, setSmaregiId] = useState("");
	const [Tel, setTel] = useState("");
	const [Email, setEmail] = useState("");
	const [StaffName, setStaffName] = useState("");
	const [ErrorAlert, setErrorAlert] = useState(false);

	useEffect(() => {
		// 다국어 설정
		setLanguage(localStorage.getItem("i18nextLng"));

		let body = {
			skip: 0,
			limit: 8
		}
		// 고객정보 취득
		getCustomers(body);
	}, [localStorage.getItem('i18nextLng')])

	// 모든 고객정보 가져오기
	const getCustomers = (body) => {
		axios.post(`${CUSTOMER_SERVER}/list`, body)
			.then(response => {
				if (response.data.success) {
					setCustomers([...response.data.customerInfo]);
				} else {
					setErrorAlert(true);
				}
			})
	}

	// 경고메세지
	const handleClose = () => {
    setErrorAlert(false);
		history.push("/");
  };

	// 키워드 검색시 해당 고객정보가져오기
	const updateSearchTerm = (newSearchTerm) => {
		let body = {
			searchTerm: newSearchTerm
		}

		setSearchTerm(newSearchTerm);
		getCustomers(body);
	}

	// 다국적언어 설정
	const {t, i18n} = useTranslation();
  function setLanguage(lang) {
    i18n.changeLanguage(lang);

		if (lang === "en") {
			setSmaregiId("Smaregi ID")
			setTel("Phone number")
			setEmail("E-mail")
			setStaffName("Service staff")
		} else if (lang === "cn") {
			setSmaregiId("Smaregi ID")
			setTel("电话号码")
			setEmail("电子邮件")
			setStaffName("员工姓名")
		} else {
			setSmaregiId("Smaregi ID")
			setTel("電話番号")
			setEmail("E-mail")
			setStaffName("接客担当")
		}
  }
	
	if (user.userData) {
		// 스텝이 경우
		if (user.userData.role === 1) {
			return (
				<div style={{ width:'75%', margin:'3rem auto' }}>

					{/* Alert */}
					<div>
						{Error ? (
							<Alert message="Failed to get customers." type="error" showIcon closable afterClose={handleClose}/>
						) : null}
					</div>
					<br />

					<div style={{ textAlign:'center' }}>
						<h1>{t('Customer.listTitle')}</h1>
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
										description={`${SmaregiId}: ${customer.smaregiId} / 
																	${Tel}: ${customer.tel} / 
																	${Email}: ${customer.email} / 
																	${StaffName}: ${customer.salesman}
																`}
									/>
								</List.Item>
							)}
						/>
					</div>
				</div>	
			)
		// 관리자인 경우
		} else {
			return (
				<div style={{ width:'75%', margin:'3rem auto' }}>
					
					{/* Alert */}
					<div>
						{Error ? (
							<Alert message="Failed to get customers." type="error" showIcon closable afterClose={handleClose}/>
						) : null}
					</div>
					<br />

					<div style={{ textAlign:'center' }}>
						<h1>{t('Customer.listTitle')}</h1>
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
										description={`${SmaregiId}: ${customer.smaregiId} / 
																	${Tel}: ${customer.tel} / 
																	${Email}: ${customer.email} / 
																	${StaffName}: ${customer.salesman}
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

				{/* Alert */}
				<div>
					{Error ? (
						<Alert message="Failed to get customers." type="error" showIcon closable afterClose={handleClose}/>
					) : null}
				</div>
				<br />

				<div style={{ textAlign:'center' }}>
					<h1>{t('Customer.listTitle')}</h1>
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
									description={`${SmaregiId}: ${customer.smaregiId} / 
																${Tel}: ${customer.tel} / 
																${Email}: ${customer.email} / 
																${StaffName}: ${customer.salesman}
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