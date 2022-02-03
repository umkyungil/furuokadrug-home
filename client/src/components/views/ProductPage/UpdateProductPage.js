import React, { useState, useEffect } from 'react';
import { Button, Form, Input } from 'antd';
import FileUpload from '../../utils/FileUpload';
import axios from 'axios';
import { PRODUCT_SERVER } from '../../Config.js';
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
  const [Description, setDescription] = useState("");
  const [Usage, setUsage] = useState("");
  const [Price, setPrice] = useState(0);
  const [Point, setPoint] = useState(0);
  const [Continent, setContinent] = useState(1);
  const [Images, setImages] = useState([]);
  const [OldImages, setOldImages] = useState([]);

  // QueryString에서 상품아이디 취득
  const productId = props.match.params.productId;
  // 상품정보 취득
  useEffect(() => {    
    axios.get(`${PRODUCT_SERVER}/products_by_id?id=${productId}&type=single`)
      .then(response => {
        if (response.data.success) {
          setOldImages(response.data.product[0].images);
          setTitle(response.data.product[0].title);
          setDescription(response.data.product[0].description);
          setUsage(response.data.product[0].usage);
          setPrice(response.data.product[0].price);
          setPoint(response.data.product[0].point)
          setContinent(response.data.product[0].continents);
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
  const updateImages = (newImages) => {
    setImages(newImages);
  }
  // Submit
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
    
    // 서버에 값들을 request로 보낸다
    const body = {
      id: productId,
      writer: props.user.userData._id,
      title: Title,
      description: Description,
      usage: Usage,
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
          // 상품상세 이동
          props.history.push('/')
        } else {
          alert('Product update failed.');
        }
      });
  }

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2>Update Product</h2>
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
        <label><span style={{color: 'red'}}>*&nbsp;</span>Title</label>
        <Input onChange={titleChangeHandler} value={Title} />
        <br />
        <br />        
        <label><span style={{color: 'red'}}>*&nbsp;</span>Description</label>
        <TextArea onChange={descriptionChangeHandler} value={Description}/>
        <br />
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>Usage</label>
        <TextArea onChange={usageChangeHandler} value={Usage}/>
        <br />
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>Price($)</label>
        <Input onChange={priceChangeHandler} value={Price}/>
        <br />
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>Point</label>
        <Input onChange={pointChangeHandler} value={Point}/>
        <br />
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>Item Selection</label>
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

export default UpdateProductPage