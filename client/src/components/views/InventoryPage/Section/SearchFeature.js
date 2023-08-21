import React, {useState} from 'react';
import { DatePicker, Input, Select } from 'antd';

const {RangePicker} = DatePicker;
const {Search} = Input;
const {Option} = Select;

function SearchFeature(props) {
  const [SearchSelectTerm, setSearchSelectTerm] = useState("");
  const [SearchInputTerm, setSearchInputTerm] = useState("");
  
  // 재고대상외 상품검색
  const selectHandler = (value) => {
    setSearchSelectTerm(value);
    let arr = [value, SearchInputTerm];
    // 부모 컨테이너에 값을 보내기
    props.refreshFunction(arr);
  }
  // 상품이름 검색
  const inputHandler = (e) => {
    setSearchInputTerm(e.currentTarget.value);
    let arr = [SearchSelectTerm, e.currentTarget.value];
    // 부모 컨테이너에 값을 보내기
    props.refreshFunction(arr);
  }

  return (
    <div>
      <Select defaultValue="0" style={{ width: 180 }} onChange={selectHandler}>
        <Option value="0">All</Option>
        <Option value="1">Sold out</Option>
        <Option value="2">Except</Option>
      </Select>&nbsp;&nbsp;
      <Search
        placeholder="Input product name"
        onChange={inputHandler}
        style={{ width:180 }}
        value={SearchInputTerm}
      />
    </div>
  )
}

export default SearchFeature