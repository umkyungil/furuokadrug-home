import React, { useEffect, useContext, useState } from 'react';
import { Button, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext.js';
import { CODE_SERVER } from '../../Config.js';
import axios from 'axios';
// CORS 대책
axios.defaults.withCredentials = true;

function CodeRegisterPage(props) {
  const [Code, setCode] = useState("");
  const [Name, setName] = useState("");
  const [Value1, setValue1] = useState("");
  const [Value2, setValue2] = useState("");
  const [Value3, setValue3] = useState("");

  const {isLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  useEffect(() => {
		i18n.changeLanguage(isLanguage);
	}, [])
  
  const handleCode = (event) => {
    setCode(event.target.value);
  };
  const handleName = (event) => {
    setName(event.target.value);
  };
  const handleValue1 = (event) => {
    setValue1(event.target.value);
  };
  const handleValue2 = (event) => {
    setValue2(event.target.value);
  };
  const handleValue3 = (event) => {
    setValue3(event.target.value);
  };

  // Submit
  const handleSubmit = async (event) => {
    event.preventDefault();

    // 유효성 체크
    if (Code === "") {
      alert("Code is required");
      return false; 
    }
    if (Name === "") {
      alert("Name is required");
      return false; 
    }
    if (Value1 === "") {
      alert("Value1 is required");
      return false; 
    }
    // 코드중복체크
    const code = await axios.get(`${CODE_SERVER}/code_by_code?code=${Code}`);
    // 코드가 있으면 에러
    if (code.data.codeInfo) {
      alert("This is a registered code.");
      return false; 
    }

    const body = {
      code: Code,
      name: Name,
      value1: Value1,
      value2: Value2,
      value3: Value3,
    }

    const result = await axios.post(`${CODE_SERVER}/register`, body);
    if (result.data.success) {
      alert(' Code registration successful');
      listHandler();
    } else {
      alert('Please contact the administrator');
      listHandler();
    }
  }

  // 코드 리스트 페이지에 이동
  const listHandler = () => {
    props.history.push('/code/list');
  }

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
        <h1>Code registration</h1>
      </div>

      <Form name="code" labelCol={{ span: 8}} wrapperCol={{ span: 16 }} style={{ maxWidth: 600 }} onSubmit={handleSubmit} >
        <Form.Item label="Code" name="code" required >
          <Input onChange={handleCode} required />
        </Form.Item>
        <Form.Item label="Name" name="name" required >
          <Input onChange={handleName} required />
        </Form.Item>
        <Form.Item label="Value1" name="value1" required >
          <Input onChange={handleValue1} required />
        </Form.Item>

        <Form.Item label="Value2" name="value2" >
          <Input onChange={handleValue2} />
        </Form.Item>
        <Form.Item label="Value3" name="value3" >
          <Input onChange={handleValue3} />
        </Form.Item>

        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          <Button onClick={listHandler}>
            Code list
          </Button>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default CodeRegisterPage;