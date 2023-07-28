import React, { useEffect, useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Descriptions } from 'antd';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext';
import { CODE_SERVER } from '../../Config';
import axios from 'axios';
// CORS 대책
axios.defaults.withCredentials = true;

function CodeDetailPage(props) {
  const [Code, setCode] = useState({});
  const codeId = props.match.params.codeId;
  const {isLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();
  const history = useHistory();

  useEffect(() => {
    // 다국어 설정
    i18n.changeLanguage(isLanguage);
    // 코드정보 가져오기
    getCode(codeId);
  }, [])
  
  // 코드정보 가져오기
  const getCode = async (codeId) => {
    try {
      const codeInfo = await axios.get(`${CODE_SERVER}/code_by_id?id=${codeId}`);
      setCode(codeInfo.data.codeInfo);
    } catch (err) {
      alert('Please contact the administrator');
      console.log("err: ",err);
      listHandler();
    }
  }

  const listHandler = () => {
    history.push("/code/list");
  }

  // 코드정보 삭제
  const deleteHandler = async () => {
    try {
      await axios.post(`${CODE_SERVER}/delete`, { id:codeId });
			listHandler();
    } catch (err) {
      alert('Please contact the administrator');
      console.log("err: ",err);
      listHandler();
    }
  }

  return (
    <div style={{ width:'100%', padding:'3rem 4rem' }}>
      <div style={{ textAlign: 'center', paddingTop: '38px' }}>
        <h1>{t('Code.detailTitle')}</h1>
      </div>
      <br />

      <div>
        <Descriptions>
          <Descriptions.Item label={t('Code.name')}>{Code.name}</Descriptions.Item>
          <Descriptions.Item label={t('Code.code')}>{Code.code}</Descriptions.Item>
          <Descriptions.Item label={t('Code.value1')}>{Code.value1}</Descriptions.Item>
          <Descriptions.Item label={t('Code.value2')}>{Code.value2}</Descriptions.Item>
          <Descriptions.Item label={t('Code.value3')}>{Code.value3}</Descriptions.Item>
          <Descriptions.Item label={t('Code.value4')}>{Code.value4}</Descriptions.Item>
          <Descriptions.Item label={t('Code.value5')}>{Code.value5}</Descriptions.Item>
          <Descriptions.Item label={t('Code.value6')}>{Code.value6}</Descriptions.Item>
          <Descriptions.Item label={t('Code.value7')}>{Code.value7}</Descriptions.Item>
          <Descriptions.Item label={t('Code.createdAt')}>{Code.createdAt}</Descriptions.Item>
        </Descriptions>

        <br />
        <br />
        <br />
        <div style={{ display: 'flex', justifyContent: 'center' }} >
          <Button onClick={listHandler}>
            Code List
          </Button>
          <Button type="danger" onClick={deleteHandler}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CodeDetailPage;