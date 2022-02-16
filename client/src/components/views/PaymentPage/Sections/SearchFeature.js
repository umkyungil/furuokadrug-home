import React, {useState} from 'react';
import {DatePicker, Space, Input, Select} from 'antd';

const {RangePicker} = DatePicker;
const {Search} = Input;
const {Option} = Select;

function SearchFeature(props) {
  const [SearchUnique, setSearchUnique] = useState("");
  const [SearchResult, setSearchResult] = useState("0");
  const [SearchFromDate, setSearchFromDate] = useState("");
  const [SearchToDate, setSearchToDate] = useState("");
  
  const stringHandler = (event) => {
    setSearchUnique(event.currentTarget.value);
    let arr = [SearchResult, event.currentTarget.value, SearchFromDate, SearchToDate];
    // 부모 컨테이너에 값을 보내기
    props.refreshFunction(arr);
  }

  const selectHandler = (value) => {
    setSearchResult(value);
    let arr = [value, SearchUnique, SearchFromDate, SearchToDate];
    // 부모 컨테이너에 값을 보내기
    props.refreshFunction(arr);
  }

  const timeHandler = (value, dateString) => {
    console.log('Selected Time: ', value);
    console.log('Formatted Selected Time: ', dateString[0], dateString[1]);
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
      <Search
        placeholder="Please enter Unique field"
        onChange={stringHandler}
        style={{ width:200 }}
        value={SearchUnique}
      />&nbsp;&nbsp;
      <RangePicker
        showTime={{ format: 'HH:mm' }}
        format="YYYY-MM-DD HH:mm"
        onChange={timeHandler}
        onOk={onOk}
      />
    </div>
  )
}

export default SearchFeature