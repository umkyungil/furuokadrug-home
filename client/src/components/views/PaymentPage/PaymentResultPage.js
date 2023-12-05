import React, { useEffect, useContext } from 'react';
import { Button, Descriptions, Result } from 'antd';
import { useHistory, useLocation } from 'react-router-dom';
import { USER_SERVER } from '../../Config';
import { useTranslation } from 'react-i18next';

import { LanguageContext } from '../../context/LanguageContext';
import { getLanguage, setHtmlLangProps, getMessage } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

function PaymentResultPage(props) {
  const history = useHistory();
  const location = useLocation();
  const {isLanguage, setIsLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  // (ご指定URL)?result=1&pid=0000000&sod=XXXXXXX&ta=00000&uniquefield=1234
  // http://localhost:3000/payment/alipay/result?result=1&pid=0000000&sod=xxxxxxx&ta=00000&uniquefield=1234
  // query string
  // result: 처리결과 
  // pid: 결제번호
  // sod: 점포 오더번호
  // ta: 결제금액 합계
  // uniqueField: 임의의 추가필드
  const hash = location.hash;
  const pathname = location.pathname;
  const search = location.search;
  const state = location.state;
  const key = location.key;

  const params = new URLSearchParams(location.search);
  const sod = params.get("sod");
  const uniqueField = params.get("uniqueField");
  
  let arrUniqueField = uniqueField.split('_');
  // 라이브에서 이동된 경우
  let userId = '';
  if (arrUniqueField[0].trim() === "cart") {
    // 카트: uniqueField = 'cart_' + tmpPaymentId + '_' + uniqueDate+ '_' + userId;
    userId = arrUniqueField[3].trim()
  } else {
    // 라이브 스트리밍: uniqueField = 'alipay' + '_' + loginUserId + '_' + uniqueDate;
    userId = arrUniqueField[1].trim()
  }

  useEffect(() => {
    // 다국어 설정
    const lang = getLanguage(isLanguage);
    i18n.changeLanguage(lang);
    setIsLanguage(lang);

    // HTML lang속성 변경
    setHtmlLangProps(lang);

    // 로그인 처리(결제 성공 실패와 관계없이 ID존재 여부로 파악)
    loginProcess(userId);
	}, [isLanguage])

  const loginProcess = async (userId) => {
    try {
      // 불특정 사용자는 아무처리를 하지 않아도 된다.
      const user = await axios.get(`${USER_SERVER}/redirect/login?id=${userId}`);
      if (user.data.loginSuccess) {
        // local storage에 등록
        i18n.changeLanguage(user.data.userInfo.language); // 언어
        localStorage.setItem('userId', user.data.userInfo._id);
        localStorage.setItem('userName', user.data.userInfo.name);

        // 불특정사용자의 정보가 남아 있을수 있기 때문에 삭제
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('userName');
        // 사용자 정보의 언어 속송값을 다국어에서 사용하기 위해 로컬스토리지에 셋팅
        if (user.data.userInfo.language) {
          setIsLanguage(user.data.userInfo.language);
        }
      }
    } catch (err) {
      console.log("PaymentResultPage loginProcess err: ", err);
      alert(getMessage(getLanguage(), 'key001'));
      history.push("/");
    }
  }

  const listHandler = () => {
    history.push("/");
  }
  
  return (
    <div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} style={{width: '85%', margin: '3rem auto'}}>
      <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
        <h1>{'Payment result'}</h1>
      </div>
      <div> 
        {params.get("result") === "1" && 
          <Result
            status="success"
            title="Alipay payment successful"
            extra={[
              <Button type="primary" key="console" onClick={listHandler}>
                Landing Page
              </Button>
            ]}
          />
        }

        {params.get("result") !== "1" && 
          <>
            <Result
              status="error"
              title="Alipay payment failed"
              subTitle="Please contact the administrator"
              extra={[
                <Button type="primary" key="console" onClick={listHandler}>
                  Landing Page
                </Button>
              ]}
            />
            <div style={{ textAlign: 'center'}}>
              <Descriptions>
                <Descriptions.Item label={'Payment number'}>{params.get("pid")}</Descriptions.Item>
                <Descriptions.Item label={'Total'}>{params.get("ta").toLocaleString()}</Descriptions.Item>
              </Descriptions>
            </div>
          </>
        }
      </div>
    </div>
  )
}

export default PaymentResultPage;