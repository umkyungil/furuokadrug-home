import { USER_SERVER } from '../Config';
import {CN_MESSAGE, EN_MESSAGE, JP_MESSAGE} from './Message';
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
    console.log("CommonFunction getUSer err: ",err);
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
    // html의 lang속성을 변경
    document.querySelector("html").lang = htmlLang;
}

// 메시지 읽어들이기
export const getMessage = (lang, key) => {
  if (lang === 'cn' ) {
    if (key === 'key001') return CN_MESSAGE.key001;
    if (key === 'key002') return CN_MESSAGE.key002;
    if (key === 'key003') return CN_MESSAGE.key003;
    if (key === 'key004') return CN_MESSAGE.key004;
    if (key === 'key005') return CN_MESSAGE.key005;
    if (key === 'key006') return CN_MESSAGE.key006;
    if (key === 'key007') return CN_MESSAGE.key007;
    if (key === 'key008') return CN_MESSAGE.key008;
    if (key === 'key009') return CN_MESSAGE.key009;
    if (key === 'key010') return CN_MESSAGE.key010;
    if (key === 'key011') return CN_MESSAGE.key011;
    if (key === 'key012') return CN_MESSAGE.key012;
    if (key === 'key013') return CN_MESSAGE.key013;
    if (key === 'key014') return CN_MESSAGE.key014;
    if (key === 'key015') return CN_MESSAGE.key015;
    if (key === 'key016') return CN_MESSAGE.key016;
    if (key === 'key017') return CN_MESSAGE.key017;
    if (key === 'key018') return CN_MESSAGE.key018;
    if (key === 'key019') return CN_MESSAGE.key019;
    if (key === 'key020') return CN_MESSAGE.key020;
    if (key === 'key021') return CN_MESSAGE.key021;
    if (key === 'key022') return CN_MESSAGE.key022;
    if (key === 'key023') return CN_MESSAGE.key023;
    if (key === 'key024') return CN_MESSAGE.key024;
    if (key === 'key025') return CN_MESSAGE.key025;
    if (key === 'key026') return CN_MESSAGE.key026;
    if (key === 'key027') return CN_MESSAGE.key027;
    if (key === 'key028') return CN_MESSAGE.key028;
    if (key === 'key029') return CN_MESSAGE.key029;
    if (key === 'key030') return CN_MESSAGE.key030;
    if (key === 'key031') return CN_MESSAGE.key031;
    if (key === 'key032') return CN_MESSAGE.key032;
    if (key === 'key033') return CN_MESSAGE.key033;
    if (key === 'key034') return CN_MESSAGE.key034;
    if (key === 'key035') return CN_MESSAGE.key035;
    if (key === 'key036') return CN_MESSAGE.key036;
    if (key === 'key037') return CN_MESSAGE.key037;
    if (key === 'key038') return CN_MESSAGE.key038;
    if (key === 'key039') return CN_MESSAGE.key039;
    if (key === 'key040') return CN_MESSAGE.key040;
    if (key === 'key041') return CN_MESSAGE.key041;
    if (key === 'key042') return CN_MESSAGE.key042;
    if (key === 'key043') return CN_MESSAGE.key043;
    if (key === 'key044') return CN_MESSAGE.key044;
    if (key === 'key045') return CN_MESSAGE.key045;
    if (key === 'key046') return CN_MESSAGE.key046;
    if (key === 'key047') return CN_MESSAGE.key047;
    if (key === 'key048') return CN_MESSAGE.key048;
    if (key === 'key049') return CN_MESSAGE.key049;
    if (key === 'key050') return CN_MESSAGE.key050;
    if (key === 'key051') return CN_MESSAGE.key051;
    if (key === 'key052') return CN_MESSAGE.key052;
    if (key === 'key053') return CN_MESSAGE.key053;
    if (key === 'key054') return CN_MESSAGE.key054;
    if (key === 'key055') return CN_MESSAGE.key055;
    if (key === 'key056') return CN_MESSAGE.key056;
    if (key === 'key057') return CN_MESSAGE.key057;
    if (key === 'key058') return CN_MESSAGE.key058;
    if (key === 'key059') return CN_MESSAGE.key059;
    if (key === 'key060') return CN_MESSAGE.key060;
    if (key === 'key061') return CN_MESSAGE.key061;
    if (key === 'key062') return CN_MESSAGE.key062;
    if (key === 'key063') return CN_MESSAGE.key063;
    if (key === 'key064') return CN_MESSAGE.key064;
    if (key === 'key065') return CN_MESSAGE.key065;
    if (key === 'key066') return CN_MESSAGE.key066;
    if (key === 'key067') return CN_MESSAGE.key067;
    if (key === 'key068') return CN_MESSAGE.key068;
    if (key === 'key069') return CN_MESSAGE.key069;    
    if (key === 'key070') return CN_MESSAGE.key070;
    if (key === 'key071') return CN_MESSAGE.key071;
    if (key === 'key072') return CN_MESSAGE.key072;
    if (key === 'key073') return CN_MESSAGE.key073;
    if (key === 'key074') return CN_MESSAGE.key074;
    if (key === 'key075') return CN_MESSAGE.key075;
    if (key === 'key076') return CN_MESSAGE.key076;
    if (key === 'key077') return CN_MESSAGE.key077;
    if (key === 'key078') return CN_MESSAGE.key078;
    if (key === 'key079') return CN_MESSAGE.key079;
    if (key === 'key080') return CN_MESSAGE.key080;
    if (key === 'key081') return CN_MESSAGE.key081;
    if (key === 'key082') return CN_MESSAGE.key082;
    if (key === 'key083') return CN_MESSAGE.key083;
    if (key === 'key084') return CN_MESSAGE.key084;
    if (key === 'key085') return CN_MESSAGE.key085;
    if (key === 'key086') return CN_MESSAGE.key086;
    if (key === 'key087') return CN_MESSAGE.key087;
    if (key === 'key088') return CN_MESSAGE.key088;
    if (key === 'key089') return CN_MESSAGE.key089;
    if (key === 'key090') return CN_MESSAGE.key090;
    if (key === 'key091') return CN_MESSAGE.key091;
    if (key === 'key092') return CN_MESSAGE.key092;
    if (key === 'key093') return CN_MESSAGE.key093;
    if (key === 'key094') return CN_MESSAGE.key094;
    if (key === 'key095') return CN_MESSAGE.key095;
    if (key === 'key096') return CN_MESSAGE.key096;
    if (key === 'key097') return CN_MESSAGE.key097;
    if (key === 'key098') return CN_MESSAGE.key098;
    if (key === 'key099') return CN_MESSAGE.key099;
    if (key === 'key100') return CN_MESSAGE.key100;
    if (key === 'key101') return CN_MESSAGE.key101;
    if (key === 'key102') return CN_MESSAGE.key102;
    if (key === 'key103') return CN_MESSAGE.key103;
    if (key === 'key104') return CN_MESSAGE.key104;
    if (key === 'key105') return CN_MESSAGE.key105;
    if (key === 'key106') return CN_MESSAGE.key106;
    if (key === 'key107') return CN_MESSAGE.key107;
    if (key === 'key108') return CN_MESSAGE.key108;
    if (key === 'key109') return CN_MESSAGE.key109;
    if (key === 'key110') return CN_MESSAGE.key110;
    if (key === 'key111') return CN_MESSAGE.key111;
    if (key === 'key112') return CN_MESSAGE.key112;
    if (key === 'key113') return CN_MESSAGE.key113;
    if (key === 'key114') return CN_MESSAGE.key114;
    if (key === 'key115') return CN_MESSAGE.key115;
    if (key === 'key116') return CN_MESSAGE.key116;
    if (key === 'key117') return CN_MESSAGE.key117;
    if (key === 'key118') return CN_MESSAGE.key118;
    if (key === 'key119') return CN_MESSAGE.key119;
    if (key === 'key120') return CN_MESSAGE.key120;
    if (key === 'key121') return CN_MESSAGE.key121;
    if (key === 'key122') return CN_MESSAGE.key122;
    if (key === 'key123') return CN_MESSAGE.key123;
    if (key === 'key124') return CN_MESSAGE.key124;
    if (key === 'key125') return CN_MESSAGE.key125;
    if (key === 'key126') return CN_MESSAGE.key126;
    if (key === 'key127') return CN_MESSAGE.key127;
    if (key === 'key128') return CN_MESSAGE.key128;
    if (key === 'key129') return CN_MESSAGE.key129;
  } else if (lang === 'jp') {
    if (key === 'key001') return JP_MESSAGE.key001;
    if (key === 'key002') return JP_MESSAGE.key002;
    if (key === 'key003') return JP_MESSAGE.key003;
    if (key === 'key004') return JP_MESSAGE.key004;
    if (key === 'key005') return JP_MESSAGE.key005;
    if (key === 'key006') return JP_MESSAGE.key006;
    if (key === 'key007') return JP_MESSAGE.key007;
    if (key === 'key008') return JP_MESSAGE.key008;
    if (key === 'key009') return JP_MESSAGE.key009;
    if (key === 'key010') return JP_MESSAGE.key010;
    if (key === 'key011') return JP_MESSAGE.key011;
    if (key === 'key012') return JP_MESSAGE.key012;
    if (key === 'key013') return JP_MESSAGE.key013;
    if (key === 'key014') return JP_MESSAGE.key014;
    if (key === 'key015') return JP_MESSAGE.key015;
    if (key === 'key016') return JP_MESSAGE.key016;
    if (key === 'key017') return JP_MESSAGE.key017;
    if (key === 'key018') return JP_MESSAGE.key018;
    if (key === 'key019') return JP_MESSAGE.key019;
    if (key === 'key020') return JP_MESSAGE.key020;
    if (key === 'key021') return JP_MESSAGE.key021;
    if (key === 'key022') return JP_MESSAGE.key022;
    if (key === 'key023') return JP_MESSAGE.key023;
    if (key === 'key024') return JP_MESSAGE.key024;
    if (key === 'key025') return JP_MESSAGE.key025;
    if (key === 'key026') return JP_MESSAGE.key026;
    if (key === 'key027') return JP_MESSAGE.key027;
    if (key === 'key028') return JP_MESSAGE.key028;
    if (key === 'key029') return JP_MESSAGE.key029;
    if (key === 'key030') return JP_MESSAGE.key030;
    if (key === 'key031') return JP_MESSAGE.key031;
    if (key === 'key032') return JP_MESSAGE.key032;
    if (key === 'key033') return JP_MESSAGE.key033;
    if (key === 'key034') return JP_MESSAGE.key034;
    if (key === 'key035') return JP_MESSAGE.key035;
    if (key === 'key036') return JP_MESSAGE.key036;
    if (key === 'key037') return JP_MESSAGE.key037;
    if (key === 'key038') return JP_MESSAGE.key038;
    if (key === 'key039') return JP_MESSAGE.key039;
    if (key === 'key040') return JP_MESSAGE.key040;
    if (key === 'key041') return JP_MESSAGE.key041;
    if (key === 'key042') return JP_MESSAGE.key042;
    if (key === 'key043') return JP_MESSAGE.key043;
    if (key === 'key044') return JP_MESSAGE.key044;
    if (key === 'key045') return JP_MESSAGE.key045;
    if (key === 'key046') return JP_MESSAGE.key046;
    if (key === 'key047') return JP_MESSAGE.key047;
    if (key === 'key048') return JP_MESSAGE.key048;
    if (key === 'key049') return JP_MESSAGE.key049;
    if (key === 'key050') return JP_MESSAGE.key050;
    if (key === 'key051') return JP_MESSAGE.key051;
    if (key === 'key052') return JP_MESSAGE.key052;
    if (key === 'key053') return JP_MESSAGE.key053;
    if (key === 'key054') return JP_MESSAGE.key054;
    if (key === 'key055') return JP_MESSAGE.key055;
    if (key === 'key056') return JP_MESSAGE.key056;
    if (key === 'key057') return JP_MESSAGE.key057;
    if (key === 'key058') return JP_MESSAGE.key058;
    if (key === 'key059') return JP_MESSAGE.key059;
    if (key === 'key060') return JP_MESSAGE.key060;
    if (key === 'key061') return JP_MESSAGE.key061;
    if (key === 'key062') return JP_MESSAGE.key062;
    if (key === 'key063') return JP_MESSAGE.key063;
    if (key === 'key064') return JP_MESSAGE.key064;
    if (key === 'key065') return JP_MESSAGE.key065;
    if (key === 'key066') return JP_MESSAGE.key066;
    if (key === 'key067') return JP_MESSAGE.key067;
    if (key === 'key068') return JP_MESSAGE.key068;
    if (key === 'key069') return JP_MESSAGE.key069;    
    if (key === 'key070') return JP_MESSAGE.key070;
    if (key === 'key071') return JP_MESSAGE.key071;
    if (key === 'key072') return JP_MESSAGE.key072;
    if (key === 'key073') return JP_MESSAGE.key073;
    if (key === 'key074') return JP_MESSAGE.key074;
    if (key === 'key075') return JP_MESSAGE.key075;
    if (key === 'key076') return JP_MESSAGE.key076;
    if (key === 'key077') return JP_MESSAGE.key077;
    if (key === 'key078') return JP_MESSAGE.key078;
    if (key === 'key079') return JP_MESSAGE.key079;
    if (key === 'key080') return JP_MESSAGE.key080;
    if (key === 'key081') return JP_MESSAGE.key081;
    if (key === 'key082') return JP_MESSAGE.key082;
    if (key === 'key083') return JP_MESSAGE.key083;
    if (key === 'key084') return JP_MESSAGE.key084;
    if (key === 'key085') return JP_MESSAGE.key085;
    if (key === 'key086') return JP_MESSAGE.key086;
    if (key === 'key087') return JP_MESSAGE.key087;
    if (key === 'key088') return JP_MESSAGE.key088;
    if (key === 'key089') return JP_MESSAGE.key089;
    if (key === 'key090') return JP_MESSAGE.key090;
    if (key === 'key091') return JP_MESSAGE.key091;
    if (key === 'key092') return JP_MESSAGE.key092;
    if (key === 'key093') return JP_MESSAGE.key093;
    if (key === 'key094') return JP_MESSAGE.key094;
    if (key === 'key095') return JP_MESSAGE.key095;
    if (key === 'key096') return JP_MESSAGE.key096;
    if (key === 'key097') return JP_MESSAGE.key097;
    if (key === 'key098') return JP_MESSAGE.key098;
    if (key === 'key099') return JP_MESSAGE.key099;
    if (key === 'key100') return JP_MESSAGE.key100;
    if (key === 'key101') return JP_MESSAGE.key101;
    if (key === 'key102') return JP_MESSAGE.key102;
    if (key === 'key103') return JP_MESSAGE.key103;
    if (key === 'key104') return JP_MESSAGE.key104;
    if (key === 'key105') return JP_MESSAGE.key105;
    if (key === 'key106') return JP_MESSAGE.key106;
    if (key === 'key107') return JP_MESSAGE.key107;
    if (key === 'key108') return JP_MESSAGE.key108;
    if (key === 'key109') return JP_MESSAGE.key109;
    if (key === 'key110') return JP_MESSAGE.key110;
    if (key === 'key111') return JP_MESSAGE.key111;
    if (key === 'key112') return JP_MESSAGE.key112;
    if (key === 'key113') return JP_MESSAGE.key113;
    if (key === 'key114') return JP_MESSAGE.key114;
    if (key === 'key115') return JP_MESSAGE.key115;
    if (key === 'key116') return JP_MESSAGE.key116;
    if (key === 'key117') return JP_MESSAGE.key117;
    if (key === 'key118') return JP_MESSAGE.key118;
    if (key === 'key119') return JP_MESSAGE.key119;
    if (key === 'key120') return JP_MESSAGE.key120;
    if (key === 'key121') return JP_MESSAGE.key121;
    if (key === 'key122') return JP_MESSAGE.key122;
    if (key === 'key123') return JP_MESSAGE.key123;
    if (key === 'key124') return JP_MESSAGE.key124;
    if (key === 'key125') return JP_MESSAGE.key125;
    if (key === 'key126') return JP_MESSAGE.key126;
    if (key === 'key127') return JP_MESSAGE.key127;
    if (key === 'key128') return JP_MESSAGE.key128;
    if (key === 'key129') return JP_MESSAGE.key129;
  } else {
    if (key === 'key001') return EN_MESSAGE.key001;
    if (key === 'key002') return EN_MESSAGE.key002;
    if (key === 'key003') return EN_MESSAGE.key003;
    if (key === 'key004') return EN_MESSAGE.key004;
    if (key === 'key005') return EN_MESSAGE.key005;
    if (key === 'key006') return EN_MESSAGE.key006;
    if (key === 'key007') return EN_MESSAGE.key007;
    if (key === 'key008') return EN_MESSAGE.key008;
    if (key === 'key009') return EN_MESSAGE.key009;
    if (key === 'key010') return EN_MESSAGE.key010;
    if (key === 'key011') return EN_MESSAGE.key011;
    if (key === 'key012') return EN_MESSAGE.key012;
    if (key === 'key013') return EN_MESSAGE.key013;
    if (key === 'key014') return EN_MESSAGE.key014;
    if (key === 'key015') return EN_MESSAGE.key015;
    if (key === 'key016') return EN_MESSAGE.key016;
    if (key === 'key017') return EN_MESSAGE.key017;
    if (key === 'key018') return EN_MESSAGE.key018;
    if (key === 'key019') return EN_MESSAGE.key019;
    if (key === 'key020') return EN_MESSAGE.key020;
    if (key === 'key021') return EN_MESSAGE.key021;
    if (key === 'key022') return EN_MESSAGE.key022;
    if (key === 'key023') return EN_MESSAGE.key023;
    if (key === 'key024') return EN_MESSAGE.key024;
    if (key === 'key025') return EN_MESSAGE.key025;
    if (key === 'key026') return EN_MESSAGE.key026;
    if (key === 'key027') return EN_MESSAGE.key027;
    if (key === 'key028') return EN_MESSAGE.key028;
    if (key === 'key029') return EN_MESSAGE.key029;
    if (key === 'key030') return EN_MESSAGE.key030;
    if (key === 'key031') return EN_MESSAGE.key031;
    if (key === 'key032') return EN_MESSAGE.key032;
    if (key === 'key033') return EN_MESSAGE.key033;
    if (key === 'key034') return EN_MESSAGE.key034;
    if (key === 'key035') return EN_MESSAGE.key035;
    if (key === 'key036') return EN_MESSAGE.key036;
    if (key === 'key037') return EN_MESSAGE.key037;
    if (key === 'key038') return EN_MESSAGE.key038;
    if (key === 'key039') return EN_MESSAGE.key039;
    if (key === 'key040') return EN_MESSAGE.key040;
    if (key === 'key041') return EN_MESSAGE.key041;
    if (key === 'key042') return EN_MESSAGE.key042;
    if (key === 'key043') return EN_MESSAGE.key043;
    if (key === 'key044') return EN_MESSAGE.key044;
    if (key === 'key045') return EN_MESSAGE.key045;
    if (key === 'key046') return EN_MESSAGE.key046;
    if (key === 'key047') return EN_MESSAGE.key047;
    if (key === 'key048') return EN_MESSAGE.key048;
    if (key === 'key049') return EN_MESSAGE.key049;
    if (key === 'key050') return EN_MESSAGE.key050;
    if (key === 'key051') return EN_MESSAGE.key051;
    if (key === 'key052') return EN_MESSAGE.key052;
    if (key === 'key053') return EN_MESSAGE.key053;
    if (key === 'key054') return EN_MESSAGE.key054;
    if (key === 'key055') return EN_MESSAGE.key055;
    if (key === 'key056') return EN_MESSAGE.key056;
    if (key === 'key057') return EN_MESSAGE.key057;
    if (key === 'key058') return EN_MESSAGE.key058;
    if (key === 'key059') return EN_MESSAGE.key059;
    if (key === 'key060') return EN_MESSAGE.key060;
    if (key === 'key061') return EN_MESSAGE.key061;
    if (key === 'key062') return EN_MESSAGE.key062;
    if (key === 'key063') return EN_MESSAGE.key063;
    if (key === 'key064') return EN_MESSAGE.key064;
    if (key === 'key065') return EN_MESSAGE.key065;
    if (key === 'key066') return EN_MESSAGE.key066;
    if (key === 'key067') return EN_MESSAGE.key067;
    if (key === 'key068') return EN_MESSAGE.key068;
    if (key === 'key069') return EN_MESSAGE.key069;
    if (key === 'key070') return EN_MESSAGE.key070;
    if (key === 'key071') return EN_MESSAGE.key071;
    if (key === 'key072') return EN_MESSAGE.key072;
    if (key === 'key073') return EN_MESSAGE.key073;
    if (key === 'key074') return EN_MESSAGE.key074;
    if (key === 'key075') return EN_MESSAGE.key075;
    if (key === 'key076') return EN_MESSAGE.key076;
    if (key === 'key077') return EN_MESSAGE.key077;
    if (key === 'key078') return EN_MESSAGE.key078;
    if (key === 'key079') return EN_MESSAGE.key079;
    if (key === 'key080') return EN_MESSAGE.key080;
    if (key === 'key081') return EN_MESSAGE.key081;
    if (key === 'key082') return EN_MESSAGE.key082;
    if (key === 'key083') return EN_MESSAGE.key083;
    if (key === 'key084') return EN_MESSAGE.key084;
    if (key === 'key085') return EN_MESSAGE.key085;
    if (key === 'key086') return EN_MESSAGE.key086;
    if (key === 'key087') return EN_MESSAGE.key087;
    if (key === 'key088') return EN_MESSAGE.key088;
    if (key === 'key089') return EN_MESSAGE.key089;
    if (key === 'key090') return EN_MESSAGE.key090;
    if (key === 'key091') return EN_MESSAGE.key091;
    if (key === 'key092') return EN_MESSAGE.key092;
    if (key === 'key093') return EN_MESSAGE.key093;
    if (key === 'key094') return EN_MESSAGE.key094;
    if (key === 'key095') return EN_MESSAGE.key095;
    if (key === 'key096') return EN_MESSAGE.key096;
    if (key === 'key097') return EN_MESSAGE.key097;
    if (key === 'key098') return EN_MESSAGE.key098;
    if (key === 'key099') return EN_MESSAGE.key099;
    if (key === 'key100') return EN_MESSAGE.key100;
    if (key === 'key101') return EN_MESSAGE.key101;
    if (key === 'key102') return EN_MESSAGE.key102;
    if (key === 'key103') return EN_MESSAGE.key103;
    if (key === 'key104') return EN_MESSAGE.key104;
    if (key === 'key105') return EN_MESSAGE.key105;
    if (key === 'key106') return EN_MESSAGE.key106;
    if (key === 'key107') return EN_MESSAGE.key107;
    if (key === 'key108') return EN_MESSAGE.key108;
    if (key === 'key109') return EN_MESSAGE.key109;
    if (key === 'key110') return EN_MESSAGE.key110;
    if (key === 'key111') return EN_MESSAGE.key111;
    if (key === 'key112') return EN_MESSAGE.key112;
    if (key === 'key113') return EN_MESSAGE.key113;
    if (key === 'key114') return EN_MESSAGE.key114;
    if (key === 'key115') return EN_MESSAGE.key115;
    if (key === 'key116') return EN_MESSAGE.key116;
    if (key === 'key117') return EN_MESSAGE.key117;
    if (key === 'key118') return EN_MESSAGE.key118;
    if (key === 'key119') return EN_MESSAGE.key119;
    if (key === 'key120') return EN_MESSAGE.key120;
    if (key === 'key121') return EN_MESSAGE.key121;
    if (key === 'key122') return EN_MESSAGE.key122;
    if (key === 'key123') return EN_MESSAGE.key123;
    if (key === 'key124') return EN_MESSAGE.key124;
    if (key === 'key125') return EN_MESSAGE.key125;
    if (key === 'key126') return EN_MESSAGE.key126;
    if (key === 'key127') return EN_MESSAGE.key127;
    if (key === 'key128') return EN_MESSAGE.key128;
    if (key === 'key129') return EN_MESSAGE.key129;
  }
}