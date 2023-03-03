////////////////////////////////////////////////////////////////
// DEV
////////////////////////////////////////////////////////////////
//SERVER ROUTES
export const MAIN_SERVER = 'http://localhost:5000'
// LIVE SERVER
export const LIVE_SERVER = 'https://localhost:888/#/'
// UPC 점포코드 설정(local)
export const SID = '110106';

////////////////////////////////////////////////////////////////
// PROD
////////////////////////////////////////////////////////////////
// SERVER ROUTES
// export const MAIN_SERVER = 'https://furuokadrug.herokuapp.com'
// LIVE SERVER
// export const LIVE_SERVER = 'https://live.furuokadrug.com/#/'
// UPC 점포코드 설정(prod)
// export const SID = '1';

////////////////////////////////////////////////////////////////
// COMMON
////////////////////////////////////////////////////////////////
//SERVER ROUTES
export const USER_SERVER = `${MAIN_SERVER}/api/users`;
export const CUSTOMER_SERVER = `${MAIN_SERVER}/api/customers`;
export const PRODUCT_SERVER = `${MAIN_SERVER}/api/product`;
export const MAIL_SERVER = `${MAIN_SERVER}/api/sendmail`;
export const CSV_SERVER = `${MAIN_SERVER}/api/csv`;
export const PAYMENT_SERVER = `${MAIN_SERVER}/api/payment`;
export const ORDER_SERVER = `${MAIN_SERVER}/api/order`;
export const COUPON_SERVER = `${MAIN_SERVER}/api/coupon`;
export const POINT_SERVER = `${MAIN_SERVER}/api/point`;
export const SALE_SERVER = `${MAIN_SERVER}/api/sale`;
export const BANNER_SERVER = `${MAIN_SERVER}/api/banner`;
export const IMAGES_SERVER = `${MAIN_SERVER}/api/images`;

// UPC Payment URL
export const UPC_PAYMENT = "https://gw.ccps.jp/payment.aspx";