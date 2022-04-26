import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductImage from './Sections/ProductImage';
import ProductInfo from './Sections/ProductInfo';
import { Row, Col } from 'antd';
import { PRODUCT_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
// CORS 대책
axios.defaults.withCredentials = true;

// 상품상세
function DetailProductPage(props) {
  const productId = props.match.params.productId;
  const [Product, setProduct] = useState({});
  const [I18nLanguage, setI18nLanguage] = useState("");

  useEffect(() => {
    // 다국어 설정
    setLanguage(localStorage.getItem("i18nextLng"));

    axios.get(`${PRODUCT_SERVER}/products_by_id?id=${productId}&type=single`)
      .then(response => {
        // DB에서 가지고온 데이터를 설정된 다국적언어에 맞게 셋팅
        if (localStorage.getItem('i18nextLng') === "en") {
          // 타이틀
          response.data[0].title = response.data[0].englishTitle;
          // 설명
          let tmpEnDesc = response.data[0].englishDescription;
          if (tmpEnDesc) {              
            response.data[0].description = convert(tmpEnDesc);
          }
          // 사용법
          let tmpEnUsage = response.data[0].englishUsage;
          if (tmpEnUsage) {
            response.data[0].usage = convert(tmpEnUsage);
          }
        } else if (localStorage.getItem('i18nextLng') === "cn") {
          response.data[0].title = response.data[0].chineseTitle  
          let tmpCnDesc = response.data[0].chineseDescription;
          if (tmpCnDesc) {              
            response.data[0].description = convert(tmpCnDesc);
          }
          let tmpCnUsage = response.data[0].chineseUsage;
          if (tmpCnUsage) {
            response.data.usage = convert(tmpCnDesc);
          }       
        } else {
          let tmpJpDesc = response.data[0].description;
          if (tmpJpDesc) {
            response.data[0].description = convert(tmpJpDesc);
          }
          let tmpJpUsage = response.data[0].usage;
          if (tmpJpUsage) {
            response.data[0].usage = convert(tmpJpUsage);
          }
        }  
        // DB에서 가져온 상품정보를 State에 설정
        setProduct(response.data[0])
      })
      .catch(err => alert("Failed to get product information."))
  }, [localStorage.getItem('i18nextLng')])

  // 다국어 설정
	const {t, i18n} = useTranslation();
  function setLanguage(lang) {
    i18n.changeLanguage(lang);
    setI18nLanguage(lang);
  }

  function convert(value) {
    let tmpResult = value.split('\n').map((txt1, index1) => (
      <React.Fragment key={index1}>{txt1}<br /></React.Fragment>
    ))  
    return tmpResult;
  }

  return (
    // <div style={{ width:'90%', padding:'3rem 4rem' }}>
    <div style={{ width:'100%', padding:'3rem 4rem' }}>
      <div style={{ display:'flex', justifyContent:'center' }}>
        <h1>{Product.title}</h1>
      </div>
      <br />
      
      {/* 여백설정 */}
      <Row gutter={[16, 16]}>
        <Col lg={12} sm={24}>
          {/* ProductImage */}
          <ProductImage detail={Product} /> 
        </Col>
        <Col lg={12} sm={24}  >
          {/* ProductInfo */}
          <ProductInfo detail={Product} />
        </Col>
      </Row>
    </div>
  )
}

export default DetailProductPage
