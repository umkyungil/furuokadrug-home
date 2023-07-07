import React, {useState} from 'react';
import {DatePicker, Select} from 'antd';

const {RangePicker} = DatePicker;
const {Option} = Select;

function AlipaySearchFeature(props) {
  const [SearchUnique, setSearchUnique] = useState("");
  const [SearchResult, setSearchResult] = useState("0");
  const [SearchFromDate, setSearchFromDate] = useState("");
  const [SearchToDate, setSearchToDate] = useState("");
  
  const selectHandler = (value) => {
    setSearchResult(value);
    let arr = [value, SearchUnique, SearchFromDate, SearchToDate];
    // 부모 컨테이너에 값을 보내기
    props.refreshFunction(arr);
  }

  const dateHandler = (value, dateString) => {
    setSearchFromDate(dateString[0]);
    setSearchToDate(dateString[1]);
    let arr = [SearchResult, SearchUnique, dateString[0], dateString[1]]
    // 부모 컨테이너에 값을 보내기
    props.refreshFunction(arr);
  }
  
  const onOk = (value) => {
    console.log('onOk: ', value);
  }

  return (
    <div>
      <Select defaultValue="0" style={{ width: 120 }} onChange={selectHandler}>
        <Option value="0">All</Option>
        <Option value="1">Success</Option>
        <Option value="2">Fail</Option>
      </Select>&nbsp;&nbsp;
      <RangePicker
        showTime={{ format: 'HH:mm' }}
        format="YYYY-MM-DD HH:mm"
        onChange={dateHandler}
        onOk={onOk}
      />
    </div>
  )
}

export default AlipaySearchFeature;