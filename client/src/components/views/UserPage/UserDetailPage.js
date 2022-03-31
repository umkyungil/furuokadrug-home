import React, { useEffect, useState } from 'react';
import axios from 'axios';
import UserInfo from './Sections/UserInfo'
import { Row, Col } from 'antd';
import { USER_SERVER } from '../../Config.js';
// CORS 대책
axios.defaults.withCredentials = true;

function UserDetailPage(props) {
  const [User, setUser] = useState({});
  const userId = props.match.params.userId;

  useEffect(() => {
    axios.get(`${USER_SERVER}/users_by_id?id=${userId}&type=single`)
      .then(response => {
        if (response.data.success) {
          setUser(response.data.user[0])
        } else {
          alert("Failed to get user information.")
        }
      })
  }, [])

  return (
    <div style={{ width:'100%', padding:'3rem 4rem' }}>
      <div style={{ display:'flex', justifyContent:'center' }}>
        <h1>User Info</h1>
      </div>
      <br />
      
      {/* 여백설정 */}
      <Row gutter={[16, 16]} >
        <Col lg={32} sm={24}>
          {/* ProductInfo */}
          <UserInfo detail={User} />
        </Col>
      </Row>
    </div>
  )
}

export default UserDetailPage