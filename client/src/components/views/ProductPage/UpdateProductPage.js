import React, { useState, useEffect } from 'react';
import { Button, Form, Input } from 'antd';
import FileUpload from '../../utils/FileUpload';
import axios from 'axios';
import { PRODUCT_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
// CORS 대책
axios.defaults.withCredentials = true;

const { TextArea } = Input;
const Continents = [
  {key:1, value: "Skin Care"},
  {key:2, value: "Eye Care"},
  {key:3, value: "Hair Care"},
  {key:4, value: "Others"},
  {key:5, value: "Supplement"},
  {key:6, value: "Men's"}
]

function UpdateProductPage(props) {  
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
  const [OldImages, setOldImages] = useState([]);

  // QueryString에서 상품아이디 취득
  const productId = props.match.params.productId;
  // 상품정보 취득
  useEffect(() => {
    // 다국적언어 설정
    setLanguage(localStorage.getItem("i18nextLng"));

    axios.get(`${PRODUCT_SERVER}/products_by_id?id=${productId}&type=single`)
      .then(response => {
        if (response.data.success) {
          setOldImages(response.data.product[0].images);
          setTitle(response.data.product[0].title);
          setEnglishTitle(response.data.product[0].englishTitle);
          setChineseTitle(response.data.product[0].chineseTitle);
          setDescription(response.data.product[0].description);
          setEnglishDescription(response.data.product[0].englishDescription);
          setChineseDescription(response.data.product[0].chineseDescription);
          setUsage(response.data.product[0].usage);
          setEnglishUsage(response.data.product[0].englishUsage);
          setChineseUsage(response.data.product[0].chineseUsage);
          setContents(response.data.product[0].sold);
          setPrice(response.data.product[0].price);
          setPoint(response.data.product[0].point);
          setContinent(response.data.product[0].continents);          
        } else {
          alert("Failed to get product information")
        }
      })
  }, [localStorage.getItem('i18nextLng')])

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
  // Submit
  const submitHandler = (event) => {
    event.preventDefault();

    // validation check
    if (Images.length < 1) return alert("Please select an image");
    if (!Title) return alert("Please enter a title");
    if (!EnglishTitle) return alert("Please enter a title(English)");
    if (!ChineseTitle) return alert("Please enter a title(Chinese)");
    if (!Description) return alert("Please enter a product description");
    if (!EnglishDescription) return alert("Please enter a product description(English)");
    if (!ChineseDescription) return alert("Please enter a product description(Chinese)");
    if (!Usage) return alert("Please enter a product usage");
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
    
    // 서버에 값들을 request로 보낸다
    const body = {
      id: productId,
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
      sold: Contents,
      price: Price,
      point: Point,
      images: Images,
      oldImages: OldImages,
      continents: Continent
    }

    axios.post(`${PRODUCT_SERVER}/update`, body)
      .then(response => {
        if (response.data.success) {
          alert('Product update was successful.');
          // Landing pageへ戻る
          props.history.push('/')
        } else {
          alert('Product update failed.');
        }
      });
  }

  // 다국어 설정
	const {t, i18n} = useTranslation();
  function setLanguage(lang) {
    i18n.changeLanguage(lang);
  }

  // Landing pageへ戻る
  const listHandler = () => {
    props.history.push('/')
  }

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1>{t('Product.updateTitle')}</h1>
      </div>

      <Form onSubmit={submitHandler}>
        {/* DropZone*/}
        <FileUpload refreshFunction={updateImages} />
        <br />
        <label style={{color: 'red'}}>Existing images will be deleted</label>
        <br />
        {OldImages.map((image, index) => (
          <img key={index} src={`${image}`} width="70" height="70" />
        ))}
        <br />
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.title')}</label>
        <Input onChange={titleHandler} value={Title} />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.englishTitle')}</label>
        <Input onChange={englishTitleHandler} value={EnglishTitle}/><br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.chineseTitle')}</label>
        <Input onChange={chineseTitleHandler} value={ChineseTitle}/>
        <br />
        <br />        
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.description')}</label>
        <TextArea onChange={descriptionHandler} value={Description}/>
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.englishDescription')}</label>
        <TextArea onChange={englishDescriptionHandler} value={EnglishDescription}/><br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.chineseDescription')}</label>
        <TextArea onChange={chineseDescriptionHandler} value={ChineseDescription}/>
        <br />
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.howToUse')}</label>
        <TextArea onChange={usageHandler} value={Usage}/>
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
          {Continents.map(item => (
            <option key={item.key} value={item.key}> {item.value} </option>
          ))}
        </select>
        <br />
        <br />
        <Button onClick={listHandler}>
          Product List
        </Button>&nbsp;&nbsp;&nbsp;
        <Button htmlType="submit" type="primary">
          Submit
        </Button>
      </Form>
    </div>
  )
}

export default UpdateProductPage