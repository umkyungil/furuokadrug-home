import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductImage from './Sections/ProductImage';
import ProductInfo from './Sections/ProductInfo';
import { Row, Col } from 'antd';
import { PRODUCT_SERVER } from '../../Config.js';
// CORS 대책
axios.defaults.withCredentials = true;

function DetailProductPage(props) {
  const productId = props.match.params.productId;
  const [Product, setProduct] = useState({});

  useEffect(() => {    
    axios.get(`${PRODUCT_SERVER}/products_by_id?id=${productId}&type=single`)
      .then(response => {
        if (response.data.success) {
          // Description Carriage return적용
          let tmpDesc1 = response.data.product[0].description;
          if (tmpDesc1) {
            let tmpDesc2 = tmpDesc1.split('\n').map((txt1, index1) => (
              <React.Fragment key={index1}>{txt1}<br /></React.Fragment>
            ))
            response.data.product[0].description = tmpDesc2;
          }

          // Usage Carriage return 적용
          let tmpUsage1 = response.data.product[0].usage;
          if (tmpUsage1) {
            let tmpUsage2 = tmpUsage1.split('\n').map((txt2, index2) => (
              <React.Fragment key={index2}>{txt2}<br /></React.Fragment>
            ))
            response.data.product[0].usage = tmpUsage2;
          }

          setProduct(response.data.product[0])

        } else {
          alert("Failed to get product information.")
        }
      })
  }, [])

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
