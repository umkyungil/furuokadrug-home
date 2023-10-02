import React, { useEffect, useState, useContext } from 'react';
import ProductImage from './Sections/ProductImage';
import ProductInfo from './Sections/ProductInfo';
import { Row, Col } from 'antd';
import { PRODUCT_SERVER } from '../../Config.js';
import { useTranslation } from 'react-i18next';
import { I18N_ENGLISH, I18N_CHINESE } from '../../utils/Const';
import { LanguageContext } from '../../context/LanguageContext';
import './Sections/product.css';
import { getLanguage, setHtmlLangProps } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

// 상품상세
function ProductDetailPage(props) {
  const productId = props.match.params.productId;
  const [Product, setProduct] = useState({});
  const {isLanguage, setIsLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  useEffect(() => {
    // 다국어 설정
    const lang = getLanguage(isLanguage);
    i18n.changeLanguage(lang);
    setIsLanguage(lang);

    // HTML lang속성 변경
    setHtmlLangProps(lang);
    
    // 상품정보 가져오기
    getProduct();
  }, [isLanguage])

  

  const getProduct = async () => {
    try {
      // 상품정보 가져오기
      const product = await axios.get(`${PRODUCT_SERVER}/products_by_id?id=${productId}&type=single`);

      // 해당 언어에 맞게 문자열 변형(개행등의 문자를 그대로 보여주기 위한 처리)
      if (isLanguage === I18N_ENGLISH) {
        product.data[0].title = product.data[0].englishTitle;
        let tmpEnDesc = product.data[0].englishDescription;
        if (tmpEnDesc) {              
          product.data[0].description = convert(tmpEnDesc);
        } 
        let tmpEnUsage = product.data[0].englishUsage;
        if (tmpEnUsage) {
          product.data[0].usage = convert(tmpEnUsage);
        }
      } else if (isLanguage === I18N_CHINESE) {
        product.data[0].title = product.data[0].chineseTitle  
        let tmpCnDesc = product.data[0].chineseDescription;
        if (tmpCnDesc) {              
          product.data[0].description = convert(tmpCnDesc);
        }
        let tmpCnUsage = product.data[0].chineseUsage;
        if (tmpCnUsage) {
          product.data[0].usage = convert(tmpCnDesc);
        }       
      } else {
        let tmpJpDesc = product.data[0].description;
        if (tmpJpDesc) {
          product.data[0].description = convert(tmpJpDesc);
        }
        let tmpJpUsage = product.data[0].usage;
        if (tmpJpUsage) {
          product.data[0].usage = convert(tmpJpUsage);
        }
      }
      
      setProduct(product.data[0]);
    } catch (err) {
      console.log("err: ", err);
    }
  }

  // 개행등의 문자열을 그대로 표시하기 위한 처리
  function convert(value) {
    let tmpResult = value.split('\n').map((txt1, index1) => (
      <React.Fragment key={index1}>{txt1}<br /></React.Fragment>
    ))  
    return tmpResult;
  }

  return (
    <div style={{ width:'100%', padding:'3rem 4rem' }}>
      <div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} style={{ textAlign: 'center', paddingTop: '38px' }}>
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

export default ProductDetailPage;