import React from 'react';
import { Select } from 'antd';
const {Option} = Select;

function SearchFeatureAdmin(props) {

  const tagSearchHandler = (value) => {
    // 부모 컨테이너에 값을 보내기
    props.refreshFunction(value);
  }
    
  const onOk = (value) => {
    console.log('onOk: ', value);
  }

    return (
      <div>
        <label>Tag search</label>&nbsp;&nbsp;
        <Select defaultValue="0" style={{ width: 180 }} onChange={tagSearchHandler}>
          <Option value="0">AlL</Option>
          <Option value="1">Now On Air product</Option>
          <Option value="2">Recording product</Option>
          <Option value="3">Sale product</Option>
          <Option value="4">Recommended product</Option>
        </Select>
      </div>
    )
}

export default SearchFeatureAdmin;