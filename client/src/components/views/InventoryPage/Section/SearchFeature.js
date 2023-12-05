import React, {useState} from 'react';
import { Input, Select } from 'antd';
import { getLanguage, getMessage } from '../../../utils/CommonFunction';

const {Search} = Input;
const {Option} = Select;

function SearchFeature(props) {
  const [SelectTerm, setSelectTerm] = useState("0");
  const [QtyFromTerm, setQtyFromTerm] = useState("0");
  const [QtyToTerm, setQtyToTerm] = useState("9999");
  const [InputTerm, setInputTerm] = useState("");
  
  // 재고대상외 상품검색
  const selectHandler = (value) => {
    setSelectTerm(value);
    let arr = [value, QtyFromTerm, QtyToTerm, InputTerm];
    // 부모 컨테이너에 값을 보내기
    props.refreshFunction(arr);
  }
  // 수량From검색
  const qtyFromHandler = (e) => {
    let arr;

    if (e.currentTarget.value) {
      if (SelectTerm !== "0") {
        alert(getMessage(getLanguage(), 'key083'));
      }
      if (isNaN(e.currentTarget.value)) {
        alert(getMessage(getLanguage(), 'key080'));
        return;
      }
      if (parseInt(e.currentTarget.value) < 0) {
        alert(getMessage(getLanguage(), 'key084'));
        return;
      }
      if (parseInt(e.currentTarget.value) > parseInt(QtyToTerm)) {
        alert(getMessage(getLanguage(), 'key128'));
        return;
      }
      
      setQtyFromTerm(e.currentTarget.value);
      arr = [SelectTerm, e.currentTarget.value, QtyToTerm, InputTerm];
      // 부모 컨테이너에 값을 보내기
      props.refreshFunction(arr);
    }
  }
  // 수량To검색
  const qtyToHandler = (e) => {
    let arr;

    if (e.currentTarget.value) {
      if (SelectTerm !== "0") {
        alert(getMessage(getLanguage(), 'key083'));
      }
      if (isNaN(e.currentTarget.value)) {
        alert(getMessage(getLanguage(), 'key080'));
        return;
      }
      if (parseInt(e.currentTarget.value) < 0) {
        alert(getMessage(getLanguage(), 'key084'));
        return;
      }
      if (parseInt(e.currentTarget.value) < parseInt(QtyFromTerm)) {
        alert(getMessage(getLanguage(), 'key128'));
        return;
      }

      setQtyToTerm(e.currentTarget.value);
      arr = [SelectTerm, QtyFromTerm, e.currentTarget.value, InputTerm];
      // 부모 컨테이너에 값을 보내기
      props.refreshFunction(arr);
    }
  }
  // 상품이름 검색
  const inputHandler = (e) => {
    setInputTerm(e.currentTarget.value);
    let arr = [SelectTerm, QtyFromTerm, QtyToTerm, e.currentTarget.value];
    // 부모 컨테이너에 값을 보내기
    props.refreshFunction(arr);
  }

  return (
    <div>
      <Select defaultValue="0" style={{ width: 180 }} onChange={selectHandler}>
        <Option value="0">All</Option>
        <Option value="1">Sold out</Option>
        <Option value="2">Except</Option>
      </Select>
      &nbsp;
      &nbsp;

      Qty：
      <Input type="text" defaultValue="0" style={{width: '10%'}} onChange={qtyFromHandler} />～
      <Input type="text" defaultValue="9999" style={{width: '10%'}} onChange={qtyToHandler} />
    
      &nbsp;
      &nbsp;
      <Search
        placeholder="Input product name"
        onChange={inputHandler}
        style={{ width:180 }}
        value={InputTerm}
      />
    </div>
  )
}

export default SearchFeature;