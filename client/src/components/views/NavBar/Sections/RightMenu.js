/* eslint-disable jsx-a11y/anchor-is-valid */
import React from 'react';
import { Menu, Icon, Badge } from 'antd';
import axios from 'axios';
import { USER_SERVER } from '../../../Config';
import { withRouter } from 'react-router-dom';
import { useSelector } from "react-redux";
// CORS 대책
axios.defaults.withCredentials = true;
const SubMenu = Menu.SubMenu;

function RightMenu(props) {
  const user = useSelector(state => state.user)

  // Login
  const logoutHandler = () => {
    axios.get(`${USER_SERVER}/logout`).then(response => {
      if (response.status === 200) {
        // 로컬스토리지 사용자 정보 삭제
        window.localStorage.removeItem("userId");
        window.localStorage.removeItem("userRole");
        window.localStorage.removeItem("i18nextLng");
        window.localStorage.removeItem("userName");

        props.history.push("/login");
      } else {
        console.log('Log Out Failed')
      }
    });
  };
  // Chat Popup
  const chatHandler = () => {
    let href = "https://umkyungil.github.io/furuokadrug-twitter/#/";
    let w = 450;
    let h = 800;
    let xPos = (document.body.offsetWidth-w); //오른쪽 정렬
    let yPos = (document.body.offsetHeight/2) - (h/2);

    window.open(href, "pop_name", "width="+w+", height="+h+", left="+xPos+", top="+yPos+", menubar=yes, status=yes, titlebar=yes, resizable=yes");
  };

  // login 하지 않았을때
  if (user.userData  && !user.userData.isAuth) {
    return (
      <Menu mode={props.mode}>
        <Menu.Item key="in">
          <a href="/login">Sign In</a>
        </Menu.Item>
        <Menu.Item key="up">
          <a href="/preregister">Sign Up</a>
        </Menu.Item>
        <Menu.Item key="contact">
          <a href="/mail/inquiry">Contact Us</a>
        </Menu.Item>
      </Menu>
    )
  // login 했을때 메뉴
  } else {
    if (user.userData) {
      // 사용자의 카트 상품갯수 구해서 뱃지갱신
      let count = 0;
      if (user.userData.cart) {
        for (let i=0; i < user.userData.cart.length; i++) {
          count = count + user.userData.cart[i].quantity
        }
      }
      
      // 스텝
      if (user.userData.role === 1) {
        return (
          <Menu mode={props.mode}>
            <Menu.Item key="chat">
              <a onClick={chatHandler}>Chat</a>
            </Menu.Item>
            <Menu.Item key="live">
              <a href="/live">Live Streaming</a>
            </Menu.Item>
            <Menu.Item key="list">
              <a href="/order/list">Order list</a>
            </Menu.Item>            
            <SubMenu title={<span>Mail</span>}>          
              <Menu.Item key="mailList">
                <a href="/mail/list">Mail History</a>
              </Menu.Item>
            </SubMenu>
            <SubMenu title={<span>Payment</span>}>          
              <Menu.Item key="alipayList">
                <a href="/payment/alipay/list">Alipay Payment History</a>
              </Menu.Item>
              <Menu.Item key="wechatList">
                <a href="/payment/wechat/list">WeChat Payment History</a>
              </Menu.Item>
              <Menu.Item key="paypalAdminList">
                <a href="/payment/paypal/admin/list">Cart Payment History</a>
              </Menu.Item>
            </SubMenu>
            <SubMenu title={<span>Customer</span>}>
              <Menu.Item key="register">
                <a href="/customer/register">Customer Register</a>
              </Menu.Item>
              <Menu.Item key="list">
                <a href="/customer/list">Customer List</a>
              </Menu.Item>
            </SubMenu>
            <Menu.Item key="logout">
              <a onClick={logoutHandler}>Logout</a>
            </Menu.Item>
          </Menu>
        )
      // 관리자
      } else if (user.userData.role === 2) {
        return (
          <Menu mode={props.mode}>
            <Menu.Item key="chat">
              <a onClick={chatHandler}>Chat</a>
            </Menu.Item>
            <Menu.Item key="live">
              <a href="/live">Live Streaming</a>
            </Menu.Item>
            <Menu.Item key="list">
              <a href="/order/list">Order list</a>
            </Menu.Item>
            <SubMenu title={<span>Mail</span>}>          
              <Menu.Item key="mailList">
                <a href="/mail/list">Mail History</a>
              </Menu.Item>
            </SubMenu>
            <SubMenu title={<span>Payment</span>}>          
              <Menu.Item key="alipayList">
                <a href="/payment/alipay/list">Alipay Payment History</a>
              </Menu.Item>
              <Menu.Item key="wechatList">
                <a href="/payment/wechat/list">WeChat Payment History</a>
              </Menu.Item>
              <Menu.Item key="paypalAdminList">
                <a href="/payment/paypal/admin/list">Cart Payment History</a>
              </Menu.Item>              
            </SubMenu>
            <SubMenu title={<span>Customer</span>}>
              <Menu.Item key="customerRegister">
                <a href="/customer/register">Customer Register</a>
              </Menu.Item>
              <Menu.Item key="customerList">
                <a href="/customer/list">Customer List</a>
              </Menu.Item>
            </SubMenu>
            <SubMenu title={<span>Upload</span>}>
              <Menu.Item key="upload">
                <a href="/product/upload">Product Upload</a>
              </Menu.Item>
              <Menu.Item key="csvUpload">
                <a href="/csv/upload/univaPayCast">UPC CSV Upload</a>
              </Menu.Item>
            </SubMenu>
            <SubMenu title={<span>User</span>}>
              <Menu.Item key="userRegister">
                <a href="/register">User Register</a>
              </Menu.Item>
              <Menu.Item key="userList">
                <a href="/user/list">User List</a>
              </Menu.Item>
            </SubMenu>            
            <Menu.Item key="logout">
              <a onClick={logoutHandler}>Logout</a>
            </Menu.Item>
          </Menu>
        )
      } else if (user.userData.role === 0) {   
        // 일반 사용자
        return (
          <Menu mode={props.mode}>            
            <Menu.Item key="chat">
              <a onClick={chatHandler}>Chat</a>
            </Menu.Item>
            <Menu.Item key="live">
              <a href="/live">Live Streaming</a>
            </Menu.Item>
            <Menu.Item key="paypalList">
              <a href="/payment/paypal/list">Cart Payment List</a>
            </Menu.Item>
            <Menu.Item key="list">
              <a href="/order/list">Order list</a>
            </Menu.Item>
            <Menu.Item key="cart" style={{paddingBottom:3}}>
              <Badge count={count}>
                <a href="/user/cart" className="head-example" style={{marginRight:-22, color:'#667777'}}>
                  <Icon type="shopping-cart" style={{fontSize:30, marginBottom:3}} />
                </a>
              </Badge>
            </Menu.Item>
            <Menu.Item key="inquiry">
              <a href="/mail/inquiry">Contact Us</a>
            </Menu.Item>
            <Menu.Item key="logout">
              <a onClick={logoutHandler}>Logout</a>
            </Menu.Item>
          </Menu>
        )
      }
    } else {
      return (
        <Menu mode={props.mode}>
          <Menu.Item key="mail">
            <a href="/login">Sign In</a>
          </Menu.Item>
          <Menu.Item key="app">
            <a href="/preregister">Sign Up</a>
          </Menu.Item>
          <Menu.Item key="inquiry">
            <a href="/mail/inquiry">Contact Us</a>
          </Menu.Item>
        </Menu>
      )
    }
  }
}

export default withRouter(RightMenu);