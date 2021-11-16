import React, { useState } from 'react';
import Dropzone from 'react-dropzone';
import { Icon } from 'antd';
import axios from 'axios';

function FileUpload(props) {

  const [Images, setImages] = useState([]);

  // 이미지 등록
  const dropHandler = (files) => {
    console.log("업로드 하기위해 선택한 파일정보>>>>>", files);

    let formData = new FormData();
    const config = {
      header: { 'content-type': 'multipart/form-data' }
    }

    formData.append("file", files[0]);

    axios.post('/api/product/image', formData, config)
    .then(response => {
      if (response.data.success) {
        setImages([...Images, response.data.filePath]);

        // 이미지에 대한 상태 변경이 있을때 부모 컴포넌트에도 이미지 정보를 전달
        props.refreshFunction([...Images, response.data.filePath]);
      } else {
        alert('Failed to save file.'); // 파일 저장하는데 실패 했습니다. 
      }
    })

  }

  // 이미지 삭제
  const deleteHandler = (image) => {
    const currentIndex = Images.indexOf(image);
    let newImages = [...Images];
    newImages.splice(currentIndex, 1)
    setImages(newImages);

    // 이미지에 대한 상태 변경이 있을때 부모 컴포넌트에도 이미지 정보를 전달
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
      <div style={{ display:'flex', width:'350px', height:'240px' }}>
        {Images.map((image, index) => (
          <div onClick={() => deleteHandler(image)} key={index}>
            <img style={{ minWidth:'300px', width:'300px', height:'240px' }} src={`http://localhost:5000/${image}`}/>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FileUpload
