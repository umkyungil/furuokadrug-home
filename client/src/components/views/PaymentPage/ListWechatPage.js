import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { List } from 'antd';
import SearchFeature from './Sections/SearchFeature';
import { PAYMENT_SERVER } from '../../Config.js';
// CORS 대책
axios.defaults.withCredentials = true;

function ListWechatPage() {
	const [WechatInfo, setWechatInfo] = useState([]);
	const [SearchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		let body = {
			skip: 0,
			limit: 8
		}
		getWechatInfo(body);
	}, [])

	const getWechatInfo = (body) => {
		axios.post(`${PAYMENT_SERVER}/wechat/list`, body)
			.then(response => {

					if (response.data.success) {
						response.data.wechatInfo.map((value, index) => {
							console.log(value);
							if (value.rst === "1") {
								value.rst = "成功";
							} else {
								value.rst = "失敗";
							}
						});

						setWechatInfo([...response.data.wechatInfo]);
					} else {
							alert("Failed to get wechat payment info")
					}
			})
	}

	// 키워드 검색시 고객정보가져오기
	const updateSearchTerm = (newSearchTerm) => {
		let body = {
			searchTerm: newSearchTerm
		}

		setSearchTerm(newSearchTerm);
		getWechatInfo(body);
	}

	return (
		<div style={{ width:'75%', margin:'3rem auto' }}>

			<div style={{ textAlign:'center' }}>
				<h2>Wechat Payment Result List</h2>
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
					dataSource={WechatInfo}
					renderItem={data => (
						<List.Item >
							<List.Item.Meta
								description={`決済番号 ${data.pid} / 
															処理結果: ${data.rst} / 
															管理番号: ${data.ap} / 
															決済金額(合計): ${data.ta} / 
															Unique Field: ${data.uniqueField}
														`}
								/>
						</List.Item>
					)}
				/>
      </div>
	</div>	
	)
}

export default ListWechatPage
