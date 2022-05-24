import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { List } from 'antd';
import SearchFeature from './Sections/SearchFeature';
import { PAYMENT_SERVER } from '../../Config.js';
// CORS 대책
axios.defaults.withCredentials = true;

function ListPaypalPage(props) {
  const [PaypalInfo, setPaypalInfo] = useState([]);
  const [SearchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    let body = {
			skip: 0,
			limit: 8
		}
    getPaypalInfo(body);

  }, [])

  // 결제 정보 취득
  const getPaypalInfo = async (body) => {
    try {
      const result = await axios.get(`${PAYMENT_SERVER}/paypal/list`, body);
      if (result.data.success) {        
        let data = [];

        for (let i=0; i<result.data.paypalInfo.length; i++) {
          for (let j=0; j<result.data.paypalInfo[i].product.length; j++) {
            let products = result.data.paypalInfo[i].product[j];
            products.userId = result.data.paypalInfo[i].user[0].id;
            products.userName = result.data.paypalInfo[i].user[0].name;
            data.push(products);
          }
        }
        setPaypalInfo([...data]);        
      }
    } catch (err) {
      console.log("getPaypalInfo err: ", err);
    }
  }

  // Paypal 결제정보 검색
	const updateSearchTerm = (newSearchTerm) => {
		console.log("newSearchTerm: ", newSearchTerm);

		let body = {
			searchTerm: newSearchTerm
		}

		setSearchTerm(newSearchTerm);
		getPaypalInfo(body);
	}
  
  return (
    <div style={{ width:'80%', margin: '3rem auto'}}>
      <div style={{ textAlign: 'center' }}>
        <h1>Paypal Payment History</h1>
      </div>
      <br />

      <table>
        <thead>
          <tr>
            <th>Payment Id</th>
            <th>Product Name</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>User Name</th>
            <th>Date of Purchase</th>
          </tr>
        </thead>
        <tbody>
          {PaypalInfo.length > 0 && PaypalInfo.map((item, idx) => (
            <tr key={idx}>
              <td>{item.paymentId}</td>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>¥ {Number(item.price).toLocaleString()}2</td>
              <td>{item.userName}</td>
              <td>{item.dateOfPurchase}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
  


export default ListPaypalPage;