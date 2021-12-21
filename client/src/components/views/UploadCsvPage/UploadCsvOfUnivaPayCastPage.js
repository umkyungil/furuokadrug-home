import React, {useState} from 'react'
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { Button } from 'antd';



function UploadCsvOfUnivaPayCastPage() {
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
    // 전체 파일 내용
    let sptLine = file.split(/\r\n|\n/);

    if (sptLine.length < 1) {
      alert("There is a problem with the selected file.")
    } 

    let header = ['paymentNumber','serviceType','settlementJob','result','storeOrderNumber','cardBrand','name','telephoneNumber','email','totalAmount',
                  'settlementDate','actualSaleDate','cancellationDate','IssueId','issuePassword','cardExpirationDate','nameJapanese','nameFurigana','address','addressFurigana',
                  'mobileNumber','faxNumber','birthday','question','mailingName','mailingNameFurigana','mailingAddress','mailingFurigana','mailingPhoneNumber','mailingMobileNumber',
                  'mailingFaxNumber','mailingEmail','productCode','productName','paymentMethod','numberOfPayments','otherParameters','blank'];
    let body = [];
    for(let i=0; i<sptLine.length; i++) {
    
      if (sptLine[i] === "") continue;
      // 파일 내용을 배열로 정리(1번째는 타이틀)	
      if (i == 0 ) {
        continue;
      }

      let spt = mySplit(sptLine[i], DELIMITER, APOSTROPHE);
      let obj_data = new Object();

      for (let j=0; j<spt.length; j++ ) {
        obj_data[header[j]] = spt[j]
      }
      
      body.push(obj_data);
    }

    setCsvData(body);
  }

  // CSV 등록
  const registerHandler = () => {
    if (CsvData.length > 0) {
      axios.post('/api/csv/univaPayCast/register', CsvData)
      .then(response => {
        if (response.data.success) {
          alert('CSV registration was successful.');
          setCsvData("");
          history.push("/");
        } else {
          alert('CSV registration failed.');
          setCsvData("");
        }
      });  
    } else {
      alert('Please select a file')
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
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2>UNIVA PAYCAST CSV Upload</h2>
      </div>
      <br />
      <br />
      <br />
      <br />
      <br />
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

export default UploadCsvOfUnivaPayCastPage