import React from 'react';
import { Input } from 'antd';
const { Search } = Input;

function SearchFeature(props) {
  const onSearch = (value) => {
    // 부모 컨테이너에 값을 보내기
    props.refreshFunction(value);
  }

  return (
    <div>
      <Search
        placeholder="Product name"
        onSearch={onSearch}
        style={{ width:151 }}
      />
    </div>
  )
}

export default SearchFeature;