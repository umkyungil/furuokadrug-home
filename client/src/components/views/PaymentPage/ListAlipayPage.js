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
						setAlipayInfo([...response.data.alipayInfo]);
					} else {
							alert("Failed to get alipay info.")
					}
			})
	}

	// 키워드 검색시 고객정보가져오기
	const updateSearchTerm = (newSearchTerm) => {
		let body = {
			searchTerm: newSearchTerm
		}

		setSearchTerm(newSearchTerm);
		getAlipayInfo(body);
	}

	return (
		<div style={{ width:'75%', margin:'3rem auto' }}>

			<div style={{ textAlign:'center' }}>
				<h2>Alipay Payment Result List<Icon type="rocket" /></h2>
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
					dataSource={AlipayInfo}
					renderItem={data => (
						<List.Item >
							<List.Item.Meta
								avatar={<Avatar src="https://joeschmoe.io/api/v1/random" />}
								title={data.uniqueField}
								description={`PID: ${data.pid} / 
															RST: ${data.rst} / 
															AP: ${data.ap} / 
															SOD: ${data.sod} /
															TA: ${data.sod} /
															JOB: ${data.job} /
															POD1: ${data.pod1} /
															uniqueField: ${data.uniqueField} /
														`}
								/>
						</List.Item>
					)}
				/>
      </div>
	</div>	
	)
}

export default ListAlipayPage
