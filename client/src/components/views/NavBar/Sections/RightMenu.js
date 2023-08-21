/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useContext } from 'react';
import { Menu, Icon, Badge } from 'antd';
import { USER_SERVER } from '../../../Config';
import { ENGLISH, JAPANESE, CHINESE, I18N_ENGLISH, I18N_CHINESE, I18N_JAPANESE } from '../../../utils/Const';
import { withRouter } from 'react-router-dom';
import { useSelector } from "react-redux";
import cookie from 'react-cookies';
import { LanguageContext } from '../../../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
// CORS 대책
axios.defaults.withCredentials = true;

const SubMenu = Menu.SubMenu;

function RightMenu(props) {
  const user = useSelector(state => state.user);
  const {isLanguage, setIsLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  // 다국적언어
  const setMultiLanguage = (lang) => {    
    setIsLanguage(lang);
    i18n.changeLanguage(lang);
  }
  
  // Logout
  const logoutHandler = async () => {
    try {
      const userId = localStorage.getItem("userId");
      await axios.get(`${USER_SERVER}/logout?id=${userId}`);
  
      // 로컬스토리지 사용자정보 삭제
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userRole");
      localStorage.removeItem("i18nextLng");
      // 세션스토리지 불특정 사용자정보 삭제
      sessionStorage.removeItem("userId");
      sessionStorage.removeItem("userName");
      // 세션스토리지 랜딩페이지 비디오정보 삭제
      sessionStorage.removeItem("video_cn");
      sessionStorage.removeItem("video_en");
      sessionStorage.removeItem("video_jp");
      // 토큰 연장시간 삭제
      sessionStorage.removeItem("tokenAddedTime");
      // 포인트 적용률 삭제
      sessionStorage.removeItem("pointRate");
      // 쿠키 삭제
      cookie.remove('w_auth', { path: '/' });
      cookie.remove('w_authExp', { path: '/' });

      props.history.push("/login");
    } catch (err) {
      console.log("err: ", err);
      alert('Please contact the administrator');
      props.history.push("/login");
    }
  };

  const cartCount = (data) => {
    let count = 0;
    if (data) {
      for (let i=0; i < data.length; i++) {
        count = count + data[i].quantity
      }
    }
    
    return count;
  }

  // Chat Popup
  // const chatHandler = () => {
  //   let href = "https://umkyungil.github.io/furuokadrug-twitter/#/";
  //   let w = 450;
  //   let h = 800;
  //   let xPos = (document.body.offsetWidth-w); //오른쪽 정렬
  //   let yPos = (document.body.offsetHeight/2) - (h/2);

  //   window.open(href, "pop_name", "width="+w+", height="+h+", left="+xPos+", top="+yPos+", menubar=yes, status=yes, titlebar=yes, resizable=yes");
  // };
  

  // login 하지 않았을때
  // 참고: 로그인 했을때는 로컬스토리지에 userName에 사용자 아이디가 저장되며 
  //      로그인하지 않았을 경우는 userName이없거나 세션스토리지에 Anonymous가 저장된다
  const sesUserName = sessionStorage.getItem("userName");
  const locUserName = localStorage.getItem("userName");

  // 불특정 사용자로 로그인 된 경우
  if (sesUserName) {
    let count = 0;
    if (user.userData) {
      count = cartCount(user.userData.cart);
    }
    
    return (
      <Menu mode={props.mode} style={{backgroundColor: '#1a1e65'}}>
        <Menu.Item key="reserve">
          <a href="/mail/reserve" style={{color: 'white'}}>Reservation</a>
        </Menu.Item>
        <SubMenu title={<span style={{color: 'white'}}>Language</span>}>          
          <Menu.Item key="english">
            <span onClick={() => setMultiLanguage(I18N_ENGLISH)}>{ENGLISH}</span>
          </Menu.Item>
          <Menu.Item key="japanese">
            <span onClick={() => setMultiLanguage(I18N_JAPANESE)}>{JAPANESE}</span>
          </Menu.Item>
          <Menu.Item key="chinese">
            <span onClick={() => setMultiLanguage(I18N_CHINESE)}>{CHINESE}</span>
          </Menu.Item>
        </SubMenu>

        <Menu.Item key="cart" style={{paddingBottom:3}}>
          <Badge count={count}>
            <a href="/user/cart" className="head-example" style={{marginRight:-22, color:'#667777'}}>
              <Icon type="shopping-cart" style={{fontSize:30, marginBottom:3}} />
            </a>
          </Badge>
        </Menu.Item>
        <Menu.Item key="login">
          <a href="/login" style={{color: 'white'}}>Sign In</a>
        </Menu.Item>
        <Menu.Item key="preregister">
          <a href="/preregister" style={{color: 'white'}}>Sign Up</a>
        </Menu.Item>
        <Menu.Item key="inquiry">
          <a href="/mail/inquiry" style={{color: 'white'}}>Contact Us</a>
        </Menu.Item>
      </Menu>
    )
  } else {
    // 로그인 했고 user.userData를 가져왔으 경우
    if (user.userData) {
      let count = 0;
      count = cartCount(user.userData.cart);

      // 일반 사용자
      if (user.userData.role === 0) {
        return (
          <Menu mode={props.mode} style={{backgroundColor: '#1a1e65'}}>
            <Menu.Item key="reserve">
              <a href="/mail/reserve" style={{color: 'white'}}>Reservation</a>
            </Menu.Item>
            <SubMenu title={<span style={{color: 'white'}}>Language</span>}>          
              <Menu.Item key="english">
                <span onClick={() => setMultiLanguage(I18N_ENGLISH)}>{ENGLISH}</span>
              </Menu.Item>
              <Menu.Item key="japanese">
                <span onClick={() => setMultiLanguage(I18N_JAPANESE)}>{JAPANESE}</span>
              </Menu.Item>
              <Menu.Item key="chinese">
                <span onClick={() => setMultiLanguage(I18N_CHINESE)}>{CHINESE}</span>
              </Menu.Item>
            </SubMenu>

            {/* <Menu.Item key="chat">
              <a onClick={chatHandler}>Chat</a>
            </Menu.Item> */}
            <SubMenu title={<span style={{color: 'white'}}>My Information</span>}>
              {/* <Menu.Item key="pointList">
                <a href="/point/list">Point List</a>
              </Menu.Item>
              <Menu.Item key="paypalList">
                <a href="/payment/paypal/list" >Cart Payment List</a>
              </Menu.Item>
              <Menu.Item key="list">
                <a href="/order/list" >Order list</a>
              </Menu.Item> */}
              <Menu.Item key="myInfoDetail">
                <a href="/myInfo/detail">MyInfo detail</a>
              </Menu.Item>
            </SubMenu>
            <Menu.Item key="live">
              <a href="/live" style={{color: 'white'}}>Live Streaming</a>
            </Menu.Item>            
            <Menu.Item key="cart" style={{paddingBottom:3}}>
              <Badge count={count}>
                <a href="/user/cart" className="head-example" style={{marginRight:-22, color:'#667777'}}>
                  <Icon type="shopping-cart" style={{fontSize:30, marginBottom:3}} />
                </a>
              </Badge>
            </Menu.Item>
            <Menu.Item key="inquiry">
              <a href="/mail/inquiry" style={{color: 'white'}}>Contact Us</a>
            </Menu.Item>
            <Menu.Item key="logout">
              <a onClick={logoutHandler} style={{color: 'white'}}>Logout</a>
            </Menu.Item>
          </Menu>
        )
      // 스텝
      } else if (user.userData.role === 1) {
        return (
          <Menu mode={props.mode} style={{backgroundColor: '#1a1e65'}}>
            <SubMenu title={<span style={{color: 'white'}}>Language</span>}>          
              <Menu.Item key="english">
                <span onClick={() => setMultiLanguage(I18N_ENGLISH)}>{ENGLISH}</span>
              </Menu.Item>
              <Menu.Item key="japanese">
                <span onClick={() => setMultiLanguage(I18N_JAPANESE)}>{JAPANESE}</span>
              </Menu.Item>
              <Menu.Item key="chinese">
                <span onClick={() => setMultiLanguage(I18N_CHINESE)}>{CHINESE}</span>
              </Menu.Item>
            </SubMenu>

            {/* <Menu.Item key="chat">
              <a onClick={chatHandler}>Chat</a>
            </Menu.Item> */}
            <Menu.Item key="live">
              <a href="/live" style={{color: 'white'}}>Live Streaming</a>
            </Menu.Item>
            <SubMenu title={<span style={{color: 'white'}}>History</span>}>
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
              <a onClick={logoutHandler} style={{color: 'white'}}>Logout</a>
            </Menu.Item>
          </Menu>
        )
      // 관리자
      } else if (user.userData.role === 2) {
        return (
          <Menu mode={props.mode} style={{backgroundColor: '#1a1e65'}}>
            <SubMenu title={<span style={{color: 'white'}}>Language</span>}>          
              <Menu.Item key="english">
                <span onClick={() => setMultiLanguage(I18N_ENGLISH)}>{ENGLISH}</span>
              </Menu.Item>
              <Menu.Item key="japanese">
                <span onClick={() => setMultiLanguage(I18N_JAPANESE)}>{JAPANESE}</span>
              </Menu.Item>
              <Menu.Item key="chinese">
                <span onClick={() => setMultiLanguage(I18N_CHINESE)}>{CHINESE}</span>
              </Menu.Item>
            </SubMenu>

            {/* <Menu.Item key="chat">
              <a onClick={chatHandler}>Chat</a>
            </Menu.Item> */}
            <Menu.Item key="live">
              <a href="/live" style={{color: 'white'}}>Live Streaming</a>
            </Menu.Item>
            {/* <Menu.Item key="jitSi">
              <a href="/jitSi" style={{color: 'white'}}>JitSi meet</a>
            </Menu.Item>  */}
            <SubMenu title={<span style={{color: 'white'}}>User</span>}>
              <Menu.Item key="userRegister">
                <a href="/register">User Reg</a>
              </Menu.Item>
              <Menu.Item key="userList">
                <a href="/user/list">User List</a>
              </Menu.Item>
            </SubMenu>
            <SubMenu title={<span style={{color: 'white'}}>Product</span>}>
              <Menu.Item key="productRegister">
                <a href="/product/upload">Product Reg</a>
              </Menu.Item>
              <Menu.Item key="productCsv">
                <a href="/product/csv/upload">Product CSV</a>
              </Menu.Item>
              <Menu.Item key="inventoryList">
                <a href="/inventory/list">Inventory List</a>
              </Menu.Item>
              <Menu.Item key="productList">
                <a href="/product/admin/list">Product Admin List</a>
              </Menu.Item>
            </SubMenu>

            <SubMenu title={<span style={{color: 'white'}}>Other Mgt</span>}>
              <SubMenu title={<span>Order</span>}>
                <Menu.Item key="orderList">
                  <a href="/order/list" >Order list</a>
                </Menu.Item>
              </SubMenu>
              <SubMenu title={<span>Sale</span>}>
                <Menu.Item key="saleList">
                  <a href="/sale/list">Sale List</a>
                </Menu.Item>
                <Menu.Item key="saleRegister">
                  <a href="/sale/register">Sale Reg</a>
                </Menu.Item>
              </SubMenu>
              <SubMenu title={<span>Coupon</span>}>
                <Menu.Item key="couponList">
                  <a href="/coupon/list">Coupon List</a>
                </Menu.Item>
                <Menu.Item key="couponRegister">
                  <a href="/coupon/register">Coupon Reg</a>
                </Menu.Item>
                <Menu.Item key="couponBirthRegister">
                  <a href="/coupon/birth/register">Coupon Birthday Reg</a>
                </Menu.Item>
              </SubMenu>
              <SubMenu title={<span>Images</span>}>
                <Menu.Item key="imgReg">
                  <a href="/images/register">Images Reg</a>
                </Menu.Item>
                <Menu.Item key="imagesList">
                  <a href="/images/list">Images List</a>
                </Menu.Item>
              </SubMenu>
              <SubMenu title={<span>Code</span>}>
                <Menu.Item key="codeReg">
                  <a href="/code/register">Code Reg</a>
                </Menu.Item>
                <Menu.Item key="codeList">
                  <a href="/code/list">Code List</a>
                </Menu.Item>
              </SubMenu>
              <Menu.Item key="csv">
                <a href="/csv/upload/univaPayCast">CSV Upload</a>
              </Menu.Item>
              <SubMenu title={<span>History</span>}>
                <Menu.Item key="alipayList">
                  <a href="/payment/alipay/list">Alipay Payment History</a>
                </Menu.Item>
                <Menu.Item key="wechatList">
                  <a href="/payment/wechat/list">WeChat Payment History</a>
                </Menu.Item>
                <Menu.Item key="paypalAdminList">
                  <a href="/payment/paypal/admin/list">Cart Payment History</a>
                </Menu.Item>
                <Menu.Item key="mailList">
                  <a href="/mail/list">Mail History</a>
                </Menu.Item>
                <Menu.Item key="couponHistory">
                  <a href="/coupon/history">Coupon History</a>
                </Menu.Item>
              </SubMenu>
            </SubMenu>
            <Menu.Item key="logout">
              <a onClick={logoutHandler} style={{color: 'white'}}>Logout</a>
            </Menu.Item>
          </Menu>
        ) 
      } else {
        return (
          <Menu mode={props.mode} style={{backgroundColor: '#1a1e65'}}>
            <Menu.Item key="reserve">
              <a href="/mail/reserve" style={{color: 'white'}}>Reservation</a>
            </Menu.Item>
            <SubMenu title={<span style={{color: 'white'}}>Language</span>}>          
              <Menu.Item key="english">
                <span onClick={() => setMultiLanguage(I18N_ENGLISH)}>{ENGLISH}</span>
              </Menu.Item>
              <Menu.Item key="japanese">
                <span onClick={() => setMultiLanguage(I18N_JAPANESE)}>{JAPANESE}</span>
              </Menu.Item>
              <Menu.Item key="chinese">
                <span onClick={() => setMultiLanguage(I18N_CHINESE)}>{CHINESE}</span>
              </Menu.Item>
            </SubMenu>

            <Menu.Item key="cart" style={{paddingBottom:3}}>
              <Badge count={count}>
                <a href="/user/cart" className="head-example" style={{marginRight:-22, color:'#667777'}}>
                  <Icon type="shopping-cart" style={{fontSize:30, marginBottom:3}} />
                </a>
              </Badge>
            </Menu.Item>
            <Menu.Item key="login">
              <a href="/login" style={{color: 'white'}}>Sign In</a>
            </Menu.Item>
            <Menu.Item key="preregister">
              <a href="/preregister" style={{color: 'white'}}>Sign Up</a>
            </Menu.Item>
            <Menu.Item key="inquiry">
              <a href="/mail/inquiry" style={{color: 'white'}}>Contact Us</a>
            </Menu.Item>
          </Menu>
        )
      }
    } else {
      if (!locUserName && !sesUserName && cookie.load('w_auth')) {
        // 붙특정 사용자가 브라우저를 강제 종료후 재 접속했을때 세션에 사용자 정보가 없다
        // 쿠키 삭제
        cookie.remove('w_auth', { path: '/' });
        cookie.remove('w_authExp', { path: '/' });
      }

      // 로그인 했지만 user.userData를 아직 가져오지 못했을 경우
      let count = 0;

      return (
        <Menu mode={props.mode} style={{backgroundColor: '#1a1e65'}}>
          <Menu.Item key="reserve">
            <a href="/mail/reserve" style={{color: 'white'}}>Reservation</a>
          </Menu.Item>
          <SubMenu title={<span style={{color: 'white'}}>Language</span>}>          
            <Menu.Item key="english">
              <span onClick={() => setMultiLanguage(I18N_ENGLISH)}>{ENGLISH}</span>
            </Menu.Item>
            <Menu.Item key="japanese">
              <span onClick={() => setMultiLanguage(I18N_JAPANESE)}>{JAPANESE}</span>
            </Menu.Item>
            <Menu.Item key="chinese">
              <span onClick={() => setMultiLanguage(I18N_CHINESE)}>{CHINESE}</span>
            </Menu.Item>
          </SubMenu>

          <Menu.Item key="cart" style={{paddingBottom:3}}>
            <Badge count={count}>
              <a href="/user/cart" className="head-example" style={{marginRight:-22, color:'#667777'}}>
                <Icon type="shopping-cart" style={{fontSize:30, marginBottom:3}} />
              </a>
            </Badge>
          </Menu.Item>
          <Menu.Item key="login">
            <a href="/login" style={{color: 'white'}}>Sign In</a>
          </Menu.Item>
          <Menu.Item key="preregister">
            <a href="/preregister" style={{color: 'white'}}>Sign Up</a>
          </Menu.Item>
          <Menu.Item key="inquiry">
            <a href="/mail/inquiry" style={{color: 'white'}}>Contact Us</a>
          </Menu.Item>
        </Menu>
      )
    }
  }
}

export default withRouter(RightMenu);