/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { Menu, Icon, Badge, Avatar } from 'antd';
import axios from 'axios';
import { USER_SERVER } from '../../../Config';
import { withRouter } from 'react-router-dom';
import { useSelector } from "react-redux";
// CORS 대책
axios.defaults.withCredentials = true;
const SubMenu = Menu.SubMenu;

function RightMenu(props) {
  const user = useSelector(state => state.user)

  const logoutHandler = () => {
    axios.get(`${USER_SERVER}/logout`).then(response => {
      if (response.status === 200) {
        props.history.push("/login");
      } else {
        alert('Log Out Failed')
      }
    });
  };

  // login 하지 않았을때 메뉴
  if (user.userData && !user.userData.isAuth) {
    return (
      <Menu mode={props.mode}>
        <Menu.Item key="mail">
          <a href="/login">Sign In</a>
        </Menu.Item>
        <Menu.Item key="app">
          <a href="/register">Sign Up</a>
        </Menu.Item>
      </Menu>
    )
  // login 했을때 메뉴
  } else {
    return (
      <Menu mode={props.mode}>
        <SubMenu title={<span>Data Upload</span>}>
          <Menu.Item key="univaPayCastUpload">
            <a href="/csv/upload/univaPayCast">Univapay Csv Upload</a>
          </Menu.Item>
          <Menu.Item key="smaregiUpload">
            <a href="/csv/upload/smaregi">Smaregi Csv Upload</a>
          </Menu.Item>
        </SubMenu>  
        <SubMenu title={<span>Customer</span>}>
          <Menu.Item key="register">
            <a href="/customer/register">Customer Register</a>
          </Menu.Item>
          <Menu.Item key="search">
            <a href="/customer/list">Customer List</a>
          </Menu.Item>
        </SubMenu>
        <Menu.Item key="upload">
          <a href="/product/upload">Product Upload</a>
        </Menu.Item>
        <Menu.Item key="cart" style={{paddingBottom:3}}>
          <Badge count={5}>
            <a href="/user/cart" className="head-example" style={{marginRight:-22, color:'667777'}}>
              <Icon type="shopping-cart" style={{fontSize:30, marginBottom:3}} />
            </a>
          </Badge>
        </Menu.Item>
        <Menu.Item key="contact">
          <a href="/mail/contact">Contact Us</a>
        </Menu.Item>
        <Menu.Item key="logout">
          <a onClick={logoutHandler}>Logout</a>
        </Menu.Item>
      </Menu>
    )
  }
}

export default withRouter(RightMenu);

