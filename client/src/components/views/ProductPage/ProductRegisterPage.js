import React, { useEffect, useContext, useRef } from 'react';
import { Button, Form, Input, Checkbox, Select } from 'antd';
import FileUpload from '../../utils/FileUpload';
import { PRODUCT_SERVER } from '../../Config.js';
import { MAIN_CATEGORY, PRODUCT_VISIBLE_TYPE } from '../../utils/Const';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext';
import axios from 'axios';
// CORS 대책
axios.defaults.withCredentials = true;

const {TextArea} = Input;
const {Option} = Select;

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

function ProductRegisterPage(props) {
  const japaneseTitleRef = useRef("");
  const englishTitleRef = useRef("");
  const chineseTitleRef = useRef("");
  const japaneseDescriptionRef = useRef("");
  const englishDescriptionRef = useRef("");
  const chineseDescriptionRef = useRef("");
  const japaneseUsageRef = useRef("");
  const englishUsageRef = useRef("");
  const chineseUsageRef = useRef("");
  const contentsRef = useRef("");
  const priceRef = useRef(0);
  const pointRef = useRef(0);
  const continentRef = useRef(1);
  const exposureTypeRef = useRef([]);
  const imagesRef = useRef([]);

  const {isLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  // 상품의 메인화면 노출여부의 라디오 항목 작성
  let options = [];
  PRODUCT_VISIBLE_TYPE.map(item => {
    // 일반상품은 제외
    if (item.key !== 0) {
      const object = {};
      object.label = item.value;
      object.value = item.key;
      options.push(object);
    }
  });

  useEffect(() => {
    // 다국적언어 설정
		i18n.changeLanguage(isLanguage);
	}, [])

  const japaneseTitleHandler = (event) => {
    japaneseTitleRef.current = event.currentTarget.value;
  }
  const englishTitleHandler = (event) => {
    englishTitleRef.current = event.currentTarget.value;
  }
  const chineseTitleHandler = (event) => {
    chineseTitleRef.current = event.currentTarget.value;
  }
  const japaneseDescriptionHandler = (event) => {
    japaneseDescriptionRef.current = event.currentTarget.value;
  }
  const englishDescriptionHandler = (event) => {
    englishDescriptionRef.current = event.currentTarget.value;
  }
  const chineseDescriptionHandler = (event) => {
    chineseDescriptionRef.current = event.currentTarget.value;
  }  
  const japaneseUsageHandler = (event) => {
    japaneseUsageRef.current = event.currentTarget.value;
  }
  const englishUsageHandler = (event) => {
    englishUsageRef.current = event.currentTarget.value;
  }
  const chineseUsageHandler = (event) => {
    chineseUsageRef.current = event.currentTarget.value;
  }
  const contentsHandler = (event) => {
    contentsRef.current = event.currentTarget.value;
  }
  const priceHandler = (event) => {
    priceRef.current = event.currentTarget.value;
  }
  const pointHandler = (event) => {
    pointRef.current = event.currentTarget.value;
  }
  const continentHandler = (event) => {
    continentRef.current = event;
  }
  const updateImages = (newImages) => {
    imagesRef.current = newImages
  }
  // 상품노출 옵션
  const exposureHandler = (event) => {
    exposureTypeRef.current = event;
  };

  // Submit
  const submitHandler = async (event) => {
    event.preventDefault();

    // 유효성 체크
    if (imagesRef.current.length < 1) {
      alert("Please select an image");
      return false; 
    }
    if (japaneseTitleRef.current === "") {
      alert("Please enter Japanese title");
      return false;
    }
    if (englishTitleRef.current === "") {
      alert("Please enter an English title");
      return false;
    }
    if (chineseTitleRef.current === "") {
      alert("Please enter Chinese title");
      return false;
    }
    if (japaneseDescriptionRef.current === "") {
      alert("Please enter a Japanese product description");
      return false;
    }
    if (englishDescriptionRef.current === "") {
      alert("Please enter an English product description");
      return false;
    }
    if (chineseDescriptionRef.current === "") {
      alert("Please enter a Chinese product description");
      return false;
    }
    if (japaneseUsageRef.current === "") {
      alert("Please enter how to use Japanese");
      return false;
    }
    if (englishUsageRef.current === "") {
      alert("Please enter how to use English");
      return false;
    }
    if (chineseUsageRef.current === "") {
      alert("Please enter how to use Chinese");
      return false;
    }
    if (contentsRef.current === "") {
      alert("Please enter the capacity");
      return false;
    }
    if (!Number(priceRef.current)) {
      alert("Please enter only numbers for the price");
      return false;
    }
    if (!Number(pointRef.current)) {
      alert("Please enter only numbers for the point");
      return false;
    }
    if (Number(priceRef.current) <= 0) {
      alert("Please check the price");
      return false;
    }
    if (Number(pointRef.current) <= 0) {
      alert("Please check the point");
      return false;
    }
    
    // Now on sale이 선택됐는지
    let isNowOnAir = false;
    exposureTypeRef.current.map(item => {
      if (item === PRODUCT_VISIBLE_TYPE[1].key) {
        isNowOnAir = true;
      }
    });
    // Recording이 선택됐는지
    let isRecording = false;
    exposureTypeRef.current.map(item => {
      if (item === PRODUCT_VISIBLE_TYPE[2].key) {
        isRecording = true;
      }
    });
    // Now on sale과 Recording 둘다 선택됐는지
    if (isNowOnAir && isRecording) {
      alert("Now on air and recording cannot be selected together");
      return false;
    }
    // Now on sale 상품이 이미 등록되어 있는지 확인
    let isExists = false;
    if (isNowOnAir) {
      const body = {type: [PRODUCT_VISIBLE_TYPE[1].key]}
      await axios.post(`${PRODUCT_SERVER}/products_by_type`, body)
      .then((products) => {
        if (products.data.productInfos.length > 0) {
          isExists = true;
        }
      })
    }
    // Now on sale 상품이 이미 등록되어 있는경우
    if (isExists) {
      alert("Product is already registered");
      return false;
    }

    const body = {
      writer: props.user.userData._id,
      title: japaneseTitleRef.current,
      englishTitle: englishTitleRef.current,
      chineseTitle: chineseTitleRef.current,
      description: japaneseDescriptionRef.current,
      englishDescription: englishDescriptionRef.current,
      chineseDescription: chineseDescriptionRef.current,
      usage: japaneseUsageRef.current,
      englishUsage: englishUsageRef.current,
      chineseUsage: chineseUsageRef.current,
      contents: contentsRef.current, // capacity
      price: priceRef.current,
      point: pointRef.current,
      images: imagesRef.current,
      continents: continentRef.current,
      exposureType: exposureTypeRef.current,
    }
    
    const result = await axios.post(`${PRODUCT_SERVER}/register`, body);
    if (result.data.success) {
      alert('Product upload was successful');
      // 상품상세 이동
      props.history.push('/')
    } else {
      alert('Please contact the administrator');
    }
  }

  // Landing pageへ戻る
  const listHandler = () => {
    props.history.push('/')
  }

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>{t('Product.uploadTitle')}</h1>
      </div>

      <Form style={{height:'80%', margin:'1em'}} labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} onSubmit={submitHandler}>
        {/* DropZone*/}
        <FileUpload refreshFunction={updateImages} />
        <br />
        <br />
        <Form.Item required label={t('Product.japaneseTitle')}>
          <Input type="text" style={{width: '100%'}} onChange={japaneseTitleHandler} />
        </Form.Item>
        <Form.Item required label={t('Product.englishTitle')}>
          <Input type="text" style={{width: '100%'}} onChange={englishTitleHandler} />
        </Form.Item>
        <Form.Item required label={t('Product.chineseTitle')}>
          <Input type="text" style={{width: '100%'}} onChange={chineseTitleHandler} />
        </Form.Item>

        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.japaneseDescription')}</label>
        <TextArea onChange={japaneseDescriptionHandler} />
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.englishDescription')}</label>
        <TextArea onChange={englishDescriptionHandler} />
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.chineseDescription')}</label>
        <TextArea onChange={chineseDescriptionHandler} />
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.japaneseHowToUse')}</label>
        <TextArea onChange={japaneseUsageHandler} />
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.englishHowToUse')}</label>
        <TextArea onChange={englishUsageHandler} />
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.chineseHowToUse')}</label>
        <TextArea onChange={chineseUsageHandler} />
        <br />
        <br />
        <Form.Item required label={t('Product.contents')}>
          <Input type="text" placeholder='例) 500ml' style={{width: '100%'}} onChange={contentsHandler} />
        </Form.Item>
        <Form.Item required label={t('Product.price')}>
          <Input type="text" defaultValue="0" style={{width: '100%'}} onChange={priceHandler} />
        </Form.Item>
        <Form.Item required label={t('Product.point')}>
          <Input type="text" defaultValue="0" style={{width: '100%'}} onChange={pointHandler} />
        </Form.Item>
        <Form.Item required label={t('Product.itemSelection')}>
          <Select defaultValue="Cosmetic" style={{ width: 120 }} onChange={continentHandler} >
            {MAIN_CATEGORY.map(item => {
              // 카테고리에서 All제외
              if (item.key !== 0) {
                return (<Option key={item.key} value={item.key} > {item.value} </Option>);
              }
            })}
            </Select>
        </Form.Item>
        <Form.Item label={t('Product.exposure')}>
          <Checkbox.Group options={options} onChange={exposureHandler} />
        </Form.Item>

        <Form.Item {...tailFormItemLayout}>
          <Button onClick={listHandler}>
            Landing Page
          </Button>&nbsp;&nbsp;
          <Button htmlType="submit" type="primary">
            Submit
          </Button>
        </Form.Item>
        <br />
        
      </Form>
    </div>
  )
}

export default ProductRegisterPage