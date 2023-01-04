/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from 'react';
import { Menu, Icon, Badge } from 'antd';
import { USER_SERVER } from '../../../Config';
import { withRouter } from 'react-router-dom';
import { useSelector } from "react-redux";
import { useCookies } from "react-cookie";
import axios from 'axios';
// CORS 대책
axios.defaults.withCredentials = true;
const SubMenu = Menu.SubMenu;

function RightMenu(props) {
  const user = useSelector(state => state.user)
  const [Cookies, setCookie, removeCookie] = useCookies(["w_auth", "w_authExp"]);
  
  // Login
  const logoutHandler = () => {
    axios.get(`${USER_SERVER}/logout`).then(response => {

      if (response.status === 200) {
        // 로컬스토리지 사용자 정보 삭제
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        localStorage.removeItem("userRole");
        localStorage.removeItem("i18nextLng");
        // 세션스토리지 사용자 정보 삭제
        sessionStorage.removeItem("userId");
        sessionStorage.removeItem("userName");
        // 쿠키 삭제
        removeCookie("w_auth", { path: '/' });
        removeCookie("w_authExp", { path: '/' });

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
  // 참고: 로그인 했을때는 로컬스토리지에 userName에 사용자 아이디가 저장되며 
  //      로그인하지 않았을 경우는 userName이없거나 세션스토리지에 Anonymous가 저장된다
  const sesUserName = sessionStorage.getItem("userName");
  const locUserName = localStorage.getItem("userName");
  // 세션에 사용자 이름이 있고 쿠키정보가 있는 경우
  if (sesUserName === "Anonymous" && Cookies) {
    let count = 0;
    if (user.userData) {
      if (user.userData.cart) {
        for (let i=0; i < user.userData.cart.length; i++) {
          count = count + user.userData.cart[i].quantity
        }
      }
    }
    return (
      <Menu mode={props.mode}>
        <Menu.Item key="cart" style={{paddingBottom:3}}>
          <Badge count={count}>
            <a href="/user/cart" className="head-example" style={{marginRight:-22, color:'#667777'}}>
              <Icon type="shopping-cart" style={{fontSize:30, marginBottom:3}} />
            </a>
          </Badge>
        </Menu.Item>
        <Menu.Item key="login">
          <a href="/login">Sign In</a>
        </Menu.Item>
        <Menu.Item key="preregister">
          <a href="/preregister">Sign Up</a>
        </Menu.Item>
        <Menu.Item key="inquiry">
          <a href="/mail/inquiry">Contact Us</a>
        </Menu.Item>
      </Menu>
    )
  } else if (!locUserName && !sesUserName && Cookies) {
    // 붙특정 사용자가 브라우저를 종료후 재 접속했을때
    // 브라우저를 강제로 종료한 불특정 사용자가 다시 접속했을 경우 세션에 사용자 정보가 없다
    let count = 0;
    if (user.userData) {
      if (user.userData.cart) {
        for (let i=0; i < user.userData.cart.length; i++) {
          count = count + user.userData.cart[i].quantity
        }
      }

      if (count > 0) {
        count = 0;

        // 사용자 정보 가져오기
        const objToken = {"w_auth": Cookies.w_auth}
        axios.post(`${USER_SERVER}/w_auth`, objToken)
        .then( userInfo => {
          if (userInfo.data.user[0]) {
            // 사용자 정보 삭제
            const objUserId = {"userId": userInfo.data.user[0]._id}
            axios.post(`${USER_SERVER}/delete`, objUserId)
            .then( userInfo => {
              // 쿠키 삭제
              removeCookie("w_auth");
              removeCookie("w_authExp");
            })
          }
        });
      }
    }
    return (
      <Menu mode={props.mode}>
        <Menu.Item key="cart" style={{paddingBottom:3}}>
          <Badge count={count}>
            <a href="/user/cart" className="head-example" style={{marginRight:-22, color:'#667777'}}>
              <Icon type="shopping-cart" style={{fontSize:30, marginBottom:3}} />
            </a>
          </Badge>
        </Menu.Item>
        <Menu.Item key="login">
          <a href="/login">Sign In</a>
        </Menu.Item>
        <Menu.Item key="preregister">
          <a href="/preregister">Sign Up</a>
        </Menu.Item>
        <Menu.Item key="inquiry">
          <a href="/mail/inquiry">Contact Us</a>
        </Menu.Item>
      </Menu>
    )
  } else {
    // login 했을때 메뉴
    if (user.userData) {
      let count = 0;
      if (user.userData.cart) {
        for (let i=0; i < user.userData.cart.length; i++) {
          count = count + user.userData.cart[i].quantity
        }
      }
      // 일반 사용자
      if (user.userData.role === 0) {
        return (
          <Menu mode={props.mode}>            
            {/* <Menu.Item key="chat">
              <a onClick={chatHandler}>Chat</a>
            </Menu.Item> */}
            <SubMenu title={<span>My Information</span>}>
              <Menu.Item key="pointList">
                <a href="/point/list">Point List</a>
              </Menu.Item>
            </SubMenu>
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
      // 스텝
      } else if (user.userData.role === 1) {
        return (
          <Menu mode={props.mode}>
            {/* <Menu.Item key="chat">
              <a onClick={chatHandler}>Chat</a>
            </Menu.Item> */}
            <Menu.Item key="live">
              <a href="/live">Live Streaming</a>
            </Menu.Item>
            <SubMenu title={<span>History</span>}>
              <SubMenu title={<span>Payment</span>}>
                <Menu.Item key="aliPayList">
                  <a href="/payment/alipay/list">Alipay Payment History</a>
                </Menu.Item>
                <Menu.Item key="weChatList">
                  <a href="/payment/wechat/list">WeChat Payment History</a>
                </Menu.Item>
                <Menu.Item key="paypalAdminList">
                  <a href="/payment/paypal/admin/list">Cart Payment History</a>
                </Menu.Item>
              </SubMenu>
              <Menu.Item key="mailList">
                <a href="/mail/list">Mail History</a>
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
            {/* <Menu.Item key="chat">
              <a onClick={chatHandler}>Chat</a>
            </Menu.Item> */}
            <Menu.Item key="live">
              <a href="/live">Live Streaming</a>
            </Menu.Item>
            <SubMenu title={<span>Coupon</span>}> 
              <Menu.Item key="couponList">
                <a href="/coupon/list">Coupon List</a>
              </Menu.Item>
              <Menu.Item key="couponRegister">
                <a href="/coupon/register">Coupon Register</a>
              </Menu.Item>
              <Menu.Item key="couponBirthRegister">
                <a href="/coupon/birth/register">Coupon Birthday Register</a>
              </Menu.Item>
            </SubMenu>
            <SubMenu title={<span>Sale</span>}> 
              <Menu.Item key="saleList">
                <a href="/sale/list">Sale List</a>
              </Menu.Item>
              <Menu.Item key="saleRegister">
                <a href="/sale/register">Sale Register</a>
              </Menu.Item>
            </SubMenu>
            <SubMenu title={<span>History</span>}>
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
              <Menu.Item key="mailList">
                <a href="/mail/list">Mail History</a>
              </Menu.Item>
              <Menu.Item key="couponHistory">
                <a href="/coupon/history">Coupon History</a>
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
      } else {
        return (
          <Menu mode={props.mode}>
            <Menu.Item key="cart" style={{paddingBottom:3}}>
              <Badge count={count}>
                <a href="/user/cart" className="head-example" style={{marginRight:-22, color:'#667777'}}>
                  <Icon type="shopping-cart" style={{fontSize:30, marginBottom:3}} />
                </a>
              </Badge>
            </Menu.Item>
            <Menu.Item key="login">
              <a href="/login">Sign In</a>
            </Menu.Item>
            <Menu.Item key="preregister">
              <a href="/preregister">Sign Up</a>
            </Menu.Item>
            <Menu.Item key="inquiry">
              <a href="/mail/inquiry">Contact Us</a>
            </Menu.Item>
          </Menu>
        )
      }
    } else {
      // 사용자의 카트 상품갯수 구해서 뱃지갱신
      let count = 0;
      if (user.userData) {
        if (user.userData.cart) {
          for (let i=0; i < user.userData.cart.length; i++) {
            count = count + user.userData.cart[i].quantity
          }
        }
      }
      return (
        <Menu mode={props.mode}>
          <Menu.Item key="cart" style={{paddingBottom:3}}>
            <Badge count={count}>
              <a href="/user/cart" className="head-example" style={{marginRight:-22, color:'#667777'}}>
                <Icon type="shopping-cart" style={{fontSize:30, marginBottom:3}} />
              </a>
            </Badge>
          </Menu.Item>
          <Menu.Item key="login">
            <a href="/login">Sign In</a>
          </Menu.Item>
          <Menu.Item key="preregister">
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