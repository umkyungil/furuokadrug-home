import React, { useEffect, useContext, useState } from 'react';
import { Button, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { CODE_SERVER } from '../../Config.js';

import { LanguageContext } from '../../context/LanguageContext.js';
import { getLanguage, setHtmlLangProps, getMessage } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

function CodeRegisterPage(props) {
  const [Code, setCode] = useState("");
  const [Name, setName] = useState("");
  const [Value1, setValue1] = useState("");
  const [Value2, setValue2] = useState("");
  const [Value3, setValue3] = useState("");
  const [Value4, setValue4] = useState("");
  const [Value5, setValue5] = useState("");
  const [Value6, setValue6] = useState("");
  const [Value7, setValue7] = useState("");

  const {isLanguage, setIsLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  useEffect(() => {
		// 다국어 설정
    const lang = getLanguage(isLanguage);
    i18n.changeLanguage(lang);
    setIsLanguage(lang);

    // HTML lang속성 변경
    setHtmlLangProps(lang);
	}, [isLanguage])
  
  const handleCode = (e) => {
    setCode(e.target.value);
  };
  const handleName = (e) => {
    setName(e.target.value);
  };
  const handleValue1 = (e) => {
    setValue1(e.target.value);
  };
  const handleValue2 = (e) => {
    setValue2(e.target.value);
  };
  const handleValue3 = (e) => {
    setValue3(e.target.value);
  };
  const handleValue4 = (e) => {
    setValue4(e.target.value);
  };
  const handleValue5 = (e) => {
    setValue5(e.target.value);
  };
  const handleValue6 = (e) => {
    setValue6(e.target.value);
  };
  const handleValue7 = (e) => {
    setValue7(e.target.value);
  };

  // Submit
  const handleSubmit = async (event) => {
    event.preventDefault();

    // 유효성 체크
    if (Code === "") {
      alert(getMessage(getLanguage(), 'key108'));
      return false; 
    }
    if (Name === "") {
      alert(getMessage(getLanguage(), 'key023'));
      return false; 
    }
    if (Value1 === "") {
      alert(getMessage(getLanguage(), 'key109'));
      return false; 
    }
    // 코드중복체크
    const code = await axios.get(`${CODE_SERVER}/code_by_code?code=${Code}`);
    // 코드가 있으면 에러
    if (code.data.codeInfo) {
      alert(getMessage(getLanguage(), 'key110'));
      return false; 
    }

    const body = {
      code: Code,
      name: Name,
      value1: Value1,
      value2: Value2,
      value3: Value3,
      value4: Value4,
      value5: Value5,
      value6: Value6,
      value7: Value7,
    }

    const result = await axios.post(`${CODE_SERVER}/register`, body);
    if (result.data.success) {
      alert(getMessage(getLanguage(), 'key098'));
      listHandler();
    } else {
      alert(getMessage(getLanguage(), 'key001'));
      listHandler();
    }
  }

  // 코드 리스트 페이지에 이동
  const listHandler = () => {
    props.history.push('/code/list');
  }

  return (
    <div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
        <h1>{t('Code.regTitle')}</h1>
      </div>

      <Form name="code" labelCol={{ span: 8}} wrapperCol={{ span: 16 }} style={{ maxWidth: 600 }} onSubmit={handleSubmit} >
        <Form.Item label={t('Code.code')} name="code" required >
          <Input onChange={handleCode} required />
        </Form.Item>
        <Form.Item label={t('Code.name')} name="name" required >
          <Input onChange={handleName} required />
        </Form.Item>
        <Form.Item label={t('Code.value1')} name="value1" required >
          <Input onChange={handleValue1} required />
        </Form.Item>
        <Form.Item label={t('Code.value2')} name="value2" >
          <Input onChange={handleValue2} />
        </Form.Item>
        <Form.Item label={t('Code.value3')} name="value3" >
          <Input onChange={handleValue3} />
        </Form.Item>
        <Form.Item label={t('Code.value4')} name="value4" >
          <Input onChange={handleValue4} />
        </Form.Item>
        <Form.Item label={t('Code.value5')} name="value5" >
          <Input onChange={handleValue5} />
        </Form.Item>
        <Form.Item label={t('Code.value6')} name="value6" >
          <Input onChange={handleValue6} />
        </Form.Item>
        <Form.Item label={t('Code.value7')} name="value7" >
          <Input onChange={handleValue7} />
        </Form.Item>

        <Form.Item wrapperCol={{ offset: 8, span: 16 }} >
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