import React, { useState, useEffect, useContext } from 'react';
import { Button, Form, Input, Checkbox, Divider, Select  } from 'antd';
import FileUpload from '../../utils/FileUpload';
import { PRODUCT_SERVER } from '../../Config.js';
import { MAIN_CATEGORY, PRODUCT_VISIBLE_TYPE } from '../../utils/Const';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext';
import './Sections/product.css';
import { getLanguage } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

const { TextArea } = Input;;
const {Option} = Select;

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
  const [Continent, setContinent] = useState(1);
  const [Member, setMember] = useState(false);
  const [ExposureType, setExposureType] = useState([]);
  const [Images, setImages] = useState([]);  
  const [OldImages, setOldImages] = useState([]);

  const [UrlShow, setUrlShow] = useState(false);
  const [JapaneseUrl, setJapaneseUrl] = useState("");
  const [EnglishUrl, setEnglishUrl] = useState("");
  const [ChineseUrl, setChineseUrl] = useState("");
  // QueryString에서 상품아이디 취득
  const productId = props.match.params.productId;
  const {isLanguage, setIsLanguage} = useContext(LanguageContext);
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
    process();
  }, [])

  const process = async () => {
    await getProduct();
  }

  const getProduct = async () => {
    try {
      const product = await axios.get(`${PRODUCT_SERVER}/products_by_id?id=${productId}&type=single`);

      if (product.data.length > 0) {
        setOldImages(product.data[0].images);
        // 이미지는 수정안하고 다른 데이타만 업데이트할 경우는 
        // AWS에 이미지를 저장할 필요없고, 저장할때 유효성체크를 회피하기 위해서 Old Image를 Image에 넣는다
        // 이미지를 추가, 수정 또는 삭제할 경우는 fileUpload에서 추가된 이미지를 오버라이트 해 주기때문에 문제가 없다
        setImages(product.data[0].images);

        setJapaneseTitle(product.data[0].title);
        setEnglishTitle(product.data[0].englishTitle);
        setChineseTitle(product.data[0].chineseTitle);
        setJapaneseDescription(product.data[0].description);
        setEnglishDescription(product.data[0].englishDescription);
        setChineseDescription(product.data[0].chineseDescription);

        if (product.data[0].usage) setJapaneseUsage(product.data[0].usage);
        if (product.data[0].englishUsage) setEnglishUsage(product.data[0].englishUsage);
        if (product.data[0].chineseUsage) setChineseUsage(product.data[0].chineseUsage);
        
        setContents(product.data[0].contents);
        setPrice(product.data[0].price);
        setContinent(product.data[0].continents);
        setMember(product.data[0].member);
        setExposureType(product.data[0].exposureType);
        // 상품의 동영상이 있는지 확인
        if (product.data[0].japaneseUrl !== "") {
          setUrlShow(true);
          setJapaneseUrl(product.data[0].japaneseUrl);
          setEnglishUrl(product.data[0].englishUrl);
          setChineseUrl(product.data[0].chineseUrl);
        }
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
  const continentHandler = (event) => {
    setContinent(event);
  }
  const memberHandler = (event) => {
    setMember(event.target.checked);
  }
  const updateImages = (newImages) => {
    setImages(newImages);
  }
  // 상품노출 옵션
  const exposureHandler = (event) => {
    // now on sale 또는 recording이면 주소입력 항목을 보여준다
    let isExists = false;    
    for (let i=0; i<event.length; i++) {
      if (event[i] === PRODUCT_VISIBLE_TYPE[1].key || event[i] === PRODUCT_VISIBLE_TYPE[2].key) {
        isExists = true;
        break;
      } else {
        isExists = false;
      }
    }
    setUrlShow(isExists)
    if (event !== undefined) {
      setExposureType(event);
    }
  }
  const japaneseUrlHandler = (event) => {
    setJapaneseUrl(event.currentTarget.value);
  }
  const englishUrlHandler = (event) => {
    setEnglishUrl(event.currentTarget.value);
  }
  const chineseUrlHandler = (event) => {
    setChineseUrl(event.currentTarget.value);
  }

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
    if (Contents === "") {
      alert("Please enter the contents");
      return false;
    }
    if (!Number(Price)) {
      alert("Please enter only numbers for the price");
      return false;
    }
    if (Number(Price) <= 0) {
      alert("Please check the price");
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
    // now on sale 또는 recording이 선택되어 있으면 url은 필수항목이 된다
    if (UrlShow) {
      if (JapaneseUrl === "" || EnglishUrl === "" || ChineseUrl === "") {
        alert("URL is required");
        return false;
      }
    } else {
      // 주소를 전부 삭제함
      if (JapaneseUrl !== "") setJapaneseUrl("");
      if (EnglishUrl !== "") setEnglishUrl("");
      if (ChineseUrl !== "") setChineseUrl("");
    }

    // Now on sale 상품이 이미 등록되어 있는지 확인
    let isExists = false;
    if (isNowOnAir) {
      const body = {type: PRODUCT_VISIBLE_TYPE[1].key, id: localStorage.getItem("userId")};
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
      member: Member,
      price: Price,
      images: Images,
      continents: Continent,
      exposureType: ExposureType,
      japaneseUrl: JapaneseUrl,
      englishUrl: EnglishUrl,
      chineseUrl: ChineseUrl
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
      <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
        <h1>{t('Product.updateTitle')}</h1>
      </div>

      <Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} onSubmit={submitHandler}>
        {/* DropZone*/}
        <FileUpload refreshFunction={updateImages} oldImages={OldImages} />
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
        
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.japaneseDescription')}</label>
        <TextArea onChange={japaneseDescriptionHandler} value={JapaneseDescription}/>
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.englishDescription')}</label>
        <TextArea onChange={englishDescriptionHandler} value={EnglishDescription}/>
        <br />
        <label><span style={{color: 'red'}}>*&nbsp;</span>{t('Product.chineseDescription')}</label>
        <TextArea onChange={chineseDescriptionHandler} value={ChineseDescription}/>
        <br />
        <label>{t('Product.japaneseHowToUse')}</label>
        <TextArea onChange={japaneseUsageHandler} value={JapaneseUsage}/>
        <br />
        <label>{t('Product.englishHowToUse')}</label>
        <TextArea onChange={englishUsageHandler} value={EnglishUsage}/>
        <br />
        <label>{t('Product.chineseHowToUse')}</label>
        <TextArea onChange={chineseUsageHandler} value={ChineseUsage}/>
        <br />
        <br />
        <Form.Item required label={t('Product.contents')}>
          <Input type="text" value={Contents} style={{width: '100%'}} onChange={contentsHandler} />
        </Form.Item>
        <Form.Item required label={t('Product.price')}>
          <Input type="text" value={Price} style={{width: '100%'}} onChange={priceHandler} />
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

        <Form.Item label={t('Product.member')}>
          <Checkbox onChange={memberHandler} checked={Member}/>
        </Form.Item>

        <Divider orientation="left" plain="true">Screen exposure</Divider>
        <Form.Item label={t('Product.exposure')}>
          <Checkbox.Group options={options} value={ExposureType} onChange={exposureHandler} />
        </Form.Item>

        {UrlShow && 
          <>
            <Form.Item required label={t('Product.japaneseUrl')}>
              <Input type="text" value={JapaneseUrl} onChange={japaneseUrlHandler} />
            </Form.Item>
            <Form.Item required label={t('Product.chineseUrl')}>
              <Input type="text" value={ChineseUrl} onChange={chineseUrlHandler} />
            </Form.Item>
            <Form.Item required label={t('Product.englishUrl')}>
              <Input type="text" value={EnglishUrl} onChange={englishUrlHandler} />
            </Form.Item>
          </>
        }
        
        <br />
        <Button onClick={listHandler}>
          Landing Page
        </Button>
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