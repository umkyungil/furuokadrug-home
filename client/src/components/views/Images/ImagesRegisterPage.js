import React, { useEffect, useContext, useState } from 'react';
import { Button, Form, Radio, Divider, Input } from 'antd';
import FileUpload from '../../utils/FileUpload';
import { IMAGES_SERVER } from '../../Config.js';
import { IMAGES_VISIBLE_ITEM, IMAGES_TYPE, IMAGES_LANGUAGE } from '../../utils/Const';
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

function ImagesRegisterPage(props) {
  const [Visible, setVisible] = useState(0);
  const [Type, setType] = useState(1);
  const [Language, setLanguage] = useState(0);
  const [Images, setImages] = useState([]);
  const [IsShow, setIsShow] = useState(false);
  const [Description, setDescription] = useState("");

  const {isLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  useEffect(() => {
		i18n.changeLanguage(isLanguage);
	}, [])

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
  const uploadImage = (newImages) => {
    console.log("newImages: ", newImages);
    
    setImages(newImages);
  }
  // 이미지 화면노출 여부
  const visibleHandler = (event) => {
    setVisible(event.target.value);
  };
  // 이미지 타입
  const typeHandler = (event) => {
    setType(event.target.value);
    // logo, banner가 아니면 설명을 보여준다
    if (event.target.value !== 0 && event.target.value !== 1) {
        setIsShow(true);
    } else if ( event.target.value == 0 || event.target.value == 1 ) {
      setIsShow(false);
    }
  };
  // 이미지 언어 속성
  const languageHandler = (event) => {
    setLanguage(event.target.value);
  };
  // 카테고리 설명
  const descriptionHandler = (event) => {
    setDescription(event.target.value);
  }

  // Submit
  const submitHandler = async (event) => {
    event.preventDefault();

    // 유효성 체크
    if (Images.length < 1) {
      alert("Image is required");
      return false; 
    }
    // 유효성 체크
    if (Images.length > 1) {
      alert("Only one image can be registered\nClick on the image you want to delete to delete it");
      return false; 
    }
    // 노출하려는 이미지가 이미 등록되어 있는지
    let isExists = false;
    if (Visible === 1) {
      const image = await axios.post(`${IMAGES_SERVER}/images_by_type`, {type: Type, visible: Visible, language: Language});
      console.log("image: " + image);
      if (image.data.imageInfo.length > 0) {
        isExists = true;
      }
    }
    // 노출하려는 이미지가 이미 등록되어 있는경우
    if (isExists) {
      alert("Images is already registered");
      return false;
    }

    const body = {
      image: String(Images[0]), // 문자열로 변형하지 않으면 배열로 넘어가서 타입에러가 발생한다
      type: Type,
      visible: Visible,
      language: Language,
      description: Description
    }
    
    const result = await axios.post(`${IMAGES_SERVER}/register`, body);
    if (result.data.success) {
      alert('Images upload was successful');
      // 배너리스트 화면에 이동
      props.history.push('/images/list')
    } else {
      alert('Please contact the administrator');
    }
  }

  // 이미지 리스트 화면에 이동
  const listHandler = () => {
    props.history.push('/images/list')
  }

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>{t('Images.regTitle')}</h1>
      </div>

      <Form style={{height:'80%', margin:'1em'}} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} onSubmit={submitHandler}>
        {/* DropZone*/}
        <FileUpload refreshFunction={uploadImage} />
        <br />
        <br />
        
        <Divider orientation="left" plain="true">{t('Images.screenVisible')}</Divider>
        <Radio.Group onChange={visibleHandler} value={Visible}>
          {itemRadioBoxLists()}
        </Radio.Group>
        <Divider orientation="left" plain="true">{t('Images.language')}</Divider>
        <Radio.Group value={Language} readOnly>
          {languageRadioBoxLists()}
        </Radio.Group>
        <Divider orientation="left" plain="true">{t('Images.types')}</Divider>
        <Radio.Group onChange={typeHandler} value={Type}>
          {typeRadioBoxLists()}
        </Radio.Group>
        { IsShow && 
          <>
            <Divider orientation="left" plain="true">Category description</Divider>
            <Input type="text" placeholder="Category description" style={{width: '100%'}} onChange={descriptionHandler} />
          </>
        }

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