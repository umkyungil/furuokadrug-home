import React, { useEffect, useState } from 'react';
import Dropzone from 'react-dropzone';
import { Icon } from 'antd';
import axios from 'axios';
import { PRODUCT_SERVER } from '../Config.js';
// CORS 대책
axios.defaults.withCredentials = true;

function FileUpload(props) {
  const [Images, setImages] = useState([]);

  useEffect(() => {
    // 업데이트인 경우 기존 이미지를 화면에 보여준다다
    setImages(props.oldImages)
  }, [props.oldImages])

  // 이미지 등록
  const dropHandler = (files) => {
    let formData = new FormData();
    const config = {
      header: { 'content-type': 'multipart/form-data' }
    }
    
    formData.append("file", files[0]);

    // AWS에서 이미지를 등록
    axios.post(`${PRODUCT_SERVER}/image`, formData, config)
    .then(response => {
      if (response.data.success) {
        setImages([...Images, response.data.filePath]);

        // 부모 컴포넌트에도 이미지 정보를 전달해서 저장할수 있게한다
        props.refreshFunction([...Images, response.data.filePath]);
      } else {
        alert('Failed to save file.');
      }
    })
  }

  // 이미지 삭제
  const deleteHandler = (image) => {
    // State에 들어있는 배열에서 해당되는 이미지를 삭제
    const currentIndex = Images.indexOf(image);
    let newImages = [...Images];
    newImages.splice(currentIndex, 1)
    setImages(newImages);

    // AWS S3에서 이미지를 삭제
    const body = {image: image}
    axios.post(`${PRODUCT_SERVER}/delete_image`, body)
      .then(response => {
        if (response.data.success) {
          console.log('Image delete was successful.');
        } else {
          console.log('Image delete failed.');
        }
      });

    // 부모 컴포넌트에도 이미지 정보를 전달해서 디비에서 삭제할수 있게 한다
    props.refreshFunction(newImages);
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
      <Dropzone onDrop={dropHandler}>
        {({getRootProps, getInputProps}) => (
          <div 
            style ={{ 
              width:300, height:240, border:'1px solid lightgray',
              display:'flex', alignItems:'center', justifyContent:'center'
            }} 
            {...getRootProps()}>
            <input {...getInputProps()} />
            <Icon type="plus" style={{ fontSize: '3rem' }} />
          </div>
        )}
      </Dropzone>
      
      {/* 이미지를 클릭해서 삭제할 경우 */}
      {/* <div style={{ display:'flex', width:'350px', height:'240px', overflowX:'scroll' }}> */}
      <div style={{ display:'flex', width:'350px', height:'240px' }}>
        {Images.map((image, index) => (
          <div onClick={() => deleteHandler(image)} key={index}>
            <img style={{ minWidth:'300px', width:'300px', height:'240px' }} src={image}/>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FileUpload;
