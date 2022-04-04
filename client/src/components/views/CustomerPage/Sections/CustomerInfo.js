import React from 'react';
import { Button, Descriptions } from 'antd';
import { useDispatch } from 'react-redux';
import { deleteCustomer } from '../../../../_actions/customer_actions';
import { useHistory } from 'react-router-dom';
import { useSelector } from "react-redux";

function CustomerInfo(props) {
  const history = useHistory();
  const user = useSelector(state => state.user)
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
  
  if (user.userData) {
		if (user.userData.role === 1) {
      return (
        <div>
          <Descriptions>
            <Descriptions.Item label="Name">{props.detail.name}</Descriptions.Item>
            <Descriptions.Item label="Smaregi ID">{props.detail.smaregiId}</Descriptions.Item>
            <Descriptions.Item label="Phone number">{props.detail.tel}</Descriptions.Item>
            <Descriptions.Item label="Emal">{props.detail.email}</Descriptions.Item>
            <Descriptions.Item label="Address1">{props.detail.address1}</Descriptions.Item>
            <Descriptions.Item label="Address2">{props.detail.address2}</Descriptions.Item>
            <Descriptions.Item label="Address3">{props.detail.address3}</Descriptions.Item>
            <Descriptions.Item label="Salesman">{props.detail.salesman}</Descriptions.Item>
            <Descriptions.Item label="Point">{props.detail.point}</Descriptions.Item>
          </Descriptions>

          <br />
          <br />
          <br />
          <div style={{ display: 'flex', justifyContent: 'center' }} >
            <Button size="large" onClick={listHandler}>
              Customer List
            </Button>
          </div>
        </div>
      )
    } else {
      return (
        <div>
          <Descriptions>
            <Descriptions.Item label="Name">{props.detail.name}</Descriptions.Item>
            <Descriptions.Item label="Smaregi ID">{props.detail.smaregiId}</Descriptions.Item>
            <Descriptions.Item label="Phone number">{props.detail.tel}</Descriptions.Item>
            <Descriptions.Item label="Emal">{props.detail.email}</Descriptions.Item>
            <Descriptions.Item label="Address1">{props.detail.address1}</Descriptions.Item>
            <Descriptions.Item label="Address2">{props.detail.address2}</Descriptions.Item>
            <Descriptions.Item label="Address3">{props.detail.address3}</Descriptions.Item>
            <Descriptions.Item label="Salesman">{props.detail.salesman}</Descriptions.Item>
            <Descriptions.Item label="Point">{props.detail.point}</Descriptions.Item>
          </Descriptions>

          <br />
          <br />
          <br />
          <div style={{ display: 'flex', justifyContent: 'center' }} >
            <Button size="large" onClick={listHandler}>
              Customer List
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
          <Descriptions.Item label="Name">{props.detail.name}</Descriptions.Item>
          <Descriptions.Item label="Smaregi ID">{props.detail.smaregiId}</Descriptions.Item>
          <Descriptions.Item label="Phone number">{props.detail.tel}</Descriptions.Item>
          <Descriptions.Item label="Emal">{props.detail.email}</Descriptions.Item>
          <Descriptions.Item label="Address1">{props.detail.address1}</Descriptions.Item>
          <Descriptions.Item label="Address2">{props.detail.address2}</Descriptions.Item>
          <Descriptions.Item label="Address3">{props.detail.address3}</Descriptions.Item>
          <Descriptions.Item label="Salesman">{props.detail.salesman}</Descriptions.Item>
          <Descriptions.Item label="Point">{props.detail.point}</Descriptions.Item>
        </Descriptions>

        <br />
        <br />
        <br />
        <div style={{ display: 'flex', justifyContent: 'center' }} >
          <Button size="large" onClick={listHandler}>
            Customer List
          </Button>
        </div>
      </div>
    )
  }
}

export default CustomerInfo
