import React from 'react';
import { Button, Descriptions } from 'antd';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { ORDER_SERVER } from '../../../Config.js';
import { useSelector } from "react-redux";

function OrderInfo(props) {
  const history = useHistory();
  const user = useSelector(state => state.user)
  
  function deleteHandler() {
    // 주문정보 및 결제정보 삭제
    let body = {orderId:props.detail._id, type:props.detail.type, uniqueField:props.detail.uniqueField}
		axios.post(`${ORDER_SERVER}/delete`, body)
      .then(response => {
        if (response.data.success) {
					history.push("/order/list");
        } else {
          alert("Failed to delete order information.")
        }
      })
	}

  const listHandler = () => {
    history.push("/order/list");
  }

  if (user.userData) {
		if (user.userData.role === 1) {
      return (
        <div>
          <Descriptions>
            <Descriptions.Item label="Type">{props.detail.type}</Descriptions.Item>
            <Descriptions.Item label="User ID">{props.detail.userId}</Descriptions.Item>
            <Descriptions.Item label="Name">{props.detail.name}</Descriptions.Item>
            <Descriptions.Item label="LastName">{props.detail.lastName}</Descriptions.Item>
            <Descriptions.Item label="Phone number">{props.detail.tel}</Descriptions.Item>
            <Descriptions.Item label="E-mal">{props.detail.email}</Descriptions.Item>
            <Descriptions.Item label="Shipping address">{props.detail.address}</Descriptions.Item>
            <Descriptions.Item label="Payment time">{props.detail.sod}</Descriptions.Item>
            <Descriptions.Item label="UniqueField">{props.detail.uniqueField}</Descriptions.Item>
            <Descriptions.Item label="Amount">￥{Number(props.detail.amount).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Payment state">{props.detail.paymentStatus}</Descriptions.Item>
            <Descriptions.Item label="Delivery state">{props.detail.deliveryStatus}</Descriptions.Item>
            <Descriptions.Item label="Service staff">{props.detail.staffName}</Descriptions.Item>
          </Descriptions>

          <br />
          <br />
          <br />
          <div style={{ display: 'flex', justifyContent: 'center' }} >
            <Button size="large" onClick={listHandler}>
              Order List
            </Button>
          </div>
        </div>
      )
    } else {
      return (
        <div>
          <Descriptions>
            <Descriptions.Item label="Type">{props.detail.type}</Descriptions.Item>
            <Descriptions.Item label="User ID">{props.detail.userId}</Descriptions.Item>
            <Descriptions.Item label="Name">{props.detail.name}</Descriptions.Item>
            <Descriptions.Item label="LastName">{props.detail.lastName}</Descriptions.Item>
            <Descriptions.Item label="Phone number">{props.detail.tel}</Descriptions.Item>
            <Descriptions.Item label="E-mal">{props.detail.email}</Descriptions.Item>
            <Descriptions.Item label="Shipping address">{props.detail.address}</Descriptions.Item>
            <Descriptions.Item label="Payment time">{props.detail.sod}</Descriptions.Item>
            <Descriptions.Item label="UniqueField">{props.detail.uniqueField}</Descriptions.Item>
            <Descriptions.Item label="Amount">￥{Number(props.detail.amount).toLocaleString()}</Descriptions.Item>
            <Descriptions.Item label="Payment state">{props.detail.paymentStatus}</Descriptions.Item>
            <Descriptions.Item label="Delivery state">{props.detail.deliveryStatus}</Descriptions.Item>
            <Descriptions.Item label="Service staff">{props.detail.staffName}</Descriptions.Item>
          </Descriptions>

          <br />
          <br />
          <br />
          <div style={{ display: 'flex', justifyContent: 'center' }} >
            <Button size="large" onClick={listHandler}>
              Order List
            </Button>
            &nbsp;&nbsp;&nbsp;
            <Button size="large" type="danger" onClick={deleteHandler}>
              Delete
            </Button>
          </div>
        </div>
      )
    }
  } else {
    return (
      <div>
        <Descriptions>
          <Descriptions.Item label="Type">{props.detail.type}</Descriptions.Item>
          <Descriptions.Item label="User ID">{props.detail.userId}</Descriptions.Item>
          <Descriptions.Item label="Name">{props.detail.name}</Descriptions.Item>
          <Descriptions.Item label="LastName">{props.detail.lastName}</Descriptions.Item>
          <Descriptions.Item label="Phone number">{props.detail.tel}</Descriptions.Item>
          <Descriptions.Item label="E-mal">{props.detail.email}</Descriptions.Item>
          <Descriptions.Item label="Shipping address">{props.detail.address}</Descriptions.Item>
          <Descriptions.Item label="Payment time">{props.detail.sod}</Descriptions.Item>
          <Descriptions.Item label="UniqueField">{props.detail.uniqueField}</Descriptions.Item>
          <Descriptions.Item label="Amount">￥{Number(props.detail.amount).toLocaleString()}</Descriptions.Item>
          <Descriptions.Item label="Payment state">{props.detail.paymentStatus}</Descriptions.Item>
          <Descriptions.Item label="Delivery state">{props.detail.deliveryStatus}</Descriptions.Item>
          <Descriptions.Item label="Service staff">{props.detail.staffName}</Descriptions.Item>
        </Descriptions>

        <br />
        <br />
        <br />
        <div style={{ display: 'flex', justifyContent: 'center' }} >
            <Button size="large" onClick={listHandler}>
              Order List
            </Button>
          </div>
      </div>
    )
  }
}

export default OrderInfo