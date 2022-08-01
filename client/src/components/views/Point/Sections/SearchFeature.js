import React from 'react';
import { DatePicker } from 'antd';

function SearchFeature(props) {  
  // 포인트 부여 일자
  const dateHandler = (date, dateString) => {
    let arr = [dateString];
    // 부모 컨테이너에 값을 보내기
    props.refreshFunction(arr);
  }

  return (
    <div>
      <DatePicker onChange={dateHandler} />
    </div>
  )
}

export default SearchFeature
