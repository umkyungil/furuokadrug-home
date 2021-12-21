import React, { Suspense } from 'react';
import { Route, Switch } from "react-router-dom";
import Auth from "../hoc/auth";
// pages for this product
import LandingPage from "./views/LandingPage/LandingPage.js";
import LoginPage from "./views/LoginPage/LoginPage.js";
import RegisterPage from "./views/RegisterPage/RegisterPage.js";
import NavBar from "./views/NavBar/NavBar.js";
import Footer from "./views/Footer/Footer.js";
import DetailProductPage from "./views/DetailProductPage/DetailProductPage.js"
import UploadProductPage from "./views/UploadProductPage/UploadProductPage.js";
import CustomerRegisterPage from "./views/CustomerPage/CustomerRegisterPage.js";
import CustomerListPage from "./views/CustomerPage/CustomerListPage.js";
import CustomerUpdatePage from "./views/CustomerPage/CustomerUpdatePage.js";

import DetailCustomerPage from "./views/CustomerPage/DetailCustomerPage.js";
import UploadCsvOfUnivaPayCastPage from "./views/UploadCsvPage/UploadCsvOfUnivaPayCastPage.js";
import ContactUsPage from "./views/SendMailPage/ContactUsPage.js";
import SendMailPage from "./views/SendMailPage/SendMailPage.js";

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
          <Route exact path="/register" component={Auth(RegisterPage, false)} />{/* 사용자 등록 */}
          <Route exact path="/product/upload" component={Auth(UploadProductPage, true)} />
          <Route exact path="/customer/register" component={Auth(CustomerRegisterPage, true)} />
          <Route exact path="/customer/list" component={Auth(CustomerListPage, true)} />
          <Route exact path="/customer/:customerId" component={Auth(DetailCustomerPage, true)} />
          <Route exact path="/customer/update/:customerId" component={Auth(CustomerUpdatePage, true)} />
          <Route exact path="/product/:productId" component={Auth(DetailProductPage, null)} />
          <Route exact path="/csv/upload/univaPayCast" component={Auth(UploadCsvOfUnivaPayCastPage, true)} />
          <Route exact path="/mail/contact" component={Auth(ContactUsPage, true)} />
          <Route exact path="/mail/sendmail/:toEmail" component={Auth(SendMailPage, true)} />
        </Switch>
      </div>
      <Footer />
    </Suspense>
  );
}

export default App;
