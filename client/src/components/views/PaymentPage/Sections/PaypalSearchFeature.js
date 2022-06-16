import React from 'react';
import { DatePicker } from 'antd';

const {RangePicker} = DatePicker;

function PaypalSearchFeature(props) {
  const dateHandler = (value, dateString) => {
    let arr = [dateString[0], dateString[1]]
    // 부모 컨테이너에 값을 보내기
    props.refreshFunction(arr);
  }
  
  const onOk = (value) => {
    console.log('onOk: ', value);
  }

  return (
    <div>
      <RangePicker
        showTime={{ format: 'HH:mm' }}
        format="YYYY-MM-DD HH:mm"
        onChange={dateHandler}
        onOk={onOk}
      />
    </div>
  )
}

export default PaypalSearchFeature