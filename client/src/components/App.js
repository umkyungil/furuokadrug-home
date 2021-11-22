import React, { Suspense } from 'react';
import { Route, Switch } from "react-router-dom";
import Auth from "../hoc/auth";
// pages for this product
import LandingPage from "./views/LandingPage/LandingPage.js";
import LoginPage from "./views/LoginPage/LoginPage.js";
import RegisterPage from "./views/RegisterPage/RegisterPage.js";
import NavBar from "./views/NavBar/NavBar.js";
import Footer from "./views/Footer/Footer.js";
import UploadProductPage from "./views/UploadProductPage/UploadProductPage.js";
import CustomerRegisterPage from "./views/CustomerPage/CustomerRegisterPage.js";
import CustomerListPage from "./views/CustomerPage/CustomerListPage.js";
import DetailCustomerPage from "./views/CustomerPage/DetailCustomerPage.js";
import DetailProductPage from "./views/DetailProductPage/DetailProductPage.js";

//null   Anyone Can go inside
//true   only logged in user can go inside
//false  logged in user can't go inside

function App() {
  return (
    <Suspense fallback={(<div>Loading...</div>)}>
      <NavBar />
      <div style={{ paddingTop: '69px', minHeight: 'calc(100vh - 80px)' }}>
        <Switch>
          <Route exact path="/" component={Auth(LandingPage, null)} />
          <Route exact path="/login" component={Auth(LoginPage, false)} />
          <Route exact path="/register" component={Auth(RegisterPage, true)} />
          <Route exact path="/product/upload" component={Auth(UploadProductPage, true)} />
          <Route exact path="/customer/register" component={Auth(CustomerRegisterPage, true)} />
          <Route exact path="/customer/list" component={Auth(CustomerListPage, true)} />
          <Route exact path="/customer/:customerId" component={Auth(DetailCustomerPage, true)} />
          <Route exact path="/product/:productId" component={Auth(DetailProductPage, true)} />
        </Switch>
      </div>
      <Footer />
    </Suspense>
  );
}

export default App;
