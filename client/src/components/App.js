import React, { Suspense } from 'react';
import { Route, Switch } from "react-router-dom";
import Auth from "../hoc/auth";
// pages for this product
import NavBar from "./views/NavBar/NavBar.js";
import Footer from "./views/Footer/Footer.js";
import LandingPage from "./views/LandingPage/LandingPage.js"; // 초기페이지
import LoginPage from "./views/LoginPage/LoginPage.js"; // 로그인
import UserRegisterPage from "./views/UserPage/UserRegisterPage.js"; // 사용자등록
import DetailProductPage from "./views/ProductPage/DetailProductPage.js"; // 상품상세
import UpdateProductPage from "./views/ProductPage/UpdateProductPage.js"; // 상품수정
import UploadProductPage from "./views/ProductPage/UploadProductPage.js"; // 상품등록
import CustomerRegisterPage from "./views/CustomerPage/CustomerRegisterPage.js"; // 고객등록
import CustomerListPage from "./views/CustomerPage/CustomerListPage.js"; // 고객리스트
import CustomerUpdatePage from "./views/CustomerPage/CustomerUpdatePage.js"; // 고객수정
import DetailCustomerPage from "./views/CustomerPage/DetailCustomerPage.js"; // 고객상세
import UploadCsvOfUnivaPayCastPage from "./views/UploadCsvPage/UploadCsvOfUnivaPayCastPage.js"; // CSV Upload
import ContactUsPage from "./views/SendMailPage/ContactUsPage.js"; // 문의
import NoticeMailPage from "./views/SendMailPage/NoticeMailPage.js"; // 고객메일
import VirtualReservationPage from "./views/VirtualReservationPage/VirtualReservationPage.js"; // 가상예약
import CartPage from "./views/CartPage/CartPage.js"; // 카트페이지

//null   아무나 안으로 들어갈수 있다
//true   로그인 한 사용자만 안으로 들어갈수 있다
//false  로그인 한 사용자는 안으로 들어갈수 없다
//3번쩨  인자로 true를 주면 admin만 들어갈수 있다
function App() {
  return (
    <Suspense fallback={(<div>Loading...</div>)}>
      <NavBar />
      <div style={{ paddingTop: '69px', minHeight: 'calc(100vh - 80px)' }}>
        <Switch> 
          <Route exact path="/" component={Auth(LandingPage, null)} />
          <Route exact path="/login" component={Auth(LoginPage, false)} />
          <Route exact path="/register" component={Auth(UserRegisterPage, false)} />{/* 로그인 사용자 등록 */}
          <Route exact path="/product/upload" component={Auth(UploadProductPage, true)} />
          <Route exact path="/product/:productId" component={Auth(DetailProductPage, null)} />
          <Route exact path="/product/update/:productId" component={Auth(UpdateProductPage, null)} />
          <Route exact path="/customer/register" component={Auth(CustomerRegisterPage, true)} />
          <Route exact path="/customer/list" component={Auth(CustomerListPage, true)} />
          <Route exact path="/customer/:customerId" component={Auth(DetailCustomerPage, true)} />
          <Route exact path="/customer/update/:customerId" component={Auth(CustomerUpdatePage, true)} />
          <Route exact path="/csv/upload/univaPayCast" component={Auth(UploadCsvOfUnivaPayCastPage, true)} />
          <Route exact path="/mail/contact" component={Auth(ContactUsPage, true)} />
          <Route exact path="/mail/notice/:toEmail" component={Auth(NoticeMailPage, true)} />
          <Route exact path="/mail/reservation" component={Auth(VirtualReservationPage, null)} />
          <Route exact path="/user/cart" component={Auth(CartPage, true)} />
        </Switch>
      </div>
      <Footer />
    </Suspense>
  );
}

export default App;
