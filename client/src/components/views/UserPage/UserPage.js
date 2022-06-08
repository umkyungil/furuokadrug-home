import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Icon, Col, Card, Row, Carousel } from 'antd';
import { USER_SERVER } from '../../Config.js';
// CORS 대책
axios.defaults.withCredentials = true;

function UserPage() {
	const [Users, setUsers] = useState([]);

	useEffect(() => {

		axios.post(`${USER_SERVER}/api/users/list`)
			.then(response => {
					if (response.data.success) {
						console.log("response.data>>>", response.data);
						// setUsers(response.data.productInfo);
					} else {
							alert("Failed to get users.")
					}
			})
	}, [])

	return (
		<div style={{ width:'75%', margin:'3rem uto' }}>

			<div style={{ textAlign:'center' }}>
				<h2>Customer List<Icon type="rocket" /></h2>
			</div>

			{/* Filter */}

			{/* Search */}

			{/* Cards */}

			
			<div style={{ display:'flex', justifyContent:'center' }}>
				<button>더보기</button>
			</div>


	</div>	
		
	
	)
}

export default UserPage