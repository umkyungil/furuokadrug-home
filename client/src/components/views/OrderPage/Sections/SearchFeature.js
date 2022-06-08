import React, {useState} from 'react';
import { DatePicker, Input, Select } from 'antd';

const {RangePicker} = DatePicker;
const {Search} = Input;
const {Option} = Select;

function SearchFeature(props) {
  const [SearchDeliveryTerm, setSearchDeliveryTerm] = useState("0");
  const [SearchUserTerm, setSearchUserTerm] = useState("");
  const [SearchStaffTerm, setSearchStaffTerm] = useState("");  
  const [SearchFromDate, setSearchFromDate] = useState("");
  const [SearchToDate, setSearchToDate] = useState("");
  
  const userRole = localStorage.getItem("userRole");
  
  // 배송상태
  const deliveryHandler = (value) => {
    setSearchDeliveryTerm(value);
    let arr = [value, SearchUserTerm, SearchStaffTerm, SearchFromDate, SearchToDate];
    // 부모 컨테이너에 값을 보내기
    props.refreshFunction(arr);
  }
  // 사용자 이름
  const userNameHandler = (event) => {
    setSearchUserTerm(event.currentTarget.value);
    let arr = [SearchDeliveryTerm, event.currentTarget.value, SearchStaffTerm, SearchFromDate, SearchToDate];
    // 부모 컨테이너에 값을 보내기
    props.refreshFunction(arr);
  }
  // 스텝이름
  const staffNameHandler = (event) => {
    setSearchStaffTerm(event.currentTarget.value);
    let arr = [SearchDeliveryTerm, SearchUserTerm, event.currentTarget.value, SearchFromDate, SearchToDate];
    // 부모 컨테이너에 값을 보내기
    props.refreshFunction(arr);
  }
  // 결제일자
  const dateHandler = (value, dateString) => {
    setSearchFromDate(dateString[0]);
    setSearchToDate(dateString[1]);
    let arr = [SearchDeliveryTerm, SearchUserTerm, SearchStaffTerm, dateString[0], dateString[1]];
    // 부모 컨테이너에 값을 보내기
    props.refreshFunction(arr);
  }
  
  const onOk = (value) => {
    console.log('onOk: ', value);
  }

  if (userRole !== "0") {
    return (
      <div>
        <Select defaultValue="0" style={{ width: 180 }} onChange={deliveryHandler}>
          <Option value="0">All</Option>
          <Option value="1">procedure completed</Option>{/* 配送手続き完了 */}
          <Option value="2">unconfirmed</Option>{/* 未確認 */}
        </Select>&nbsp;&nbsp;
        <Search
          placeholder="Input search name"
          onChange={userNameHandler}
          style={{ width:180 }}
          value={SearchUserTerm}
        />&nbsp;&nbsp;
        <Search
          placeholder="Input search staff name"
          onChange={staffNameHandler}
          style={{ width:180 }}
          value={SearchStaffTerm}
        />&nbsp;&nbsp;
        <RangePicker
          showTime={{ format: 'HH:mm' }}
          format="YYYY-MM-DD HH:mm"
          onChange={dateHandler}
          onOk={onOk}
        />
      </div>
    )
  } else {
    return (
      <div>
        <Select defaultValue="0" style={{ width: 180 }} onChange={deliveryHandler}>
          <Option value="0">All</Option>
          <Option value="1">procedure completed</Option>{/* 配送手続き完了 */}
          <Option value="2">unconfirmed</Option>{/* 未確認 */}
        </Select>&nbsp;&nbsp;
        <Search
          placeholder="Input search staff name"
          onChange={staffNameHandler}
          style={{ width:180 }}
          value={SearchStaffTerm}
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
}

export default SearchFeature