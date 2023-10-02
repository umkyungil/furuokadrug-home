import { USER_SERVER } from '../Config';
import moment from 'moment';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;


// 일본 표준시간을 YYYY-MM-DD 문자열로 반환
export function dateFormatYMD() {
  const date = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
  let month = date.getMonth() + 1;
  let day = date.getDate();

  month = month >= 10 ? month : '0' + month;
  day = day >= 10 ? day : '0' + day;

  return date.getFullYear() + '-' + month + '-' + day;
}

// utc시간을 현지 local date로 변환
export const getLocalTime = (utcTime) => {
  let localTime = moment.utc(utcTime).toDate();
  localTime = moment(localTime).format('YYYY-MM-DD HH:mm');
  return localTime;
}

// 문자열 자르기  
export const truncate = (str, n) => {
  return str?.length > n ? str.substr(0, n-1) + "..." : str;
}

// 서버 시간 가져오기
export const getServerDate = () => {
  let xmlHttpRequest;
  if(window.XMLHttpRequest){// code for Firefox, Mozilla, IE7, etc.
      xmlHttpRequest = new XMLHttpRequest();
  }else{
      return false;
  }

  xmlHttpRequest.open('HEAD', window.location.href.toString(), false);
  xmlHttpRequest.setRequestHeader("ContentType", "text/html");
  xmlHttpRequest.send('');

  var serverDate = xmlHttpRequest.getResponseHeader("Date");
  return serverDate;
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

// 언어정보 가져오기
export const getLanguage = (isLanguage) => {
  if (!isLanguage || isLanguage === "") {
    let lang = localStorage.getItem("i18nextLng");
    
    if (lang) {
      if (lang === 'ja-JP') {
        lang = "en";
        localStorage.setItem('i18nextLng', lang);
      }
    } else {
      lang = "en";
      localStorage.setItem('i18nextLng', lang);
    }

    return lang;
  } else {
    return isLanguage;
  }
}

// HTML lang속성 바꾸기
export const setHtmlLangProps = (lang) => {
  let htmlLang = '';
    if (lang === 'jp') {
      htmlLang = 'ja';
    } else if (lang === 'cn') {
      htmlLang = 'zh-cmn-Hans';
    } else {
      htmlLang = lang;
    }

    document.querySelector("html").lang = htmlLang;
}