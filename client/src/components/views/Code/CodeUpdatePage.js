import React, {useEffect, useState, useContext} from "react";
import { updateUser } from "../../../_actions/user_actions";
import { useDispatch } from "react-redux";
import { Select, Form, Input, Button, Checkbox } from 'antd';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext';
import axios from 'axios';
import { CODE_SERVER } from '../../Config';
// CORS 대책
axios.defaults.withCredentials = true;

const { Option } = Select;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

function CodeUpdatePage(props) {
  const {isLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  const [Id, setId] = useState("");
  const [Code, setCode] = useState("");
  const [Name, setName] = useState("");
  const [Value1, setValue1] = useState("");
  const [Value2, setValue2] = useState("");
  const [Value3, setValue3] = useState("");

  const history = useHistory();

  useEffect(() => {
    // 다국적언어
    i18n.changeLanguage(isLanguage);
    // query string 가져오기
    const codeId = props.match.params.codeId;
    // 코드정보 가져오기
    getCode(codeId);
  }, [])
  
  // 코드정보 가져오기
  const getCode = async (codeId) => {
    try {
      const codeInfo = await axios.get(`${CODE_SERVER}/code_by_id?id=${codeId}`);
      setId(codeInfo.data.codeInfo._id);
      setCode(codeInfo.data.codeInfo.code);
      setName(codeInfo.data.codeInfo.name);
      setValue1(codeInfo.data.codeInfo.value1);
      setValue2(codeInfo.data.codeInfo.value2);
      setValue3(codeInfo.data.codeInfo.value3);
    } catch (err) {
      alert('Please contact the administrator');
      console.log("err: ",err);
      listHandler();
    }
  }
  // 핸들러
  const handleName = (event) => {
    setName(event.target.value);
  }
  const handleValue1 = (event) => {
    setValue1(event.target.value);
  }
  const handleValue2 = (event) => {
    setValue2(event.target.value);
  }
  const handleValue3 = (event) => {
    setValue3(event.target.value);
  }
  
  // 코드일람 페이지 이동
  const listHandler = () => {
    history.push('/code/list');
  }
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Name === "") {
      alert("Name is required");
      return false;
    }
    if (Value1 === "") {
      alert("Date of birth is required");
      return false;
    }

    let body = {
      id: Id,
      code: Code,
      name: Name,
      value1: Value1,
      value2: Value2,
      value3: Value3
    };

    try {
      const result = await axios.post(`${CODE_SERVER}/update`, body);
      console.log("result: ", result);
    
      if (result.data.success) {
        alert('Code update was successful');
        listHandler();
      } else {
        alert('Please contact the administrator');
        listHandler();
      }
    } catch (err) {
      console.log("err: ", err);
      alert('Please contact the administrator');
      listHandler();
    }
  };

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
        <h1>Code update</h1>
      </div>

      <Form name="code" labelCol={{ span: 8}} wrapperCol={{ span: 16 }} style={{ maxWidth: 600 }} onSubmit={handleSubmit} >
        <Form.Item label="Code" name="code" required >
          <Input value={Code} required />
        </Form.Item>
        <Form.Item label="Name" name="name" required >
          <Input value={Name} onChange={handleName} required />
        </Form.Item>
        <Form.Item label="Value1" name="value1" required >
          <Input value={Value1} onChange={handleValue1} required />
        </Form.Item>
        <Form.Item label="Value2" name="value2" >
          <Input value={Value2} onChange={handleValue2} />
        </Form.Item>
        <Form.Item label="Value3" name="value3" >
          <Input value={Value3} onChange={handleValue3} />
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
};

export default CodeUpdatePage;