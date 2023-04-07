import React, { useEffect, useContext, useState } from 'react';
import { Button, Form, Radio, Divider, Input } from 'antd';
import { AWS_SERVER } from '../../Config.js';
import { AWS_TYPE } from '../../utils/Const';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext';
import axios from 'axios';
// CORS 대책
axios.defaults.withCredentials = true;

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

function AWSRegisterPage(props) {
  const [Type, setType] = useState("S3");
  const [Access, setAccess] = useState("");
  const [Secret, setSecret] = useState("");
  const [Region, setRegion] = useState("ap-northeast-1");
  const {isLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  useEffect(() => {
		i18n.changeLanguage(isLanguage);
	}, [])

  // AWS 타입
  const typeHandler = (event) => {
    setType(event.target.value);
  }
  // Access
  const accessHandler = (event) => {
    setAccess(event.target.value);
  };
  // Secret
  const secretHandler = (event) => {
    setSecret(event.target.value);
  };

  // AWS Service type
  const typeRadioBoxLists = () => AWS_TYPE.map((item) => (
    <Radio key={item._id} value={item._id}> {item.name} </Radio>
  ))

  // Submit
  const submitHandler = async (event) => {
    event.preventDefault();

    // 유효성 체크
    if (Access === "") {
      alert("Access is required");
      return false; 
    }
    if (Access.length !== 20 ) {
      alert("Please check Access");
      return false; 
    }
    if (Secret === "") {
      alert("Secret is required");
      return false; 
    }
    if (Secret.length !== 40 ) {
      alert("Please check Secret");
      return false; 
    }

    // AWS 서비스가 이미 등록되어 있는지
    let isExists = false;
    const aws = await axios.post(`${AWS_SERVER}/aws_by_type`, {type: Type});
    console.log("aws: " + JSON.stringify(aws));
    console.log("length: " + aws.data.awsInfo.length);

    if (aws.data.awsInfo.length > 0) {
      isExists = true;
    }
    
    // AWS 서비스가 이미 등록되어 있는경우
    if (isExists) {
      alert("AWS service is registered. Please register after deleting");
      return false;
    }

    const body = {
      type: Type,
      access: Access,
      secret: Secret,
      region: Region
    }
    
    const result = await axios.post(`${AWS_SERVER}/register`, body);
    if (result.data.success) {
      alert('AWS upload was successful');
      listHandler();
    } else {
      alert('Please contact the administrator');
      listHandler();
    }
  }

  // AWS list page에 이동
  const listHandler = () => {
    props.history.push('/aws/list')
  }
  // Landing page에 이동
  const landingHandler = () => {
    props.history.push('/')
  }

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
        <h1>{t('AWS.regTitle')}</h1>
      </div>

      <Form style={{height:'80%', margin:'1em'}} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} onSubmit={submitHandler}>
        <Divider orientation="left" plain="true">{t('AWS.type')}</Divider>
        <Radio.Group onChange={typeHandler} value={Type}>
          {typeRadioBoxLists()}
        </Radio.Group>
        <Divider orientation="left" plain="true">{t('AWS.access')}</Divider>
        <Input type="text" placeholder="access" style={{width: '100%'}} onChange={accessHandler} />
        <Divider orientation="left" plain="true">{t('AWS.secret')}</Divider>
        <Input type="text" placeholder="secret" style={{width: '100%'}} onChange={secretHandler} />
        <br />
        <br />

        <Form.Item {...tailFormItemLayout}>
          <Button onClick={landingHandler}>
            Landing Page
          </Button>
          <Button htmlType="submit" type="primary">
            Submit
          </Button>
        </Form.Item>
        <br />
        
      </Form>
    </div>
  )
}

export default AWSRegisterPage;