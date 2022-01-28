import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductImage from './Sections/ProductImage';
import ProductInfo from './Sections/ProductInfo';
import { Row, Col, Divider } from 'antd';
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
          let str = response.data.product[0].description;
          let res = str.split('\n').map((txt, index) => (
             <React.Fragment key={index}>{txt}<br /></React.Fragment>
          ))
          response.data.product[0].description = res;

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
