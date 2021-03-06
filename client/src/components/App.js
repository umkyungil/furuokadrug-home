import React, { Suspense } from 'react';
import { Route, Switch } from "react-router-dom";

// 권한관리
import Auth from "../hoc/auth";
// 메뉴관리
import NavBar from "./views/NavBar/NavBar.js";
import Footer from "./views/Footer/Footer.js";
// 로그인 관리
import LoginPage from "./views/LoginPage/LoginPage.js"; // 로그인
// 사용자관리
import UserRegisterPage from "./views/UserPage/UserRegisterPage.js"; // 사용자 등록
import UserListPage from "./views/UserPage/UserListPage.js"; // 사용자 리스트
import UserUpdatePage from "./views/UserPage/UserUpdatePage.js"; // 사용자 수정
import UserDetailPage from "./views/UserPage/UserDetailPage.js"; // 사용자 상세
import UserPreregisterPage from "./views/UserPage/UserPreregisterPage.js"; // 임시사용자 등록
import UserPreregisterConfirmPage from "./views/UserPage/UserPreregisterConfirmPage.js"; // 임시사용자 수정
import UserPasswordChangePage from "./views/UserPage/UserPasswordChangePage.js"; // 사용자 비밀번호 변경 안내메일
import UserPasswordConfirmPage from "./views/UserPage/UserPasswordConfirmPage.js"; // 사용자 비밀번호 변경
// 초기페이지
import LandingPage from "./views/LandingPage/LandingPage.js";
// 상품관리
import DetailProductPage from "./views/ProductPage/DetailProductPage.js"; // 상품상세
import UpdateProductPage from "./views/ProductPage/UpdateProductPage.js"; // 상품수정
import UploadProductPage from "./views/ProductPage/UploadProductPage.js"; // 상품등록
// 고객관리
import CustomerRegisterPage from "./views/CustomerPage/CustomerRegisterPage.js"; // 고객등록
import CustomerListPage from "./views/CustomerPage/CustomerListPage.js"; // 고객리스트
import CustomerUpdatePage from "./views/CustomerPage/CustomerUpdatePage.js"; // 고객수정
import DetailCustomerPage from "./views/CustomerPage/DetailCustomerPage.js"; // 고객상세
// 결제관리
import ListAlipayPage from "./views/PaymentPage/ListAlipayPage.js"; // Alipay 결제결과 리스트
import ListWechatPage from "./views/PaymentPage/ListWechatPage.js"; // Wechat 결제결과 리스트
import DetailAlipayPage from "./views/PaymentPage/DetailAlipayPage.js"; // Alipay 결제결과 상세
import DetailWechatPage from "./views/PaymentPage/DetailWechatPage.js"; // Wechat 결제결과 상세
import ConfirmAlipayPage from "./views/PaymentPage/ConfirmAlipayPage"; // Alipay 결제확인
import ConfirmWechatPage from "./views/PaymentPage/ConfirmWechatPage.js"; // Wechat 결제확인
import ListPaypalPage from "./views/PaymentPage/ListPaypalPage.js"; // Paypal 결제결과 리스트
import ListPaypalAdminPage from "./views/PaymentPage/ListPaypalAdminPage.js"; // Paypal 관리자 페이지 
// 메일관리
import UploadCSVUnivaPayCastPage from "./views/CsvPage/UploadCSVUnivaPayCastPage.js"; // CSV Upload
import ContactUsPage from "./views/SendMailPage/ContactUsPage.js"; // 문의
import NoticeMailPage from "./views/SendMailPage/NoticeMailPage.js"; // 고객메일
import VirtualReservationPage from "./views/VirtualReservationPage/VirtualReservationPage.js"; // 가상예약
import MailHistoryListPage from "./views/SendMailPage/MailHistoryListPage.js"; // 메일이력 리스트
import MailHistoryDetailPage from "./views/SendMailPage/MailHistoryDetailPage.js"; // 메일상세
// 주문관리
import ListOrderPage from "./views/OrderPage/ListOrderPage.js"; // 주문리스트
import DetailOrderPage from "./views/OrderPage/DetailOrderPage.js"; // 주문상세
// 카트관리
import CartPage from "./views/CartPage/CartPage.js"; // 카트페이지
// 라이브 방송관리
import LiveStreamingPage from "./views/LiveStreamingPage/LiveStreaming.js"; // 라이브 스트리밍 페이지
// 404 페이지
import NotFoundPage from "./views/NotFound.js";

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
          {/* 로그인관리 */}
          <Route exact path="/login" component={Auth(LoginPage, false)} />
          {/* 사용자관리, 카트관리 */}
          <Route exact path="/register" component={Auth(UserRegisterPage, null)} />
          <Route exact path="/user/list" component={Auth(UserListPage, true)} />
          <Route exact path="/user/cart" component={Auth(CartPage, true)} />
          <Route exact path="/user/:userId" component={Auth(UserDetailPage, true)} />
          <Route exact path="/user/update/:userId" component={Auth(UserUpdatePage, true)} />
          <Route exact path="/preregister" component={Auth(UserPreregisterPage, null)} />
          <Route exact path="/user/preregisterConfirm/:userId" component={UserPreregisterConfirmPage} />
          <Route exact path="/passwordChange" component={Auth(UserPasswordChangePage)} />
          <Route exact path="/user/confirm/:userId" component={UserPasswordConfirmPage} />
          {/* 상품관리 */}
          <Route exact path="/product/upload" component={Auth(UploadProductPage, true)} />
          <Route exact path="/product/:productId" component={Auth(DetailProductPage, null)} />
          <Route exact path="/product/update/:productId/" component={Auth(UpdateProductPage, null)} />
          {/* 고객관리 */}
          <Route exact path="/customer/register" component={Auth(CustomerRegisterPage, true)} />
          <Route exact path="/customer/list" component={Auth(CustomerListPage, true)} />
          <Route exact path="/customer/:customerId" component={Auth(DetailCustomerPage, true)} />
          <Route exact path="/customer/update/:customerId" component={Auth(CustomerUpdatePage, true)} />
          {/* 메일관리 */}
          <Route exact path="/mail/notice/:type/:toEmail" component={Auth(NoticeMailPage, true)} />
          <Route exact path="/mail/reserve" component={Auth(VirtualReservationPage, null)} />
          <Route exact path="/mail/inquiry" component={Auth(ContactUsPage, null)} />
          <Route exact path="/mail/list" component={Auth(MailHistoryListPage, true)} />
          <Route exact path="/mail/:mailId" component={Auth(MailHistoryDetailPage, true)} />
          {/* 결제관리 */}
          <Route exact path="/payment/alipay/list" component={Auth(ListAlipayPage, true)} />
          <Route exact path="/payment/wechat/list" component={Auth(ListWechatPage, true)} />
          <Route exact path="/payment/paypal/list" component={Auth(ListPaypalPage, true)} />
          <Route exact path="/payment/paypal/admin/list" component={Auth(ListPaypalAdminPage, true)} />
          <Route exact path="/payment/alipay/:alipayId" component={Auth(DetailAlipayPage, true)} />
          <Route exact path="/payment/wechat/:wechatId" component={Auth(DetailWechatPage, true)} />
          <Route exact path="/payment/alipay/confirm/:userId/:sid/:sod/:siam1/:uniqueField/:staffName" component={Auth(ConfirmAlipayPage, true)} />
          <Route exact path="/payment/wechat/confirm/:userId/:sid/:sod/:siam1/:uniqueField/:staffName" component={Auth(ConfirmWechatPage, true)} />
          {/* 주문관리 */}
          <Route exact path="/order/list" component={Auth(ListOrderPage, true)} />
          <Route exact path="/order/list/:orderId" component={Auth(ListOrderPage, true)} />
          <Route exact path="/order/:orderId" component={Auth(DetailOrderPage, true)} />
          {/* CSV */}
          <Route exact path="/csv/upload/univaPayCast" component={Auth(UploadCSVUnivaPayCastPage, true)} />
          {/* 라이브 방송 */}
          <Route exact path="/live" component={Auth(LiveStreamingPage, true)} />
          {/* 404 Not Found */}
          <Route path={"*"} component={NotFoundPage} />
        </Switch>
      </div>
      <Footer />
    </Suspense>
  );
}

export default App;