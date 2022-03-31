import React from 'react';
import { Button, Descriptions } from 'antd';
import { useHistory } from 'react-router-dom';

function OrderInfo(props) {
  const history = useHistory();
  
  const listHandler = () => {
    history.push("/order/list");
  }

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
        <Descriptions.Item label="Amount">{Number(props.detail.amount).toLocaleString()}</Descriptions.Item>
        <Descriptions.Item label="Payment state">{props.detail.paymentStatus}</Descriptions.Item>
        <Descriptions.Item label="Delivery state">{props.detail.deliveryStatus}</Descriptions.Item>
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

export default OrderInfo