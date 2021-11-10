import React from 'react';
import Dropzone from 'react-dropzone';
import { Icon } from 'antd';
import axios from 'axios';
import { response } from 'express';

function FileUpload() {

  const dropHandler = (files) => {

    console.log("files>>>>", files);

    let formData = new FormData();
    const config = {
      header: { 'content-type': 'multipart/form-data' }
    }
    formData.append("file", files[0]);

    axios.post('/api/product/image', formData, config)
    .then(response => {
      if (response.data.success) {
        alert(' 파일 저장하는데 성공 했습니다. ');
      } else {
        alert(' 파일 저장하는데 실패 했습니다. ');
      }
    })

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
    </div>
  )
}

export default FileUpload
