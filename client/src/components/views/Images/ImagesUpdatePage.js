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

function ImagesUpdatePage(props) {
  const [Visible, setVisible] = useState(0);
  const [Type, setType] = useState(1);
  const [Language, setLanguage] = useState("");
  const [isShow, setIsShow] = useState(false);
  const [Description, setDescription] = useState("");
  const [Images, setImages] = useState([]);  
  const [OldImages, setOldImages] = useState([]);
  const {isLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();
  // query string 가져오기
  const imageId = props.match.params.imageId;

  useEffect(() => {
    // 다국적언어 설정
		i18n.changeLanguage(isLanguage);
    // 이미지 가져오기
    process();
	}, [])

  const process = async () => {
    await getImage();
  }
  
	const getImage = async () => {
		try {
			const image = await axios.get(`${IMAGES_SERVER}/images_by_id?id=${imageId}`);

			if (image.data.imageInfo) {
        setOldImages([image.data.imageInfo.image]);
        setVisible(image.data.imageInfo.visible);
        setType(image.data.imageInfo.type);
        // 이미지 타입이 카테고리이면 설명입력란을 보여준다
        if (image.data.imageInfo.type !== 0 && image.data.imageInfo.type !== 1) {
          setIsShow(true);
        }
        if (image.data.imageInfo.description) {
          setDescription(image.data.imageInfo.description);
        }
        setLanguage(image.data.imageInfo.language);
			}
		} catch (err) {
			console.log("err: ",err);
		}
	}

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
    if (Images.length > 1) {
      alert("Only one image can be registered\nClick on the image you want to delete to delete it");
      return false; 
    }

    // 노출하려는 이미지가 이미 등록되어 있는지
    let isExists = false;
    if (Visible === 1) {
      const image = await axios.post(`${IMAGES_SERVER}/images_by_type`, {type: Type, visible: Visible, language: Language});
      if (image.data.imageInfo.length > 0) {
        if (imageId === image.data.imageInfo[0]._id) {
          isExists = false;
        } else {
          isExists = true;
        }
      }
    }
    // 노출 이미지가 이미 등록되어 있는경우
    if (isExists) {
      alert("Image is already registered");
      return false;
    }

    const body = {
      id: imageId,
      image: String(Images[0]),
      visible: Visible,
      language: Language,
      description: Description
    }
    
    const result = await axios.post(`${IMAGES_SERVER}/update`, body);
    if (result.data.success) {
      alert('Image upload was successful');
      // 배너리스트 화면에 이동
      props.history.push('/images/list')
    } else {
      alert('Please contact the administrator');
    }
  }

  // 이미지삭제
  const deleteHandler = async() => {
    try {
      const body = {
        id: imageId,
        image: Image
      }
      const result = await axios.post(`${IMAGES_SERVER}/delete`, body);
      alert('Images deleted was successful');
      // 이미지 리스트 화면에 이동
      listHandler();
    } catch (error) {
      alert('Image deletion failed');
      // 이미지 리스트 화면에 이동
      listHandler();
    }
  }

  // Landing pageへ戻る
  const listHandler = () => {
    props.history.push('/images/list')
  }

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
        <h1>{t('Images.updateTitle')}</h1>
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
        <Divider orientation="left" plain="true" style={{color:"#D3D3D3"}}>{t('Images.language')}</Divider>
        <Radio.Group value={Language} readOnly>
          {languageRadioBoxLists()}
        </Radio.Group>
        <Divider orientation="left" plain="true" style={{color:"#D3D3D3"}}>{t('Images.types')}</Divider>
        <Radio.Group value={Type} readOnly>
          {typeRadioBoxLists()}
        </Radio.Group>
        { isShow && 
          <>
            <Divider orientation="left" plain="true">Category description</Divider>
            <Input type="text" style={{width: '100%'}} value={Description} onChange={descriptionHandler} />
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
          <Button onClick={deleteHandler} type="danger">
            Delete
          </Button>
        </Form.Item>
        <br />
        
      </Form>
    </div>
  )
}

export default ImagesUpdatePage;