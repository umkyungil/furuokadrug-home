import axios from 'axios';
import { USER_SERVER } from '../Config';
import moment from 'moment';
// CORS 대책
axios.defaults.withCredentials = true;

// 일본 표준시간을 날짜 객체로 반환 
export function toDateJST() {
  return new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
}

// 일본 표준시간을 YYYY/MM/DD 문자열로 반환
export function dateFormatYMD() {
  const date = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
  let month = date.getMonth() + 1;
  let day = date.getDate();

  month = month >= 10 ? month : '0' + month;
  day = day >= 10 ? day : '0' + day;

  return date.getFullYear() + '-' + month + '-' + day;
}

// UTC 날짜를 날짜 객체로 반환
export function getUTC() {
  var now = new Date();
  return  new Date(now.getTime() + now.getTimezoneOffset() * 60000);
}

// 현재 날짜시간을 ISO Data 형식의 문자열로 반환 
export function getCurrentDateInUTCFormat() {
  var now = new Date();
  return  new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString();
}

// utc시간을 현지 local date로 변환
export const getLocalTime = (utcTime) => {
  let localTime = moment.utc(utcTime).toDate();
  localTime = moment(localTime).format('YYYY-MM-DD HH:mm');
  return localTime;
}

// 사용자 정보 가져오기
export const getUser = async (userId) => {
  try {
    const userInfo = await axios.get(`${USER_SERVER}/users_by_id?id=${userId}&type=single`);
    if (userInfo.data.success) return userInfo.data.user[0];
  } catch (err) {
    console.log("err: ",err);
  }
}

// 문자열 자르기  
const truncate = (str, n) => {
  return str?.length > n ? str.substr(0, n-1) + "..." : str;
}