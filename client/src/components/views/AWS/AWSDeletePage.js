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

function AWSDeletePage(props) {
  const [Type, setType] = useState("S3");
  const [Access, setAccess] = useState("");
  const [Secret, setSecret] = useState("");
  const [Region, setRegion] = useState("ap-northeast-1");
  const {isLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();
  // query string 가져오기
  const awsId = props.match.params.awsId;

  useEffect(() => {
		i18n.changeLanguage(isLanguage);
    // AWS 가져오기
    getImage();
	}, [])

  // AWS 가져오기
	const getImage = async () => {
		try {
			const aws = await axios.get(`${AWS_SERVER}/aws_by_id?id=${awsId}`);

			if (aws.data.awsInfo) {
        setType(aws.data.awsInfo.type);
        setAccess(aws.data.awsInfo.access);
        setSecret(truncate(aws.data.awsInfo.secret, 20));
        setRegion(aws.data.awsInfo.region);
			}
		} catch (err) {
			console.log("err: ",err);
		}
	}

  // AWS Service type
  const typeRadioBoxLists = () => AWS_TYPE.map((item) => (
    <Radio key={item._id} value={item._id}> {item.name} </Radio>
  ))

  // 이미지삭제
  const deleteHandler = async() => {
    try {
      const result = await axios.post(`${AWS_SERVER}/delete`, {id: awsId});
      alert('AWS deleted was successful');
      // AWS 리스트 화면에 이동
      listHandler();
    } catch (error) {
      alert('AWS deletion failed');
      // AWS 리스트 화면에 이동
      listHandler();
    }
  }

  const truncate = (str, n) => {
		return str?.length > n ? str.substr(0, n-1) + "..." : str;
	}

  // AWS list page 이동
  const listHandler = () => {
    props.history.push('/aws/list')
  }

  // Landing page 이동
  const landingHandler = () => {
    props.history.push('/')
  }

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
        <h1>{t('AWS.deleteTitle')}</h1>
      </div>

      <Form style={{height:'80%', margin:'1em'}} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} >
        <Divider orientation="left" plain="true" style={{color:"#D3D3D3"}}>{t('AWS.type')}</Divider>
        <Radio.Group value={Type} readOnly>
          {typeRadioBoxLists()}
        </Radio.Group>
        <Divider orientation="left" plain="true" style={{color:"#D3D3D3"}}>{t('AWS.Access')}</Divider>
        <Input type="text" value={Access} style={{width: '100%'}} readOnly />
        <Divider orientation="left" plain="true" style={{color:"#D3D3D3"}}>{t('AWS.secret')}</Divider>
        <Input type="text" value={Secret} style={{width: '100%'}} readOnly />
        <Divider orientation="left" plain="true" style={{color:"#D3D3D3"}}>{t('AWS.region')}</Divider>
        <Input type="text" value={Region} style={{width: '100%'}} readOnly />
        <br />
        <br />

        <Form.Item {...tailFormItemLayout}>
          <Button onClick={landingHandler}>
            Landing Page
          </Button>
          <Button onClick={deleteHandler} type="danger">
            Delete
          </Button>
        </Form.Item>
        <br />
        
      </Form>
    </div>
  )
}

export default AWSDeletePage;