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
  {key:1, value: "皮肤护理"},
  {key:2, value: "眼睛护理"},
  {key:3, value: "头发护理"},
  {key:4, value: "其他"},
  {key:5, value: "补充"},
  {key:6, value: "男士的"}
]

function UpdateCnProductPage(props) {  
  const [Title, setTitle] = useState("");
  const [Description, setDescription] = useState("");
  const [Usage, setUsage] = useState("");
  const [Price, setPrice] = useState(0);
  const [Point, setPoint] = useState(0);
  const [Continent, setContinent] = useState(1);

  // QueryString에서 상품아이디 취득
  const productId = props.match.params.productId;
  // 상품정보 취득
  useEffect(() => {    
    axios.get(`${PRODUCT_SERVER}/products_by_id?id=${productId}&type=single`)
      .then(response => {
        if (response.data.success) {
          setTitle(response.data.product[0].title);
          setDescription(response.data.product[0].description);
          setUsage(response.data.product[0].usage);
          setPrice(response.data.product[0].price);
          setPoint(response.data.product[0].point)
          setContinent(response.data.product[0].continents);

          // 다국적언어 설정
		      setLanguage("cn");
        } else {
          alert("Failed to get product information")
        }
      })
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

  // Submit
  const submitHandler = (event) => {
    event.preventDefault();

    // validation check
    if (!Title) return alert("Please enter a title");
    if (!Description) return alert("Please enter a product description");
    if (!Usage) return alert("Please enter a product usage");
    if (Number(Price) < 0) return alert("Please check the price");
    if (Number(Point) < 0) return alert("Please check the point");

    // 숫자만 있는지 확인
    if (isNaN(Price)) {
      alert("Please enter only numbers for the price");
    }
    // 숫자확인
    if (isNaN(Point)) {
      alert("Please enter only numbers for point");
    }
    
    // 서버에 값들을 request로 보낸다
    const body = {
      id: productId,
      writer: props.user.userData._id,
      title: Title,
      description: Description,
      usage: Usage,
      price: Price,
      point: Point,
      continents: Continent
    }

    axios.post(`${PRODUCT_SERVER}/en/update`, body)
      .then(response => {
        if (response.data.success) {
          alert('Product update was successful.');
          // 상품상세 이동
          props.history.push('/')
        } else {
          alert('Product update failed.');
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
        <h1>{t('Product.updateTitle')}(Chinese)</h1>
      </div>
      <Form onSubmit={submitHandler}>
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.title')}</label>
        <Input onChange={titleChangeHandler} value={Title} />
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
        <Button htmlType="submit" type="primary">
          Submit
        </Button>
      </Form>
    </div>
  )
}

export default UpdateCnProductPage