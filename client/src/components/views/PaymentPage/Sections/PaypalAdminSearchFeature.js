import React, {useState} from 'react';
import {DatePicker, Space, Input, Select} from 'antd';

const {RangePicker} = DatePicker;
const {Search} = Input;
const {Option} = Select;

function PaypalSearchFeature(props) {
  const [SearchName, setSearchName] = useState("");
  const [SearchFromDate, setSearchFromDate] = useState("");
  const [SearchToDate, setSearchToDate] = useState("");
  
  const nameHandler = (event) => {
    setSearchName(event.currentTarget.value);
    let arr = [event.currentTarget.value, SearchFromDate, SearchToDate];
    // 부모 컨테이너에 값을 보내기
    props.refreshFunction(arr);
  }

  const dateHandler = (value, dateString) => {
    setSearchFromDate(dateString[0]);
    setSearchToDate(dateString[1]);
    let arr = [SearchName, dateString[0], dateString[1]]
    // 부모 컨테이너에 값을 보내기
    props.refreshFunction(arr);
  }
  
  const onOk = (value) => {
    console.log('onOk: ', value);
  }

  return (
    <div>
      <Search
        placeholder="Please enter user name"
        onChange={nameHandler}
        style={{ width:200 }}
        value={SearchName}
      />&nbsp;&nbsp;
      <RangePicker
        showTime={{ format: 'HH:mm' }}
        format="YYYY-MM-DD HH:mm"
        onChange={dateHandler}
        onOk={onOk}
      />
    </div>
  )
}

export default PaypalSearchFeature;