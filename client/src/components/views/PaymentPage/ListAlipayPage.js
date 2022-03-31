import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List, Avatar, Icon, Button } from 'antd';
import SearchFeature from './Sections/SearchFeature';
import { PAYMENT_SERVER } from '../../Config.js';
// CORS 대책
axios.defaults.withCredentials = true;

function ListAlipayPage() {
	const [AlipayInfo, setAlipayInfo] = useState([]);
	const [SearchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		let body = {
			skip: 0,
			limit: 8
		}
		getAlipayInfo(body);
	}, [])

	const getAlipayInfo = (body) => {
		axios.post(`${PAYMENT_SERVER}/alipay/list`, body)
			.then(response => {
					if (response.data.success) {
						response.data.alipayInfo.map((value, index) => {
							if (value.rst === "1") {
								value.rst = "成功";
							} else {
								value.rst = "失敗";
							}
						});

						setAlipayInfo([...response.data.alipayInfo]);
					} else {
							alert("Failed to get Alipay payment info")
					}
			})
	}

	// Alipay 결제정보 검색
	const updateSearchTerm = (newSearchTerm) => {
		console.log("newSearchTerm: ", newSearchTerm);

		let body = {
			searchTerm: newSearchTerm
		}

		setSearchTerm(newSearchTerm);
		getAlipayInfo(body);
	}

	return (
		<div style={{ width:'75%', margin:'3rem auto' }}>
			<div style={{ textAlign:'center' }}>
				<h2>Alipay Payment Result List</h2>
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
					dataSource={AlipayInfo}
					renderItem={alipay => (
						<List.Item actions={[<a href={`/payment/alipay/${alipay._id}`}>detail</a>]}>
							<List.Item.Meta
								description={`決済番号 ${alipay.pid} / 処理結果: ${alipay.rst} / 管理番号: ${alipay.ap} / 決済金額(合計): ${Number(alipay.ta).toLocaleString()} / 
															ユニークキー: ${alipay.uniqueField}`
														}
								/>
						</List.Item>
					)}
				/>
      </div>
	</div>	
	)
}

export default ListAlipayPage