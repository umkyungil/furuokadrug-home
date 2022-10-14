import React, { useState, useEffect } from 'react';
import { Button, Form, Input } from 'antd';
import FileUpload from '../../utils/FileUpload';
import { MainCategory } from '../../utils/Const';
import { PRODUCT_SERVER } from '../../Config.js';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
// CORS 대책
axios.defaults.withCredentials = true;

const { TextArea } = Input;

function UploadProductPage(props) {
  const [Title, setTitle] = useState("");
  const [EnglishTitle, setEnglishTitle] = useState("");
  const [ChineseTitle, setChineseTitle] = useState("");
  const [Description, setDescription] = useState("");
  const [EnglishDescription, setEnglishDescription] = useState("");
  const [ChineseDescription, setChineseDescription] = useState("");
  const [Usage, setUsage] = useState("");
  const [EnglishUsage, setEnglishUsage] = useState("");
  const [ChineseUsage, setChineseUsage] = useState("");
  const [Contents, setContents] = useState("");
  const [Price, setPrice] = useState(0);
  const [Point, setPoint] = useState(0);
  const [Continent, setContinent] = useState(1);
  const [Images, setImages] = useState([]);

  useEffect(() => {
    // 다국적언어 설정
		setMultiLanguage(localStorage.getItem("i18nextLng"));
	}, [])

  const titleHandler = (event) => {
    setTitle(event.currentTarget.value);
  }
  const englishTitleHandler = (event) => {
    setEnglishTitle(event.currentTarget.value);
  }
  const chineseTitleHandler = (event) => {
    setChineseTitle(event.currentTarget.value);
  }
  const descriptionHandler = (event) => {
    setDescription(event.currentTarget.value);
  }
  const englishDescriptionHandler = (event) => {
    setEnglishDescription(event.currentTarget.value);
  }
  const chineseDescriptionHandler = (event) => {
    setChineseDescription(event.currentTarget.value);
  }  
  const usageHandler = (event) => {
    setUsage(event.currentTarget.value);
  }
  const englishUsageHandler = (event) => {
    setEnglishUsage(event.currentTarget.value);
  }
  const chineseUsageHandler = (event) => {
    setChineseUsage(event.currentTarget.value);
  }
  const contentsHandler = (event) => {
    setContents(event.currentTarget.value);
  }
  const priceHandler = (event) => {
    setPrice(event.currentTarget.value);
  }
  const pointHandler = (event) => {
    setPoint(event.currentTarget.value);
  }
  const continentHandler = (event) => {
    setContinent(event.currentTarget.value);
  }
  const updateImages = (newImages) => {
    setImages(newImages);
  }

  const submitHandler = (event) => {
    event.preventDefault();

    // validation check
    if (Images.length < 1) return alert("Please select an image");
    if (!Title) return alert("Please enter a title(Japanese)");
    if (!EnglishTitle) return alert("Please enter a title(English)");
    if (!ChineseTitle) return alert("Please enter a title(Chinese)");
    if (!Description) return alert("Please enter a product description(Japanese)");
    if (!EnglishDescription) return alert("Please enter a product description(English)");
    if (!ChineseDescription) return alert("Please enter a product description(Chinese)");
    if (!Usage) return alert("Please enter how to use(Japanese)");
    if (!EnglishUsage) return alert("Please enter a product usage(English)");
    if (!ChineseUsage) return alert("Please enter a product usage(Chinese)");
    if (!Contents) return alert("Please enter the contents");
    if (Number(Price) < 0) return alert("Please check the price");    
    if (Number(Point) < 0) return alert("Please check the point");

    // 숫자확인
    if (isNaN(Price)) {
      alert("Please enter only numbers for the price");
    }
    if (isNaN(Point)) {
      alert("Please enter only numbers for point");
    }

    // 서버에 채운 값들을 request로 보낸다
    const body = {
      writer: props.user.userData._id,
      title: Title,
      englishTitle: EnglishTitle,
      chineseTitle: ChineseTitle,
      description: Description,
      englishDescription: EnglishDescription,
      chineseDescription: ChineseDescription,
      usage: Usage,
      englishUsage: EnglishUsage,
      chineseUsage: ChineseUsage,
      contents: Contents,
      price: Price,
      point: Point,
      images: Images,
      continents: Continent
    }
    
    axios.post(`${PRODUCT_SERVER}`, body)
      .then(response => {
        if (response.data.success) {
          alert('Product upload was successful.');
          // 상품상세 이동
          props.history.push('/')
        } else {
          alert('Product upload failed.');
        }
      });
  }

  // 다국어 설정
	const {t, i18n} = useTranslation();
  function setMultiLanguage(lang) {
    i18n.changeLanguage(lang);
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

      <Form onSubmit={submitHandler}>
        {/* DropZone*/}
        <FileUpload refreshFunction={updateImages} />
        <br />
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.japaneseTitle')}</label>
        <Input onChange={titleHandler} value={Title}/><br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.englishTitle')}</label>
        <Input onChange={englishTitleHandler} value={EnglishTitle}/><br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.chineseTitle')}</label>
        <Input onChange={chineseTitleHandler} value={ChineseTitle}/>
        <br />
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.japaneseDescription')}</label>
        <TextArea onChange={descriptionHandler} value={Description}/><br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.englishDescription')}</label>
        <TextArea onChange={englishDescriptionHandler} value={EnglishDescription}/><br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.chineseDescription')}</label>
        <TextArea onChange={chineseDescriptionHandler} value={ChineseDescription}/>
        <br />
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.japaneseHowToUse')}</label>
        <TextArea onChange={usageHandler} value={Usage}/><br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.englishHowToUse')}</label>
        <TextArea onChange={englishUsageHandler} value={EnglishUsage}/><br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.chineseHowToUse')}</label>
        <TextArea onChange={chineseUsageHandler} value={ChineseUsage}/>
        <br />
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.contents')}</label>
        <Input onChange={contentsHandler} value={Contents}/>
        <br />
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.price')}(¥)</label>
        <Input onChange={priceHandler} value={Price}/>
        <br />
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.point')}</label>
        <Input onChange={pointHandler} value={Point}/>
        <br />
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.itemSelection')}</label>
        <br />
        <select onChange={continentHandler} value={Continent}>
          {MainCategory.map(item => (
            <option key={item.key} value={item.key}> {item.value} </option>
          ))}
        </select>
        <br />
        <br />
        <br />
        <Button onClick={listHandler}>
          Landing Page
        </Button>&nbsp;&nbsp;&nbsp;
        <Button htmlType="submit" type="primary">
          Submit
        </Button>
      </Form>
    </div>
  )
}

export default UploadProductPage