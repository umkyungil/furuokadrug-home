import React, {useState} from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { Button } from 'antd';
import { PRODUCT_SERVER } from '../../Config.js';
// CORS 대책
axios.defaults.withCredentials = true;

function ProductUploadCsvPage() {
  const [CsvData, setCsvData] = useState([]);
  const [FileName, setFileName] = useState("File Name");
  const history = useHistory();
  const DELIMITER = ',';
  const APOSTROPHE = '"';

  // CSV파일 선택 & 읽기
  const csvUploadHandler = (csvObject) => {
    let file = csvObject.target.files[0];
    setFileName(file.name);

    let fileReader = new FileReader();
    if(file === undefined) return;
    fileReader.readAsText(file, "SJIS");
    
    fileReader.onload = function () {
      parsingCsv(fileReader.result);
    };
  }

  // CSV파일로 객체 생성
  const parsingCsv = (file) => {    
    // 개행으로 레코드를 나누어서 배열에 저장(타이틀 포함)
    let sptLine = file.split(/\r\n|\n/);
    if (sptLine.length < 1) {
      alert("There is a problem with the selected file.")
    }
    // 참고: 상품디비의 sold는 등록안하고 기본값이 0으로 상품을 구매할때 카운트 증가시킨다
    // writer도 이 메소드 내에서 직접 추가한다 
    let header = ['writer','title','chineseTitle','englishTitle','description','chineseDescription', 'englishDescription',
                  'usage','chineseUsage','englishUsage','price', 'images','contents','sold','continents','point', 'member', 
                  'exposureType', 'japaneseUrl', 'englishUrl', 'chineseUrl'];

    let body = [];
    for(let i = 0; i < sptLine.length; i++) {
      // 파일 내용을 배열로 정리(1번째는 타이틀 Skip)	
      if (i === 0) {
        continue;
      }
      // 행에 데이타가 없는경우
      if (sptLine[i] === "") continue;
      
      
      // 1행의 레코드를 콤마 구분자로 나누어서 배열에 저장
      let spt = mySplit(sptLine[i], DELIMITER, APOSTROPHE);

      // 헤더와 컬럼의 수가 맞는지 체크(컬럼의 값이 없더라도 콤마로 구분했는지 확인,)
      if (spt.length !== header.length) {
        alert(`Please check the data of line ${i}`);
        return false;
      }

      // DB의 데이타 형으로 변환
      let obj_data = new Object();
      for (let j = 0; j < spt.length; j++ ) {
        // price: integer변형
        if (j === 10) {
          obj_data[header[j]] = parseInt(spt[j]);
        // images: 이미지 배열을 저장
        } else if (j === 11) {
          let arrImages = spt[j].split(',');
          obj_data[header[j]] = arrImages;
        // sold: integer변형
        } else if (j === 13) {
          obj_data[header[j]] = parseInt(spt[j]);
        // continents(카테고리): integer변형
        } else if (j === 14) {
          obj_data[header[j]] = parseInt(spt[j]);
        // point: 0 고정
        } else if (j === 15) {
          obj_data[header[j]] = 0;
        // member ㄹ민ㄷ 고정
        } else if (j === 16) {
          obj_data[header[j]] = false;
        } else {
          obj_data[header[j]] = spt[j]
        }
      }
      
      body.push(obj_data);
    }
    
    console.log("body>>>>>>>>>>>>>>>>: ", body);
    setCsvData(body);
  }

  // CSV 등록
  const registerHandler = async () => {
    // 필수 항목 검사
    for (let i = 0; i < CsvData.length; i++) {
      if (CsvData[i].title && CsvData[i].englishTitle && CsvData[i].chineseTitle) {
        alert(`Please enter the product title in line ${i}`)
        return false;
      }
      if (CsvData[i].description && CsvData[i].englishDescription && CsvData[i].chineseDescription) {
        alert(`Please enter the product description in line ${i}`)
        return false;
      }
      if (CsvData[i].contents) {
        alert(`Please enter the product contents in line ${i}`)
        return false;
      }
      if (CsvData[i].continents) {
        alert(`Please enter the product category in line ${i}`)
        return false;
      }
      if (CsvData[i].exposureType.length < 1) {
        alert(`Please enter the product exposureType in line ${i}`)
        return false;
      }
      if (CsvData[i].images.length < 1) {
        alert(`Please enter the product images in line ${i}`)
        return false;
      }
      // 상품 구매시 부여할 포인트
      if (CsvData[i].point < 0) {
        alert(`Please enter the product point in line ${i}`)
        return false;
      }
      if (CsvData[i].price < 1) {
        alert(`Please enter the product price in line ${i}`)
        return false;
      }
    }

    console.log("CsvData: ", CsvData);

    try {
      // 상품등록
      // const result = await axios.post(`${PRODUCT_SERVER}/register`, CsvData);
      // if (result.data.success) {
      //   alert('CSV registration was successful');
      //   // Landing page 이동
      //   history.push("/");
      // } else {
      //   alert('CSV registration failed \n Please contact the administrator');
      //   // 원래대로 복귀처리(등록한 데이터 삭제)

      //   // Landing page 이동
      //   history.push("/");

      // }
        
    } catch (err) {
      console.log("err: ", err);
      alert('CSV registration failed \n Please contact the administrator');
      // 원래대로 복귀처리(등록한 데이터 삭제)

      // Landing page 이동
      history.push("/");
    }
  }

  // CSV데이타 조합
  const mySplit = (line, delimiter, ignore) => {
    let spt = [];
    let tmp = "";
    let flag = false;

    for(let i = 0; i < line.length; i++) {

      if(ignore === line[i] && flag === true) {
        flag = false;
        continue;
      } else if(ignore === line[i]) {
        flag = true;
        continue;
      } 
      
      if(line[i] === delimiter && flag === false) {
        spt.push(tmp);
        tmp = "";
        continue;
      }

      tmp += line[i];
    }

    spt.push(tmp);

    return spt;
  }

  return (
    <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
        <h2>Product CSV Upload</h2>
      </div>

      <div style={{ display:'flex', justifyContent:'center' }}>
        <input style={{display: 'inlineBlock',padding:'.5em .75em',fontSize:'inherit',fontFamily:'inherit',lineHeight:'normal',verticalAlign:'middle',backgroundColor:'#f5f5f5',
                      border:'1px solid #ebebeb',borderBottomColor:'#e2e2e2',borderRadius:'.25em',appearance: 'none'}}
        className="upload-name" value={FileName} disabled="disabled" /> 
        <label style={{display:'inline-block',padding:'.5em .75em',color:'#999',fontSize:'inherit',lineHeight:'normal',verticalAlign:'middle',backgroundColor:'#fdfdfd',
                      cursor:'pointer',border:'1px solid #ebebeb',borderBottomColor:'#e2e2e2',borderRadius:'.25em'}} htmlFor="ex_filename">
          File Search
        </label> 
        <input style={{position:'absolute',width:'1px',height:'1px',padding:'0',margin:'-1px',overflow:'hidden',clip:'rect(0,0,0,0)',border:'0'}} 
          type="file" id="ex_filename" className="upload-hidden" accept=".csv" onChange={(e) => csvUploadHandler(e)} />
        &nbsp;
        <Button size="default" type="primary" onClick={registerHandler}>
          Upload
        </Button>
      </div>      
    </div>
  );
}

export default ProductUploadCsvPage;