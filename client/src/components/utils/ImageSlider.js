import React from 'react'
import { Carousel } from 'antd';

// Landing Page에서 이미지를 props로 받음
function ImageSlider(data) {
  return (
    <div>
      <Carousel autoplay> {/* autoplay: 자동으로 이미지 변환 */}
        {data.images.map((image, index) => (
          <div key={index}>
            <img style={{ width:'100%', maxHeight:'350px' }} src={`http://localhost:5000/${image}`} />            
          </div>
        ))}
			</Carousel>
    </div>
  )
}

export default ImageSlider
