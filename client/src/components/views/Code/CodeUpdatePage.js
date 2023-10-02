import React, {useEffect, useState, useContext} from "react";
import { Form, Input, Button } from 'antd';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CODE_SERVER } from '../../Config';

import { LanguageContext } from '../../context/LanguageContext';
import '../ProductPage/Sections/product.css';
import { getLanguage, setHtmlLangProps } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

function CodeUpdatePage(props) {
  const {isLanguage, setIsLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  const [Id, setId] = useState("");
  const [Code, setCode] = useState("");
  const [Name, setName] = useState("");
  const [Value1, setValue1] = useState("");
  const [Value2, setValue2] = useState("");
  const [Value3, setValue3] = useState("");
  const [Value4, setValue4] = useState("");
  const [Value5, setValue5] = useState("");
  const [Value6, setValue6] = useState("");
  const [Value7, setValue7] = useState("");

  const history = useHistory();

  useEffect(() => {
    // 다국어 설정
    const lang = getLanguage(isLanguage);
    i18n.changeLanguage(lang);
    setIsLanguage(lang);

    // HTML lang속성 변경
    setHtmlLangProps(lang);

    // query string 가져오기
    const codeId = props.match.params.codeId;
    // 코드정보 가져오기
    getCode(codeId);
  }, [isLanguage])
  
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
      setValue4(codeInfo.data.codeInfo.value4);
      setValue5(codeInfo.data.codeInfo.value5);
      setValue6(codeInfo.data.codeInfo.value6);
      setValue7(codeInfo.data.codeInfo.value7);
    } catch (err) {
      alert('Please contact the administrator');
      console.log("err: ",err);
      listHandler();
    }
  }
  // 핸들러
  const handleName = (e) => {
    setName(e.target.value);
  }
  const handleValue1 = (e) => {
    setValue1(e.target.value);
  }
  const handleValue2 = (e) => {
    setValue2(e.target.value);
  }
  const handleValue3 = (e) => {
    setValue3(e.target.value);
  }
  const handleValue4 = (e) => {
    setValue4(e.target.value);
  }
  const handleValue5 = (e) => {
    setValue5(e.target.value);
  }
  const handleValue6 = (e) => {
    setValue6(e.target.value);
  }
  const handleValue7 = (e) => {
    setValue7(e.target.value);
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
      value3: Value3,
      value4: Value4,
      value5: Value5,
      value6: Value6,
      value7: Value7
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
    <div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
        <h1>{t('Code.updateTitle')}</h1>
      </div>

      <Form name="code" labelCol={{ span: 8}} wrapperCol={{ span: 16 }} style={{ maxWidth: 600 }} onSubmit={handleSubmit} >
        <Form.Item label={t('Code.code')} name="code" required >
          <Input value={Code} required />
        </Form.Item>
        <Form.Item label={t('Code.name')} name="name" required >
          <Input value={Name} onChange={handleName} required />
        </Form.Item>
        <Form.Item label={t('Code.value1')} name="value1" required >
          <Input value={Value1} onChange={handleValue1} required />
        </Form.Item>
        <Form.Item label={t('Code.value2')} name="value2" >
          <Input value={Value2} onChange={handleValue2} />
        </Form.Item>
        <Form.Item label={t('Code.value3')} name="value3" >
          <Input value={Value3} onChange={handleValue3} />
        </Form.Item>
        <Form.Item label={t('Code.value4')} name="value4" >
          <Input value={Value4} onChange={handleValue4} />
        </Form.Item>
        <Form.Item label={t('Code.value5')} name="value5" >
          <Input value={Value5} onChange={handleValue5} />
        </Form.Item>
        <Form.Item label={t('Code.value6')} name="value6" >
          <Input value={Value6} onChange={handleValue6} />
        </Form.Item>
        <Form.Item label={t('Code.value7')} name="value7" >
          <Input value={Value7} onChange={handleValue7} />
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