import React, { useEffect, useContext, useState } from 'react';
import { Button, Form, Radio, Divider } from 'antd';
import FileUpload from '../../utils/FileUpload';
import { IMAGES_SERVER } from '../../Config.js';
import { IMAGES_VISIBLE_ITEM, IMAGES_TYPE, IMAGES_LANGUAGE } from '../../utils/Const';
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

function ImagesUpdatePage(props) {
  const [Visible, setVisible] = useState(0);
  const [Type, setType] = useState(1);
  const [Language, setLanguage] = useState("");
  const [Images, setImages] = useState([]);  
  const [OldImages, setOldImages] = useState([]);
  const {isLanguage, setIsLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();
  // query string 가져오기
  const imageId = props.match.params.imageId;

  useEffect(() => {
    // 다국어 설정
    const lang = getLanguage(isLanguage);
    i18n.changeLanguage(lang);
    setIsLanguage(lang);

    // HTML lang속성 변경
    setHtmlLangProps(lang);

    // 이미지 가져오기
    process();
	}, [isLanguage])

  const process = async () => {
    await getImage();
  }
  
	const getImage = async () => {
		try {
			const image = await axios.get(`${IMAGES_SERVER}/images_by_id?id=${imageId}`);

			if (image.data.imageInfo) {
        const arr = [image.data.imageInfo.image];

        setOldImages(arr);
        // 이미지는 수정안하고 다른 데이타만 업데이트할 경우는 
        // AWS에 이미지를 저장할 필요없고, 저장할때 유효성체크를 회피하기 위해서 Old Image를 Image에 넣는다
        // 이미지를 추가, 수정 또는 삭제할 경우는 fileUpload에서 추가된 이미지를 오버라이트 해 주기때문에 문제가 없다
        setImages(arr);
        setVisible(image.data.imageInfo.visible);
        setType(image.data.imageInfo.type);
        setLanguage(image.data.imageInfo.language);
			}
		} catch (err) {
			console.log("ImageUpdatePage getImage err: ",err);
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

  // Submit
  const submitHandler = async (event) => {
    event.preventDefault();

    try {
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
          if (imageId === image.data.imageInfo[0]._id) {
            isExists = false;
          } else {
            isExists = true;
          }
        }
      }
      // 노출 이미지가 이미 등록되어 있는경우
      if (isExists) {
        alert(getMessage(getLanguage(), 'key127'));
        return false;
      }
      // 이미지 수정
      const body = {
        id: imageId,
        image: String(Images[0]),
        visible: Visible,
        language: Language
      }
      
      const result = await axios.post(`${IMAGES_SERVER}/update`, body);
      if (result.data.success) {
        alert(getMessage(getLanguage(), 'key102'));
        // 배너리스트 화면에 이동
        props.history.push('/images/list')
      } else {
        alert(getMessage(getLanguage(), 'key001'));
      }
    } catch (err) {
      console.log("ImageUpdatePage submitHandler err: ", err);
      alert(getMessage(getLanguage(), 'key001'));
      // 이미지 리스트 화면에 이동
      listHandler();
    }
  }

  // 이미지삭제
  const deleteHandler = async() => {
    try {
      const body = {
        id: imageId,
        image: String(Images[0])
      }

      await axios.post(`${IMAGES_SERVER}/delete`, body);
      alert(getMessage(getLanguage(), 'key103'));
      // 이미지 리스트 화면에 이동
      listHandler();
    } catch (err) {
      console.log("ImageUpdatePage deleteHandler err: ", err);
      alert(getMessage(getLanguage(), 'key104'));
      // 이미지 리스트 화면에 이동
      listHandler();
    }
  }

  // Landing pageへ戻る
  const listHandler = () => {
    props.history.push('/images/list')
  }

  return (
    <div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} style={{ maxWidth: '700px', margin: '2rem auto' }}>
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