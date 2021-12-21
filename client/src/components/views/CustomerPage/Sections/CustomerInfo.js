import React from 'react'
import { Button, Descriptions } from 'antd';
import { useDispatch } from 'react-redux'
import { deleteCustomer } from '../../../../_actions/customer_actions';
import { useHistory } from 'react-router-dom';

function CustomerInfo(props) {

  const history = useHistory();
  const dispatch = useDispatch();
  const deleteHandler = () => {
    dispatch(deleteCustomer(props.detail._id))
      .then(response => {
        if (response.payload.success) {
          history.push("/customer/list");
        } else {
          alert("Failed to delete customer information.")
        }
      }
    )
  }
  
  const listHandler = () => {
    history.push("/customer/list");
  }
  
  return (
    <div>
      <Descriptions>
        <Descriptions.Item label="Name">{props.detail.name}</Descriptions.Item>
        <Descriptions.Item label="Smaregi ID">{props.detail.smaregiId}</Descriptions.Item>
        <Descriptions.Item label="Phone number">{props.detail.tel}</Descriptions.Item>
        <Descriptions.Item label="Emal">{props.detail.email}</Descriptions.Item>
        <Descriptions.Item label="Address">{props.detail.address}</Descriptions.Item>
        <Descriptions.Item label="Salesman">{props.detail.salesman}</Descriptions.Item>
        <Descriptions.Item label="Point">{props.detail.point}</Descriptions.Item>
      </Descriptions>

      <br />
      <br />
      <br />
      <div style={{ display: 'flex', justifyContent: 'center' }} >
        <Button size="large" shape="round" type="primary" onClick={listHandler}>
          Customer List
        </Button>
        &nbsp;&nbsp;&nbsp;
        <Button size="large" shape="round" type="danger" onClick={deleteHandler}>
          Delete
        </Button>
      </div>
    </div>
  )
}

export default CustomerInfo
