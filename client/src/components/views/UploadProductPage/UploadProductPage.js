import React, { useState } from 'react'
import { Button, Form, Input } from 'antd';
import FileUpload from '../../utils/FileUpload';
import Axios from 'axios';

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
  const [Price, setPrice] = useState(0);
  const [Continent, setContinent] = useState(1);
  const [Images, setImages] = useState([]);

  const titleChangeHandler = (event) => {
    setTitle(event.currentTarget.value);
  }

  const descriptionChangeHandler = (event) => {
    setDescription(event.currentTarget.value);
  }

  const priceChangeHandler = (event) => {
    setPrice(event.currentTarget.value);
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
    if (!Title || !Description || !Price || !Continent || !Images) {
      return alert("Calculate all values.") // 모든 값을 넣어주셔야 합니다.
    }

    // 서버에 채운 값들을 request로 보낸다

    const body = {
      writer: props.user.userData._id,
      title: Title,
      description: Description,
      price: Price,
      images: Images,
      continents: Continent
    }

    Axios.post('/api/product', body)
      .then(response => {
        if (response.data.success) {
          alert('Product upload was successful.'); // 상품 업로드에 성공했습니다.
          props.history.push('/')
        } else {
          alert('Product upload failed.'); // 상품 업로드에 실패했습니다.
        }
      });
  }

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2>Upload Product</h2>
      </div>

      <Form onSubmit={submitHandler}>
        {/* DropZone*/}
        <FileUpload refreshFunction={updateImages} />

        <br />
        <br />
        <label>Title</label>
        <Input onChange={titleChangeHandler} value={Title}/>
        <br />
        <br />
        <label>Description</label>
        <TextArea onChange={descriptionChangeHandler} value={Description}/>
        <br />
        <br />
        <label>Price($)</label>
        <Input onChange={priceChangeHandler} value={Price}/>
        <br />
        <br />
        <select onChange={continentChangeHandler} value={Continent}>
          {Continents.map(item => (
            <option key={item.key} value={item.key}> {item.value} </option>
          ))}
        </select>
        <br />
        <br />
        <Button htmlType="submit">
          Submit
        </Button>
      </Form>
    </div>
  )
}

export default UploadProductPage
