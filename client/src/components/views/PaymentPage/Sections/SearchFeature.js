import React, {useState} from 'react';
import {DatePicker, Space, Input, Select} from 'antd';

const {RangePicker} = DatePicker;
const {Search} = Input;
const {Option} = Select;

function SearchFeature(props) {
  const [SearchString, setSearchString] = useState("")
  const [SearchSelect, setSearchSelect] = useState("2")
  
  const stringHandler = (event) => {
    setSearchString(event.currentTarget.value);
    let arr = [SearchSelect, event.currentTarget.value];
    // 부모 컨테이너에 값을 보내기
    props.refreshFunction(arr);
  }

  const selectHandler = (value) => {
    setSearchSelect(value);
    let arr = [value, SearchString];
    // 부모 컨테이너에 값을 보내기
    props.refreshFunction(arr);
  }

  const onChange = (value, dateString) => {
    console.log('Selected Time: ', value);
    console.log('Formatted Selected Time: ', dateString);
    
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
        placeholder="Please enter unique field"
        onChange={stringHandler}
        style={{ width:200 }}
        value={SearchString}
      />&nbsp;&nbsp;
      <RangePicker
        showTime={{ format: 'HH:mm' }}
        format="YYYY-MM-DD HH:mm"
        onChange={onChange}
        onOk={onOk}
      />
    </div>
  )
}

export default SearchFeature