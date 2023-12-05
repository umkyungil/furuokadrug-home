import React, { useEffect, useContext, useState } from 'react';
import { Button, Form, Radio, Divider } from 'antd';
import FileUpload from '../../utils/FileUpload';
import { IMAGES_SERVER } from '../../Config.js';
import { IMAGES_VISIBLE_ITEM, IMAGES_TYPE, IMAGES_LANGUAGE, I18N_JAPANESE } from '../../utils/Const';
import { useTranslation } from 'react-i18next';

import { LanguageContext } from '../../context/LanguageContext';
import { getLanguage, setHtmlLangProps, getMessage } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
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

function ImagesRegisterPage(props) {
  const [Visible, setVisible] = useState(1);
  const [Type, setType] = useState(1);
  const [Language, setLanguage] = useState(I18N_JAPANESE);
  const [Images, setImages] = useState([]);
  const [OldImages, setOldImages] = useState([]); // 실제 사용하지는 않지만 빈 배열을 props로 넘기는 용도로 사용
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

  // 이미지노출 라디오 항목 설정
  const itemRadioBoxLists = () => IMAGES_VISIBLE_ITEM.map((item) => (
    <Radio key={item._id} value={item._id}> {item.name} </Radio>
  ))
  // 이미지타입 라디오 항목 설정
  const typeRadioBoxLists = () => IMAGES_TYPE.map((item) => (
    <Radio key={item._id} value={item._id}> {item.name} </Radio>
  ))
  // 이미지언어 라디오 항목 설정
  const languageRadioBoxLists = () => IMAGES_LANGUAGE.map((item) => (
    <Radio key={item._id} value={item._id}> {item.name} </Radio>
  ))
  // 이미지 설정
  const updateImages = (newImages) => {
    setImages(newImages);
  }
  // 이미지 화면노출 여부
  const visibleHandler = (event) => {
    setVisible(event.target.value);
  };
  // 이미지 타입
  const typeHandler = (event) => {
    setType(event.target.value);
  };
  // 이미지 언어 속성
  const languageHandler = (event) => {
    setLanguage(event.target.value);
  };

  // Submit
  const submitHandler = async (event) => {
    event.preventDefault();

    // 유효성 체크
    if (Images.length < 1) {
      alert(getMessage(getLanguage(), 'key125'));
      return false; 
    }
    if (Images.length > 1) {
      alert(getMessage(getLanguage(), 'key126'));
      return false; 
    }
    // 노출하려는 이미지가 이미 등록되어 있는지
    let isExists = false;
    if (Visible === 1) {
      const image = await axios.post(`${IMAGES_SERVER}/images_by_type`, {type: Type, visible: Visible, language: Language});
      if (image.data.imageInfo.length > 0) {
        isExists = true;
      }
    }
    // 노출하려는 이미지가 이미 등록되어 있는경우
    if (isExists) {
      alert(getMessage(getLanguage(), 'key127'));
      return false;
    }

    const body = {
      image: String(Images[0]), // 문자열로 변형하지 않으면 배열로 넘어가서 타입에러가 발생한다
      type: Type,
      visible: Visible,
      language: Language
    }
    
    const result = await axios.post(`${IMAGES_SERVER}/register`, body);
    if (result.data.success) {
      alert(getMessage(getLanguage(), 'key102'));
      // 배너리스트 화면에 이동
      props.history.push('/images/list')
    } else {
      alert(getMessage(getLanguage(), 'key001'));
    }
  }

  // 이미지 리스트 화면에 이동
  const listHandler = () => {
    props.history.push('/images/list')
  }

  return (
    <div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
        <h1>{t('Images.regTitle')}</h1>
      </div>

      <Form style={{height:'80%', margin:'1em'}} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} onSubmit={submitHandler}>
        {/* DropZone*/}
        <FileUpload refreshFunction={updateImages} oldImages={OldImages} />
        <br />
        <br />
        
        <Divider orientation="left" plain="true">{t('Images.screenVisible')}</Divider>
        <Radio.Group onChange={visibleHandler} value={Visible}>
          {itemRadioBoxLists()}
        </Radio.Group>
        <Divider orientation="left" plain="true">{t('Images.language')}</Divider>
        <Radio.Group onChange={languageHandler} value={Language} >
          {languageRadioBoxLists()}
        </Radio.Group>
        <Divider orientation="left" plain="true">{t('Images.types')}</Divider>
        <Radio.Group onChange={typeHandler} value={Type}>
          {typeRadioBoxLists()}
        </Radio.Group>

        <br />
        <br />
        <br />
        <Form.Item {...tailFormItemLayout}>
          <Button onClick={listHandler}>
            Images List
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

export default ImagesRegisterPage;