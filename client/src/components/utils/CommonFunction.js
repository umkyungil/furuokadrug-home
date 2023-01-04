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