import React, { useState } from 'react';
import { Button, Descriptions, Tooltip } from 'antd';
import { useDispatch } from 'react-redux';
import { deleteUser } from '../../../../_actions/user_actions';
import { useHistory } from 'react-router-dom';

function UserInfo(props) {
    
  let address1 = "";
  let address2 = "";
  let address3 = "";
  let role = "";
  let language = "";

  // 주소값1 변경
  if (props.detail.address1) {
    address1 = props.detail.address1;
    if (address1.length > 21) {
      address1 = address1.slice(0, 21)
      address1 = address1 + "...";
    }
  }
  // 주소값2 변경
  if (props.detail.address2) {
    address2 = props.detail.address2;
    if (props.detail.address2.length > 21) {
      address2 = address2.slice(0, 21)
      address2 = address2 + "...";
    }
  }
  // 주소값3 변경
  if (props.detail.address3) {
    address3 = props.detail.address3;
    if (props.detail.address3.length > 21) {
      address3 = address3.slice(0, 21);
      address3 = address3 + "...";
    }
  }
  // 권한값 변경
  if (props.detail.role === 0) role = "user";
  if (props.detail.role === 1) role = "staff";
  if (props.detail.role === 2) role = "admin";
  // 언어값 변경
  if (props.detail.language === "en") language = "English";
  if (props.detail.language === "cn") language = "Chinese";
  if (props.detail.language === "jp") language = "Japanese";

  const history = useHistory();
  const dispatch = useDispatch();
  const deleteHandler = () => {
    dispatch(deleteUser(props.detail._id))
      .then(response => {
        if (response.payload.success) {
          history.push("/user/list");
        } else {
          alert("Failed to delete user information.")
        }
      }
    )
  }
  
  const listHandler = () => {
    history.push("/user/list");
  }
  
  return (
    <div>
      <Descriptions>
        <Descriptions.Item label="Name">{props.detail.name}</Descriptions.Item>
        <Descriptions.Item label="LastName">{props.detail.lastName}</Descriptions.Item>
        <Descriptions.Item label="Phone number">{props.detail.tel}</Descriptions.Item>
        <Descriptions.Item label="E-mal">{props.detail.email}</Descriptions.Item>
        <Descriptions.Item label="Role">{role}</Descriptions.Item>
        <Descriptions.Item label="Point">{props.detail.point}</Descriptions.Item>
        <Descriptions.Item label="Address1"><Tooltip title={props.detail.address1}>{address1}</Tooltip></Descriptions.Item>
        <Descriptions.Item label="Address2"><Tooltip title={props.detail.address2}>{address2}</Tooltip></Descriptions.Item> 
        <Descriptions.Item label="Address3"><Tooltip title={props.detail.address3}>{address3}</Tooltip></Descriptions.Item>
        <Descriptions.Item label="Language">{language}</Descriptions.Item>
      </Descriptions>

      <br />
      <br />
      <br />
      <div style={{ display: 'flex', justifyContent: 'center' }} >
        <Button size="large" onClick={listHandler}>
          User List
        </Button>
        &nbsp;&nbsp;&nbsp;
        <Button size="large" type="danger" onClick={deleteHandler}>
          Delete
        </Button>
      </div>
    </div>
  )
}

export default UserInfo
