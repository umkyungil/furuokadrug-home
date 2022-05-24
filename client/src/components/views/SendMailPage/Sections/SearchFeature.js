import React, {useState} from 'react';
import { Input, DatePicker } from 'antd';
const {RangePicker} = DatePicker;
const { Search } = Input;

function SearchFeature(props) {
  const [SearchType, setSearchType] = useState("")
  const [SearchFromDate, setSearchFromDate] = useState("");
  const [SearchToDate, setSearchToDate] = useState("");
  
  const typeHandler = (event) => {
    setSearchType(event.currentTarget.value);
    let arr = [event.currentTarget.value, SearchFromDate, SearchToDate]
    // 부모 컨테이너에 값을 보내기
    props.refreshFunction(arr);
  }

  const dateHandler = (value, dateString) => {
    setSearchFromDate(dateString[0]);
    setSearchToDate(dateString[1]);
    let arr = [SearchType, dateString[0], dateString[1]]
    // 부모 컨테이너에 값을 보내기
    props.refreshFunction(arr);
  }

  const onOk = (value) => {
    console.log('onOk: ', value);
  }

  return (
    <div>
      <Search
        placeholder="Input search type"
        onChange={typeHandler}
        style={{ width:200 }}
        value={SearchType}
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

export default SearchFeature
