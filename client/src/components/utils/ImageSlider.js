import React from 'react'
import { Carousel } from 'antd';
//import { PROD_URL_5000 } from '../Config.js';

// Landing Page에서 이미지를 props로 받음
function ImageSlider(props) {
  return (
    <div>
      <Carousel autoplay> {/* autoplay: 자동으로 이미지 변환 */}
        {props.images.map((image, index) => (
          <div key={index}>
            /<img style={{ width:'100%', maxHeight:'320px' }} src={`http://localhost:5000/${image}`} />
            {/* <img style={{ width:'100%', maxHeight:'320px' }} src={`${PROD_URL_5000}/${image}`} /> */}
          </div>
        ))}
			</Carousel>
    </div>
  )
}

export default ImageSlider
