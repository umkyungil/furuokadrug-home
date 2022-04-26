import React, { useEffect, useState } from 'react';
import ImageGallery from 'react-image-gallery';

function ProductImage(props) {
  const [Images, setImages]  = useState([])

  useEffect(() => {
    if (props.detail.images && props.detail.images.length > 0) {
      let images = []
      // item 이미지의 주소는 AWS 버킷의 주소
      props.detail.images.map(item => {
        images.push({
          original: `${item}`,
          // thumbnail: `${item}`
        })
      })
      setImages(images);
    }
  }, [props.detail]) // props.detail의 값이 바뀔때마다 랜더링을 한다

  return (
    <div style={{ width:'70%'}}>
      <ImageGallery items={Images} />
    </div>
  )
}

export default ProductImage