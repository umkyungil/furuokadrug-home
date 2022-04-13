import React, { useState, useEffect } from 'react';
import { Button, Form, Input } from 'antd';
import FileUpload from '../../utils/FileUpload';
import axios from 'axios';
import { PRODUCT_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
// CORS 대책
axios.defaults.withCredentials = true;

//const { Title } = Typography;
const { TextArea } = Input;
const Continents = [
  {key:1, value: "Skin Care"},
  {key:2, value: "Eye Care"},
  {key:3, value: "Hair Care"},
  {key:4, value: "Others"},
  {key:5, value: "Supplement"},
  {key:6, value: "Men's"}
]

function UploadProductPage(props) {
  const [Title, setTitle] = useState("");
  const [Description, setDescription] = useState("");
  const [Usage, setUsage] = useState("");
  const [Price, setPrice] = useState(0);
  const [Point, setPoint] = useState(0);
  const [Continent, setContinent] = useState(1);
  const [Images, setImages] = useState([]);

  useEffect(() => {
    // 다국적언어 설정
		setLanguage(localStorage.getItem("i18nextLng"));
	}, [])

  const titleChangeHandler = (event) => {
    setTitle(event.currentTarget.value);
  }
  const descriptionChangeHandler = (event) => {
    setDescription(event.currentTarget.value);
  }  
  const usageChangeHandler = (event) => {
    setUsage(event.currentTarget.value);
  }
  const priceChangeHandler = (event) => {
    setPrice(event.currentTarget.value);
  }
  const pointChangeHandler = (event) => {
    setPoint(event.currentTarget.value);
  }
  const continentChangeHandler = (event) => {
    setContinent(event.currentTarget.value);
  }
  const updateImages = (newImages) => {
    setImages(newImages);
  }
  const submitHandler = (event) => {
    event.preventDefault();

    // validation check
    if (!Title) return alert("Please enter a title");
    if (!Description) return alert("Please enter a product description");
    if (!Usage) return alert("Please enter a product usage");
    if (Number(Price) < 0) return alert("Please check the price");
    if (Images.length < 1) return alert("Please select an image");
    if (Number(Point) < 0) return alert("Please check the point");

    // 숫자만 있는지 확인
    if (isNaN(Price)) {
      alert("Please enter only numbers for the price");
    }
    // 숫자확인
    if (isNaN(Point)) {
      alert("Please enter only numbers for point");
    }

    // 서버에 채운 값들을 request로 보낸다
    const body = {
      writer: props.user.userData._id,
      title: Title,
      description: Description,
      usage: Usage,
      price: Price,
      point: Point,
      images: Images,
      continents: Continent
    }

    axios.post(`${PRODUCT_SERVER}`, body)
      .then(response => {
        if (response.data.success) {
          alert('Product upload was successful.'); // 상품 업로드에 성공했습니다.
          props.history.push('/')
        } else {
          alert('Product upload failed.'); // 상품 업로드에 실패했습니다.
        }
      });
  }

  // 다국적언어 설정
	const {t, i18n} = useTranslation();
  function setLanguage(lang) {
    i18n.changeLanguage(lang);
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
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.title')}</label>
        <Input onChange={titleChangeHandler} value={Title}/>
        <br />
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.description')}</label>
        <TextArea onChange={descriptionChangeHandler} value={Description}/>
        <br />
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.howToUse')}</label>
        <TextArea onChange={usageChangeHandler} value={Usage}/>
        <br />
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.price')}(¥)</label>
        <Input onChange={priceChangeHandler} value={Price}/>
        <br />
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.point')}</label>
        <Input onChange={pointChangeHandler} value={Point}/>
        <br />
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.itemSelection')}</label>
        <br />
        <select onChange={continentChangeHandler} value={Continent}>
          {Continents.map(item => (
            <option key={item.key} value={item.key}> {item.value} </option>
          ))}
        </select>
        <br />
        <br />
        <br />
        <Button htmlType="submit" type="primary">
          Submit
        </Button>
      </Form>
    </div>
  )
}

export default UploadProductPage