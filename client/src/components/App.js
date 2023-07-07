import React, { Suspense, useState } from 'react';
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
import ProductDetailPage from "./views/ProductPage/ProductDetailPage.js";
import ProductUpdatePage from "./views/ProductPage/ProductUpdatePage.js";
import ProductRegisterPage from "./views/ProductPage/ProductRegisterPage.js";
import ProductListPage from "./views/ProductPage/ProductListPage.js";
import ProductUploadCsvPage from "./views/ProductPage/ProductUploadCsvPage.js";
import ProductListAdminPage from "./views/ProductPage/ProductListAdminPage.js";
// 고객관리
import CustomerRegisterPage from "./views/CustomerPage/CustomerRegisterPage.js";
import CustomerListPage from "./views/CustomerPage/CustomerListPage.js";
import CustomerUpdatePage from "./views/CustomerPage/CustomerUpdatePage.js";
import CustomerDetailPage from "./views/CustomerPage/CustomerDetailPage.js"; // 고객상세
// 결제관리
import AlipayListPage from "./views/PaymentPage/AlipayListPage.js"; // AliPay 결제결과 리스트
import WechatListPage from "./views/PaymentPage/WechatListPage.js"; // WeChat 결제결과 리스트
import PaypalListPage from "./views/PaymentPage/PaypalListPage.js"; // Paypal 결제결과 리스트
import PaypalListAdminPage from "./views/PaymentPage/PaypalListAdminPage.js"; // Paypal 관리자 페이지 
import AlipayDetailPage from "./views/PaymentPage/AlipayDetailPage.js"; // AliPay 결제결과 상세
import WechatDetailPage from "./views/PaymentPage/WechatDetailPage.js"; // WeChat 결제결과 상세
import AlipayConfirmPage from "./views/PaymentPage/AlipayConfirmPage"; // Alipay 결제확인
import WechatConfirmPage from "./views/PaymentPage/WechatConfirmPage.js"; // Wechat 결제확인

import PaymentResultPage from "./views/PaymentPage/PaymentResultPage.js"; // UPC redirect page
// 메일관리
import UploadCSVUnivaPayCastPage from "./views/CsvPage/UploadCSVUnivaPayCastPage.js"; // CSV Upload
import ContactUsPage from "./views/SendMailPage/ContactUsPage.js"; // 문의
import NoticeMailPage from "./views/SendMailPage/NoticeMailPage.js"; // 고객메일
import VirtualReservationPage from "./views/VirtualReservationPage/VirtualReservationPage.js"; // 가상예약
import MailHistoryListPage from "./views/SendMailPage/MailHistoryListPage.js"; // 메일이력 리스트
import MailHistoryDetailPage from "./views/SendMailPage/MailHistoryDetailPage.js"; // 메일상세
// 주문관리
import OrderListPage from "./views/OrderPage/OrderListPage.js"; // 주문리스트
import OrderDetailPage from "./views/OrderPage/OrderDetailPage.js"; // 주문상세
// 카트관리
import CartPage from "./views/CartPage/CartPage.js";
// 라이브 방송관리
import LiveStreamingPage from "./views/LiveStreamingPage/LiveStreaming.js";
import JitSiMeetPage from "./views/JitSiMeetPage/JitSiMeet.js";
// 쿠폰관리
import CouponRegisterPage from "./views/Coupon/CouponRegisterPage.js";
import CouponBirthRegisterPage from "./views/Coupon/CouponBirthRegisterPage.js";
import CouponListPage from "./views/Coupon/CouponListPage.js";
import CouponUpdatePage from "./views/Coupon/CouponUpdatePage.js";
import CouponUserListPage from "./views/Coupon/CouponUserListPage.js";
import CouponProductListPage from "./views/Coupon/CouponProductListPage.js";
import CouponHistoryListPage from "./views/Coupon/CouponHistoryListPage.js";
// 세일관리
import SaleRegisterPage from "./views/Sale/SaleRegisterPage.js";
import SaleListPage from "./views/Sale/SaleListPage.js";
import SaleUpdatePage from "./views/Sale/SaleUpdatePage.js";
// 포인트관리
import ListPointPage from "./views/Point/ListPointPage.js";
// 이미지관리
import ImagesRegisterPage from "./views/Images/ImagesRegisterPage.js";
import ImagesListPage from "./views/Images/ImagesListPage.js";
import ImagesUpdatePage from "./views/Images/ImagesUpdatePage.js";
// 코드관리
import CodeRegisterPage from "./views/Code/CodeRegisterPage.js";
import CodeListPage from "./views/Code/CodeListPage.js";
import CodeUpdatePage from "./views/Code/CodeUpdatePage.js";
import CodeDetailPage from "./views/Code/CodeDetailPage.js";
// Context
import { LanguageContext } from "./context/LanguageContext.js";
// 404 페이지
import NotFoundPage from "./views/NotFound.js";

//null   아무나 안으로 들어갈수 있다
//true   로그인 한 사용자만 안으로 들어갈수 있다
//false  로그인 한 사용자는 안으로 들어갈수 없다
//3번쩨  인자로 true를 주면 admin만 들어갈수 있다
function App() {
  const [isLanguage, setIsLanguage] = useState('');

  return (
    <Suspense fallback={(<div>Loading...</div>)}>
      <LanguageContext.Provider value={{ isLanguage, setIsLanguage }}>
        
        <NavBar />
        
        <div style={{ paddingTop: '69px', minHeight: 'calc(100vh - 80px)' }}>
          <Switch>
            <Route exact path="/" component={Auth(LandingPage, null)} />
            {/* 로그인관리 */}
            <Route exact path="/login" component={Auth(LoginPage, false)} />
            {/* 사용자관리, 카트관리 */}
            <Route exact path="/register" component={Auth(UserRegisterPage, null)} />
            <Route exact path="/user/list" component={Auth(UserListPage, true)} />
            <Route exact path="/user/cart" component={Auth(CartPage)} />
            <Route exact path="/user/:userId" component={Auth(UserDetailPage, true)} />
            <Route exact path="/user/update/:userId" component={Auth(UserUpdatePage, true)} />
            <Route exact path="/preregister" component={Auth(UserPreregisterPage, null)} />
            <Route exact path="/user/preregisterConfirm/:userId" component={UserPreregisterConfirmPage} />
            <Route exact path="/passwordChange" component={Auth(UserPasswordChangePage)} />
            <Route exact path="/user/confirm/:userId" component={UserPasswordConfirmPage} />
            {/* 상품관리 */}
            <Route exact path="/product/upload" component={Auth(ProductRegisterPage, true)} />
            <Route exact path="/product/list/:type" component={Auth(ProductListPage, null)} />
            <Route exact path="/product/list/category/:category/" component={Auth(ProductListPage, null)} />
            <Route exact path="/product/list/searchTerm/:searchTerm/" component={Auth(ProductListPage, null)} />
            <Route exact path="/product/:productId" component={Auth(ProductDetailPage, null)} />
            <Route exact path="/product/update/:productId/" component={Auth(ProductUpdatePage, null)} />
            <Route exact path="/product/csv/upload" component={Auth(ProductUploadCsvPage, null)} />
            <Route exact path="/product/admin/list" component={Auth(ProductListAdminPage, true)} />

            {/* 고객관리 */}
            <Route exact path="/customer/register" component={Auth(CustomerRegisterPage, true)} />
            <Route exact path="/customer/list" component={Auth(CustomerListPage, true)} />
            <Route exact path="/customer/:customerId" component={Auth(CustomerDetailPage, true)} />
            <Route exact path="/customer/update/:customerId" component={Auth(CustomerUpdatePage, true)} />
            {/* 메일관리 */}
            <Route exact path="/mail/notice/:type/:toEmail" component={Auth(NoticeMailPage, true)} />
            <Route exact path="/mail/reserve" component={Auth(VirtualReservationPage, null)} />
            <Route exact path="/mail/inquiry" component={Auth(ContactUsPage, null)} />
            <Route exact path="/mail/list" component={Auth(MailHistoryListPage, true)} />
            <Route exact path="/mail/:mailId" component={Auth(MailHistoryDetailPage, true)} />
            {/* 결제관리 */}
            <Route exact path="/payment/alipay/list" component={Auth(AlipayListPage, true)} />
            <Route exact path="/payment/wechat/list" component={Auth(WechatListPage, true)} />
            <Route exact path="/payment/paypal/list" component={Auth(PaypalListPage, true)} />
            <Route exact path="/payment/paypal/admin/list" component={Auth(PaypalListAdminPage, true)} />
            <Route exact path="/payment/alipay/:alipayId" component={Auth(AlipayDetailPage, true)} />
            <Route exact path="/payment/wechat/:wechatId" component={Auth(WechatDetailPage, true)} />
            <Route exact path="/payment/alipay/confirm/:userId/:sid/:sod/:siam1/:uniqueField/:staffName" component={Auth(AlipayConfirmPage, true)} />
            <Route exact path="/payment/wechat/confirm/:userId/:sid/:sod/:siam1/:uniqueField/:staffName" component={Auth(WechatConfirmPage, true)} />            
            <Route exact path="/payment/result" component={Auth(PaymentResultPage, null)} />
            {/* 주문관리 */}
            <Route exact path="/order/list" component={Auth(OrderListPage, true)} />
            <Route exact path="/order/list/:orderId" component={Auth(OrderListPage, true)} />
            <Route exact path="/order/:orderId" component={Auth(OrderDetailPage, true)} />
            {/* CSV */}
            <Route exact path="/csv/upload/univaPayCast" component={Auth(UploadCSVUnivaPayCastPage, true)} />
            {/* 라이브 방송 */}
            <Route exact path="/live" component={Auth(LiveStreamingPage, true)} />
            <Route exact path="/jitSi" component={Auth(JitSiMeetPage, true)} />
            {/* 쿠폰관리 */}
            <Route exact path="/coupon/register" component={Auth(CouponRegisterPage, true)} />
            <Route exact path="/coupon/birth/register" component={Auth(CouponBirthRegisterPage, true)} />
            <Route exact path="/coupon/register/:userId" component={Auth(CouponRegisterPage, true)} />{/* 특정 사용자에게 부여하는 쿠폰 */}
            <Route exact path="/coupon/list" component={Auth(CouponListPage, true)} />
            <Route exact path="/coupon/update/:couponId" component={Auth(CouponUpdatePage, true)} />
            <Route exact path="/coupon/user" component={Auth(CouponUserListPage, true)} />{/* 사용자 지정 팝업 */}
            <Route exact path="/coupon/product/:item" component={Auth(CouponProductListPage, true)} />{/* 상품 지정 팝업 */}
            <Route exact path="/coupon/history" component={Auth(CouponHistoryListPage, true)} />
            {/* 세일관리 */}
            <Route exact path="/sale/register" component={Auth(SaleRegisterPage, true)} />
            <Route exact path="/sale/list" component={Auth(SaleListPage, true)} />
            <Route exact path="/sale/update/:saleId" component={Auth(SaleUpdatePage, true)} />
            {/* 포인트관리 */}
            <Route exact path="/point/list" component={Auth(ListPointPage, true)} />
            <Route exact path="/point/list/:userId" component={Auth(ListPointPage, true)} />            
            {/* 이미지관리 */}
            <Route exact path="/images/register" component={Auth(ImagesRegisterPage, true)} />
            <Route exact path="/images/list" component={Auth(ImagesListPage, true)} />
            <Route exact path="/images/update/:imageId" component={Auth(ImagesUpdatePage, true)} />
            {/* 코드관리 */}
            <Route exact path="/code/register" component={Auth(CodeRegisterPage, true)} />
            <Route exact path="/code/list" component={Auth(CodeListPage, true)} />
            <Route exact path="/code/detail/:codeId" component={Auth(CodeDetailPage, true)} />
            <Route exact path="/code/update/:codeId" component={Auth(CodeUpdatePage, true)} />
            {/* 404 Not Found */}
            <Route path={"*"} component={NotFoundPage} />
          </Switch>
        </div>
        
        <Footer />
      </LanguageContext.Provider>
    </Suspense>
  );
}

export default App;