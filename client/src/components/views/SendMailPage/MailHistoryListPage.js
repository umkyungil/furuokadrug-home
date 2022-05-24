import React, { useEffect, useState } from 'react';
import { useSelector } from "react-redux";
import axios from 'axios';
import { List, Avatar, Alert, Tooltip } from 'antd';
import SearchFeature from './Sections/SearchFeature';
import { MAIL_SERVER } from '../../Config.js';
import { useHistory } from 'react-router-dom';
// CORS 대책
axios.defaults.withCredentials = true;

function MailHistoryListPage() {
	const history = useHistory();
	const user = useSelector(state => state.user)
	const [MailHistory, setMailHistory] = useState([]);
	const [SearchTerm, setSearchTerm] = useState("");
	const [ErrorAlert, setErrorAlert] = useState(false);

	useEffect(() => {
		let body = {
			skip: 0,
			limit: 8
		}
		// 메일정보 취득
		getMailHistory(body);
	},[])

	// 모든 메일정보 가져오기
	const getMailHistory = (body) => {
		axios.post(`${MAIL_SERVER}/list`, body)
			.then(response => {
				if (response.data.success) {
					for (let i=0; i<response.data.mailInfo.length; i++) {
						let tmpMessage = response.data.mailInfo[i].message;
						// 메세지 길이 조정
						if (tmpMessage.length > 21) {
							tmpMessage = tmpMessage.slice(0, 21)
							tmpMessage = tmpMessage + "...";
						}
						// 필드 추가
						response.data.mailInfo[i].shortMessage = tmpMessage;
					}
					console.log("response.data.mailInfo: ", response.data.mailInfo);
					setMailHistory([...response.data.mailInfo]);	
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

	// 키워드 검색시 해당 메일정보가져오기
	const updateSearchTerm = (newSearchTerm) => {
		let body = {
			searchTerm: newSearchTerm
		}

		setSearchTerm(newSearchTerm);
		getMailHistory(body);
	}
	
	if (user.userData) {
		return (
			<div style={{ width:'75%', margin:'3rem auto' }}>				
				{/* Alert */}
				<div>
					{ErrorAlert ? (
						<Alert message="Failed to get mails." type="error" showIcon closable afterClose={handleClose}/>
					) : null}
				</div>
				<br />

				<div style={{ textAlign:'center' }}>
					<h1>Mail History</h1>
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
						dataSource={MailHistory}
						renderItem={history => (	
							<List.Item actions={[<a href={`${history._id}`}>detail</a>]}>
								<Tooltip title={history.message}>
									<List.Item.Meta
										avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
										description={`Type: ${history.type} / 
																	Subject: ${history.subject} / 
																	From: ${history.from} / 
																	Message: ${history.shortMessage}
																`}
									/>
								</Tooltip>
							</List.Item>
						)}
					/>
				</div>
			</div>	
		)
	} else {
		return (
			<div style={{ width:'75%', margin:'3rem auto' }}>
				{/* Alert */}
				<div>
					{ErrorAlert ? (
						<Alert message="Failed to get customers." type="error" showIcon closable afterClose={handleClose}/>
					) : null}
				</div>
				<br />

				<div style={{ textAlign:'center' }}>
					<h1>Mail History</h1>
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
						dataSource={MailHistory}
						renderItem={history => (
							<List.Item actions={[<a href={`mail/${history._id}`}>detail</a>]}>
								<List.Item.Meta
									avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
									description={`Type: ${history.type} / 
																Subject: ${history.subject} / 
																From: ${history.from} / 
																Message: ${history.shortMessage}
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

export default MailHistoryListPage