import React, {useState} from 'react'
import { Input } from 'antd';

const { Search } = Input;

function SearchFeature(props) {
  const [SearchTerm, setSearchTerm] = useState("")
  
  const searchHandler = (event) => {
    setSearchTerm(event.currentTarget.value);

    // 부모 컨테이너에 값을 보내기
    props.refreshFunction(event.currentTarget.value);
  }

  return (
    <div>
      <Search
        placeholder="Input search name"
        onChange={searchHandler}
        style={{ width:200 }}
        value={SearchTerm}
      />
    </div>
  )
}

export default SearchFeature
