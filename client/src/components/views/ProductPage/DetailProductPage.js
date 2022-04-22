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
        if (response.data.success) {
          // 다국적언어에 따라 화면에 표시되는 언어를 설정(타이틀,상세,사용방법)
          if (localStorage.getItem('i18nextLng') === "en") {
            response.data.product[0].title = response.data.product[0].englishTitle  

            let tmpEnDesc = response.data.product[0].englishDescription;
            if (tmpEnDesc) {              
              response.data.product[0].description = convert(tmpEnDesc);
            }

            let tmpEnUsage = response.data.product[0].englishUsage;
            if (tmpEnUsage) {
              response.data.product[0].usage = convert(tmpEnUsage);
            }
          } else if (localStorage.getItem('i18nextLng') === "cn") {
            response.data.product[0].title = response.data.product[0].chineseTitle  

            let tmpCnDesc = response.data.product[0].chineseDescription;
            if (tmpCnDesc) {              
              response.data.product[0].description = convert(tmpCnDesc);
            }

            let tmpCnUsage = response.data.product[0].chineseUsage;
            if (tmpCnUsage) {
              response.data.product[0].usage = convert(tmpCnDesc);
            }       
          } else {
            let tmpJpDesc = response.data.product[0].description;
            if (tmpJpDesc) {
              response.data.product[0].description = convert(tmpJpDesc);
            }

            let tmpJpUsage = response.data.product[0].usage;
            if (tmpJpUsage) {
              response.data.product[0].usage = convert(tmpJpUsage);
            }
          }  
          
          setProduct(response.data.product[0])

        } else {
          alert("Failed to get product information.")
        }
      })
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
    <div style={{ width:'90%', padding:'3rem 4rem' }}>
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
