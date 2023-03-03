import React, { useState, useEffect, useContext } from 'react';
import { Button, Form, Input, Checkbox, Divider, Select  } from 'antd';
import FileUpload from '../../utils/FileUpload';
import { PRODUCT_SERVER } from '../../Config.js';
import { MAIN_CATEGORY, PRODUCT_VISIBLE_TYPE } from '../../utils/Const';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext';
import axios from 'axios';
// CORS 대책
axios.defaults.withCredentials = true;

const { TextArea } = Input;;
const {Option} = Select;
let defaultArray = [];

function ProductUpdatePage(props) {
  const [JapaneseTitle, setJapaneseTitle] = useState("");
  const [EnglishTitle, setEnglishTitle] = useState("");
  const [ChineseTitle, setChineseTitle] = useState("");
  const [JapaneseDescription, setJapaneseDescription] = useState("");
  const [EnglishDescription, setEnglishDescription] = useState("");
  const [ChineseDescription, setChineseDescription] = useState("");
  const [JapaneseUsage, setJapaneseUsage] = useState("");
  const [EnglishUsage, setEnglishUsage] = useState("");
  const [ChineseUsage, setChineseUsage] = useState("");
  const [Contents, setContents] = useState("");
  const [Price, setPrice] = useState(0);
  const [Point, setPoint] = useState(0);
  const [Continent, setContinent] = useState(1);
  const [ExposureType, setExposureType] = useState([]);
  const [Images, setImages] = useState([]);
  const [OldImages, setOldImages] = useState([]);
  // QueryString에서 상품아이디 취득
  const productId = props.match.params.productId;
  const { isLanguage } = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  let options = [];
  PRODUCT_VISIBLE_TYPE.map(item => {
    if (item.key !== 0) {
      const object = {};
      object.label = item.value;
      object.value = item.key;
      return options.push(object);
    }
  });

  // 상품정보 취득
  useEffect(() => {
    // 다국적언어 설정
    i18n.changeLanguage(isLanguage);
    // 상품가져오기
    getProduct();
  }, [])

  const getProduct = async () => {
    try {
      const product = await axios.get(`${PRODUCT_SERVER}/products_by_id?id=${productId}&type=single`);

      if (product.data.length > 0) {
        setOldImages(product.data[0].images);
        setJapaneseTitle(product.data[0].title);
        setEnglishTitle(product.data[0].englishTitle);
        setChineseTitle(product.data[0].chineseTitle);
        setJapaneseDescription(product.data[0].description);
        setEnglishDescription(product.data[0].englishDescription);
        setChineseDescription(product.data[0].chineseDescription);
        setJapaneseUsage(product.data[0].usage);
        setEnglishUsage(product.data[0].englishUsage);
        setChineseUsage(product.data[0].chineseUsage);
        setContents(product.data[0].contents);
        setPrice(product.data[0].price);
        setPoint(product.data[0].point);
        setContinent(product.data[0].continents);
        setExposureType(product.data[0].exposureType);
      } else {
        alert("Please contact the administrator")
      }
    } catch (err) {
      console.log("err: ",err);
      alert("Please contact the administrator");
    }
  }

  const japaneseTitleHandler = (event) => {
    setJapaneseTitle(event.currentTarget.value);
  }
  const englishTitleHandler = (event) => {
    setEnglishTitle(event.currentTarget.value);
  }
  const chineseTitleHandler = (event) => {
    setChineseTitle(event.currentTarget.value);
  }
  const japaneseDescriptionHandler = (event) => {
    setJapaneseDescription(event.currentTarget.value);
  }
  const englishDescriptionHandler = (event) => {
    setEnglishDescription(event.currentTarget.value);
  }
  const chineseDescriptionHandler = (event) => {
    setChineseDescription(event.currentTarget.value);
  }  
  const japaneseUsageHandler = (event) => {
    setJapaneseUsage(event.currentTarget.value);
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
    setContinent(event);
  }
  const updateImages = (newImages) => {
    setImages(newImages);
  }
  // 상품노출 옵션
  const exposureHandler = (event) => {
    setExposureType(event);
  };

  // Submit
  const submitHandler = async (event) => {
    event.preventDefault();

    // 유효성 체크
    if (Images.length < 1) {
      alert("Please select an image");
      return false; 
    }
    if (JapaneseTitle === "") {
      alert("Please enter Japanese title");
      return false;
    }
    if (EnglishTitle === "") {
      alert("Please enter an English title");
      return false;
    }
    if (ChineseTitle === "") {
      alert("Please enter Chinese title");
      return false;
    }
    if (JapaneseDescription === "") {
      alert("Please enter a Japanese product description");
      return false;
    }
    if (EnglishDescription === "") {
      alert("Please enter an English product description");
      return false;
    }
    if (ChineseDescription === "") {
      alert("Please enter a Chinese product description");
      return false;
    }
    if (JapaneseUsage === "") {
      alert("Please enter how to use Japanese");
      return false;
    }
    if (EnglishUsage === "") {
      alert("Please enter how to use English");
      return false;
    }
    if (ChineseUsage === "") {
      alert("Please enter how to use Chinese");
      return false;
    }
    if (Contents === "") {
      alert("Please enter the capacity");
      return false;
    }
    if (!Number(Price)) {
      alert("Please enter only numbers for the price");
      return false;
    }
    if (!Number(Point)) {
      alert("Please enter only numbers for the point");
      return false;
    }
    if (Number(Price) <= 0) {
      alert("Please check the price");
      return false;
    }
    if (Number(Point) <= 0) {
      alert("Please check the point");
      return false;
    }

    // Now on sale이 선택됐는지
    let isNowOnAir = false;
    ExposureType.map(item => {
      if (item === PRODUCT_VISIBLE_TYPE[1].key) {
        isNowOnAir = true;
      }
    });
    // Recording이 선택됐는지
    let isRecording = false;
    ExposureType.map(item => {
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
          products.data.productInfos.map((product) => {
            if (productId !== product._id) {
              isExists = true;
            }
          });
        }
      })
    }
    // Now on sale 상품이 이미 등록되어 있는경우
    if (isExists) {
      alert("Product is already registered");
      return false;
    }
    
    const body = {
      id: productId,
      writer: props.user.userData._id,
      title: JapaneseTitle,
      englishTitle: EnglishTitle,
      chineseTitle: ChineseTitle,
      description: JapaneseDescription,
      englishDescription: EnglishDescription,
      chineseDescription: ChineseDescription,
      usage: JapaneseUsage,
      englishUsage: EnglishUsage,
      chineseUsage: ChineseUsage,
      contents: Contents,
      price: Price,
      point: Point,
      images: Images,
      oldImages: OldImages,
      continents: Continent,
      exposureType: ExposureType
    }

    const result = await axios.post(`${PRODUCT_SERVER}/update`, body);
    if (result.data.success) {
      alert('Product update was successful');
      // Landing pageへ戻る
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
        <h1>{t('Product.updateTitle')}</h1>
      </div>

      <Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} onSubmit={submitHandler}>
        {/* DropZone*/}
        <FileUpload refreshFunction={updateImages} />
        <br />
        <label style={{color: 'red'}}>{t('Product.imageMessage')}</label>
        <br />
        {OldImages.map((image, index) => (
          <img key={index} src={`${image}`} width="70" height="70" />
        ))}
        <br />
        <br />
        <Form.Item required label={t('Product.japaneseTitle')}>
          <Input type="text" value={JapaneseTitle} style={{width: '100%'}} onChange={japaneseTitleHandler} />
        </Form.Item>
        <Form.Item required label={t('Product.englishTitle')}>
          <Input type="text" value={EnglishTitle} style={{width: '100%'}} onChange={englishTitleHandler} />
        </Form.Item>
        <Form.Item required label={t('Product.chineseTitle')}>
          <Input type="text" value={ChineseTitle} style={{width: '100%'}} onChange={chineseTitleHandler} />
        </Form.Item>
        
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.description')}</label>
        <TextArea onChange={japaneseDescriptionHandler} value={JapaneseDescription}/>
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.englishDescription')}</label>
        <TextArea onChange={englishDescriptionHandler} value={EnglishDescription}/>
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.chineseDescription')}</label>
        <TextArea onChange={chineseDescriptionHandler} value={ChineseDescription}/>
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.howToUse')}</label>
        <TextArea onChange={japaneseUsageHandler} value={JapaneseUsage}/>
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.englishHowToUse')}</label>
        <TextArea onChange={englishUsageHandler} value={EnglishUsage}/>
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.chineseHowToUse')}</label>
        <TextArea onChange={chineseUsageHandler} value={ChineseUsage}/>
        <br />
        <br />
        <Form.Item required label={t('Product.contents')}>
          <Input type="text" value={Contents} style={{width: '100%'}} onChange={contentsHandler} />
        </Form.Item>
        <Form.Item required label={t('Product.price')}>
          <Input type="text" value={Price} style={{width: '100%'}} onChange={priceHandler} />
        </Form.Item>
        <Form.Item required label={t('Product.point')}>
          <Input type="text" value={Point} style={{width: '100%'}} onChange={pointHandler} />
        </Form.Item>
        <Form.Item required label={t('Product.itemSelection')}>
          <Select value={Continent} style={{ width: 120 }} onChange={continentHandler}>
            {MAIN_CATEGORY.map(item => {
              // 카테고리에서 All제외
              if (item.key !== 0) {
                return (<Option key={item.key} value={item.key}> {item.value} </Option>);
              }
            })}
            </Select>
        </Form.Item>

        <Divider />
        
        <Form.Item label={t('Product.exposure')}>
          {ExposureType.map(item => {
            defaultArray.push(item);
          })}
            
          <Checkbox.Group options={options} defaultValue={defaultArray} onChange={exposureHandler} />
        </Form.Item>
        
        <br />
        <br />
        <br />
        <Button onClick={listHandler}>
          Landing Page
        </Button>&nbsp;&nbsp;&nbsp;
        <Button htmlType="submit" type="primary">
          Submit
        </Button>
        <br />
        <br />
        <br />
        <br />
        <br />
      </Form>
    </div>
  )
}

export default ProductUpdatePage;