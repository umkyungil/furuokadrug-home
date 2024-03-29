import React, { useState, useEffect, useContext } from "react";
import { Formik } from 'formik';
import { useHistory } from 'react-router-dom';
import { DatePicker, Select, Form, Input, Button, Checkbox } from 'antd';
import { useTranslation } from 'react-i18next';
import { MAIN_CATEGORY, CouponType, UseWithSale } from '../../utils/Const';
import { COUPON_SERVER, MAIL_SERVER, USER_SERVER, PRODUCT_SERVER } from '../../Config.js'
import schedule from 'node-schedule'

import { LanguageContext } from '../../context/LanguageContext';
import { dateFormatYMD, getLanguage, setHtmlLangProps, getMessage } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

const {Option} = Select;
const {RangePicker} = DatePicker;
const dateFormat = 'YYYY-MM-DD';

const items = MAIN_CATEGORY; // 쿠폰적용 Item
const types = CouponType;
const sale = UseWithSale;
const formItemLayout = {
  labelCol: {
    span: 6
    // xs: { span: 24 },
    // sm: { span: 8 },
  },
  wrapperCol: {
    span: 14
    // xs: { span: 24 },
    // sm: { span: 16 },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

function CouponRegisterPage() {
  const [CouponCode, setCouponCode] = useState("");
  const [Type, setType] = useState(CouponType[2].key);
  const [Amount, setAmount] = useState("");
  const [ExpirationPeriod, setExpirationPeriod] = useState([]);
  const [Item, setItem] = useState(0);
  const [UseWithSale, setUseWithSale] = useState(1);
  const [SendMail, setSendMail] = useState(false);
  const [MailBatch, setMailBatch] = useState("");
  const [UserId, setUserId] = useState("");
  const [UserName, setUserName] = useState("");
  const [ProductId, setProductId] = useState("");
  const [ProductName, setProductName] = useState("");
  const [ProductItem, setProductItem] = useState("");
  const [Count, setCount] = useState("1");
  const history = useHistory();

  const {isLanguage, setIsLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  useEffect(() => {
		// 다국어 설정
    const lang = getLanguage(isLanguage);
    i18n.changeLanguage(lang);
    setIsLanguage(lang);

    // HTML lang속성 변경
    setHtmlLangProps(lang);
  }, [isLanguage])

  // Landing pageへ戻る
  const listHandler = () => {
    history.push("/");
  }
  // 쿠폰코드
  const couponCodeHandler = (e) => {
    setCouponCode(e.target.value)
  };
  // 쿠폰종류
  const typeHandler = (value) => {
    setType(value);
  }
  // 유효일자
  const dateHandler = (value, dateString) => {
    setExpirationPeriod(dateString);
  }
  // 쿠폰적용Item
  const itemHandler = (value) => {
    setItem(value);
  }
  // 세일과 병행 사용여부
  const useWithSaleHandler = (value) => {
    setUseWithSale(value);
  }
  // 사용횟수
  const countHandler = (e) => {
    setCount(e.target.value)
  };
  // 사용자 검색(검색버튼)
  const popupHandler = () => {
    window.open("/coupon/user","user list","width=550, height=700, top=10, left=10");
  }
  // 사용자 검색(크리어버튼)
  const clearHandler = () => {
    setUserId("");
    setUserName("");
  }
  // 사용자 검색 팝업창에서 userId를 전달받음
  window.clickHandler = function (userId) {
    setUserId(userId);
    getUser(userId);
  };
  // 상품 검색(검색버튼)
  const productPopupHandler = () => {
    if (Item === 0) {
      alert(getMessage(getLanguage(), 'key056'));
    } else {
      window.open(`/coupon/product/${Item}`,"product list","width=550, height=700, top=10, left=10");
    }
  }
  // 상품 검색(크리어버튼)
  const productClearHandler = () => {
    setProductId("");
    setProductName("");
  }
  // 상품 검색 팝업창에서 productId를 전달받음
  window.productClickHandler = function (productId) {
    setProductId(productId);
    getProduct(productId)
  };
  // 메일전송 유무(체크박스)
  const sendMailHandler = (e) => {
    setSendMail(e.target.checked)
  };
  // 쿠폰타입의 값
  const amountHandler = (e) => {
    setAmount(e.target.value)
  };
  // 메일전송 배치
  const mailBatchHandler = (value, dateString) => {
    setMailBatch(dateString);
  }
  const onOk = (value) => {
    console.log('onOk: ', value);
  }

  // 사용자정보 가져오기
  const getUser = async(userId) => {
    try {
      const result = await axios.get(`${USER_SERVER}/users_by_id?id=${userId}`);
      if (result.data.success) {
        setUserName(result.data.user[0].lastName);
      }
    } catch (err) {
      alert(getMessage(getLanguage(), 'key070'));
      console.log("CouponRegisterPage getUser err: ",err);
    }
  } 

  // 상품정보 가져오기
  const getProduct = async(productId) => {
    try {
      const result = await axios.get(`${PRODUCT_SERVER}/coupon/products_by_id?id=${productId}`);
      if (result.data.success) {
        setProductName(result.data.productInfo[0].title);
        setProductItem(result.data.productInfo[0].continents);
      }
    } catch (err) {
      alert(getMessage(getLanguage(), 'key073'));
      console.log("CouponRegisterPage getProduct err: ",err);
    }
  }
  // 메일 송신
  const sendMail = async(body) => {
    try {
      // 쿠폰등록 페이지의 플래그
      body.mod = "reg";

      // 메일체크박스가 on인경우
      if (SendMail) {
        if (window.confirm("Do you want to send mail to all users?")) {
          // 메일 전송시간이 설정된 경우
          if (MailBatch !== "") {
            await mailBatch(body)
          } else {
            // 모든 사용자 또는 지정된 사용자와 관리자에게 메일을 보낸다
            await axios.post(`${MAIL_SERVER}/coupon`, body);
          }
        } else {
          // 쿠폰정보를 등록했으니깐 관리자에게는 메일을 보낸다
          await axios.post(`${MAIL_SERVER}/coupon/admin`, body);
          setSendMail(false);
        }
      } else {
        // 쿠폰정보를 등록했으니깐 관리자에게는 메일을 보낸다
        await axios.post(`${MAIL_SERVER}/coupon/admin`, body);
        setSendMail(false);
      }
    } catch(err) {
      setSendMail(false);
      console.log("CouponRegisterPage sendMail err: ",err);
    }
  }

  async function mailBatch(body) {
    const today = new Date();
    // time: 2022-11-11 19:16:17
    const jtc = new Date(MailBatch);

    if (today > jtc) {
      alert(getMessage(getLanguage(), 'key118'));
      return false;
    }
    
    const year = jtc.getFullYear();
    const month = jtc.getMonth() + 1;
    const date = jtc.getDate();
    const hour = jtc.getHours();
    const minute = jtc.getMinutes();

    // RecurrenceRule 설정
    // second (0-59)
    // minute (0-59)
    // hour (0-23)
    // date (1-31)
    // month (0-11)
    // year
    // dayOfWeek (0-6) Starting with Sunday
    // tz
    let rule = new schedule.RecurrenceRule();
    rule.year = year;
    rule.month = month - 1; // month (0-11)
    rule.date = date;
    rule.hour = hour;
    rule.minute = minute;
    rule.second = 59; // 화면에서 현재시간을 설정하면 배치가 실행되는 시간이 과거가 될수있기에 59초로 설정한다
    rule.tz = 'Asia/Tokyo';

    schedule.scheduleJob(rule, async function() {
        let startToday = new Date();
        let startTime = startToday.toLocaleString('ja-JP');
        console.log("-------------------------------------------");
        console.log("Batch setting of coupons information registration mail start :", startTime);
        console.log("-------------------------------------------");

        try {
          // 모든 사용자 또는 지정된 사용자와 관리자에게 메일을 보낸다
          await axios.post(`${MAIL_SERVER}/coupon`, body);
        } catch (err) {
          console.log("CouponRegisterPage mailBatch err ", err);
        }
    })
  }

  return (
    <Formik
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          // 쿠폰코드 체크
          if (CouponCode === "") {
            alert(getMessage(getLanguage(), 'key051'));
            setSubmitting(false);
            return false;
          }
          if (CouponCode.length > 4) {
            alert(getMessage(getLanguage(), 'key112'));
            setSubmitting(false);
            return false;
          }
          // 금액 체크
          if (Amount === "") {
            alert(getMessage(getLanguage(), 'key115'));
            setSubmitting(false);
            return false;
          }
          if (isNaN(Number(Amount))) {
            alert(getMessage(getLanguage(), 'key054'));
            setSubmitting(false);
            return false;
          }
          if (Number(Amount) < 1) {
            alert(getMessage(getLanguage(), 'key055'));
            setSubmitting(false);
            return false;
          }
          // 카테고리가 ALL인데 상품이 지정되어 있는경우
          if (Item === MAIN_CATEGORY[0].key) {
            if (ProductId !== "") {
              alert(getMessage(getLanguage(), 'key056'));
              setSubmitting(false);
              return false;
            }
          }
          // 카테고리의 상품인지 확인
          if (Item !== MAIN_CATEGORY[0].key) {
            if (ProductId !== "") {
              getProduct(ProductId);
              
              if (Item !== ProductItem) {
                alert(getMessage(getLanguage(), 'key057'));
                setSubmitting(false);
                return false;
              }
            }
          }
          // 날짜 체크
          if (ExpirationPeriod.length < 1) {
            alert(getMessage(getLanguage(), 'key116'));
            setSubmitting(false);
            return false;
          }
          if (!ExpirationPeriod[0]) {
            alert(getMessage(getLanguage(), 'key116'));
            setSubmitting(false);
            return false;
          }
          if (!ExpirationPeriod[1]) {
            alert(getMessage(getLanguage(), 'key116'));
            setSubmitting(false);
            return false;
          }

          const curDate = new Date(dateFormatYMD());
          const startDate = new Date(ExpirationPeriod[0]);
          const endDate = new Date(ExpirationPeriod[1]);

          // 입력한 날짜가 과거인지 체크
          if (curDate > startDate) {
            alert(getMessage(getLanguage(), 'key117'));
            setSubmitting(false);
            return false;
          }
          // 입력한 날짜가 과거인지 체크
          if (curDate > endDate) {
            alert(getMessage(getLanguage(), 'key117'));
            setSubmitting(false);
            return false;
          }
          // 날짜의 form to 상관관계 체크
          if (startDate > endDate) {
            alert(getMessage(getLanguage(), 'key119'));
            setSubmitting(false);
            return false;
          }

          // 쿠폰 사용횟수 체크, 카운트가 ""인 경우는 무제한
          if (Count !== "") {
            if (Count.length > 2) {
              alert(getMessage(getLanguage(), 'key120'));
              setSubmitting(false);
              return false;
            }
            if (isNaN(Number(Count))) {
              alert(getMessage(getLanguage(), 'key121'));
              setSubmitting(false);
              return false;
            }
            if (Number(Count) < 1) {
              alert(getMessage(getLanguage(), 'key122'));
              setSubmitting(false);
              return false;
            }  
          }

          // 쿠폰 정보 셋팅
          let body = {
            code: CouponCode,
            type: Type,
            amount: Amount,
            validFrom: ExpirationPeriod[0],
            validTo: ExpirationPeriod[1],
            item: Item,
            active: "1", // 활성
            useWithSale: UseWithSale,
            count: Count,
            userId: UserId,
            productId: ProductId,
            sendMail: SendMail
          };

          try {
            // 쿠폰코드가 이미 존재하는지 확인
            axios.post(`${COUPON_SERVER}/list`, body)
            .then(response => {
              // 쿠폰이 존재하면 에러
              if (response.data.success) {
                const couponInfos = response.data.couponInfos;

                if (couponInfos.length > 0) {
                  let cnt = 0;
                  for (let i=0; i<couponInfos.length; i++) {
                    // 생일자 쿠폰이외에 쿠폰정보가 있는경우
                    if (!couponInfos[i].beforeBirthday) {
                      cnt++;
                    }
                  }
                  
                  if (cnt > 0) {
                    alert(getMessage(getLanguage(), 'key123'));
                    return false;
                  } else {
                    // 생일자 쿠폰이외의 쿠폰이 존재하지 않으면 쿠폰 등록
                    axios.post(`${COUPON_SERVER}/register`, body)
                    .then(response => {
                      if (response.data.success) {
                        // 메일 전송
                        sendMail(body);

                        alert(getMessage(getLanguage(), 'key099'));
                      } else {
                        alert(getMessage(getLanguage(), 'key001'));
                      }
                      // 리스트페이지로 이동
                      history.push("/coupon/list");
                    });
                  }
                } else {
                  // 쿠폰이 존재하지 않으면 쿠폰 등록
                  axios.post(`${COUPON_SERVER}/register`, body)
                  .then(response => {
                    if (response.data.success) {
                      // 메일 전송
                      sendMail(body);

                      alert(getMessage(getLanguage(), 'key099'));
                    } else {
                      alert(getMessage(getLanguage(), 'key001'));
                    }
                    // 리스트페이지로 이동
                    history.push("/coupon/list");
                  });
                }
              } else {
                // 같은 세일코드가 존재하는 경우
                alert(getMessage(getLanguage(), 'key124'));
                return false;
              }
            })
          } catch (err) {
            alert(getMessage(getLanguage(), 'key001'));
            console.log("CouponRegisterPage return err: ", err);
            // 쿠폰리스트 이동
            history.push("/coupon/list");
          }
          
        setSubmitting(false);
      }, 500);
    }}
    >
      {props => {
        const { isSubmitting, handleBlur, handleSubmit, } = props;
        return (
          <div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} style={{ maxWidth: '700px', margin: '2rem auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
              <h1>{t('Coupon.regTitle')}</h1>
            </div>
            <Form style={{height:'80%', margin:'1em'}} {...formItemLayout} onSubmit={handleSubmit} autoComplete="off" >
              {/* 쿠폰코드 */}
              <Form.Item required label={t('Coupon.code')} >
                <Input id="code" placeholder="Coupon code" type="text" value={CouponCode} onChange={couponCodeHandler} onBlur={handleBlur} />
              </Form.Item>
              {/* 쿠폰종류 */}
              <Form.Item required label={t('Coupon.type')} >
                <Select value={Type} onChange={typeHandler}>
                {types.map(item => (
                  <Option key={item.key} value={item.key}> {item.value} </Option>
                ))}
                </Select>
              </Form.Item>
              {/* 쿠폰할인율 또는 금액 */}
              <Form.Item required label={t('Coupon.amount')} >
                <Input id="amount" placeholder="Coupon type value" type="text" value={Amount} onChange={amountHandler} onBlur={handleBlur} />
              </Form.Item>
              {/* 쿠폰 유효기간 */}
              <Form.Item required label={t('Coupon.validTo')}>
                <RangePicker 
                  id="validTo" 
                  format={dateFormat}
                  onChange={dateHandler}
                  onOk={onOk} 
                />
              </Form.Item>
              {/* 쿠폰적용 카테고리 */}
              <Form.Item required label={t('Coupon.item')} >
                <Select value={Item} onChange={itemHandler}>
                  {items.map(item => (
                    <Option key={item.key} value={item.key}> {item.value} </Option>
                  ))}
                </Select>
              </Form.Item>
              {/* 쿠폰적용 상품 아이디 */}
              <Form.Item label={t('Coupon.product')} >
                <Input id="userId" type="text" value={ProductName} style={{width: '7em'}} readOnly/>&nbsp;
                <Button onClick={productPopupHandler} >
                  Search
                </Button>
                <Button onClick={productClearHandler} >
                  Clear
                </Button>
                <br />
              </Form.Item>
              {/* 쿠폰과 세일 병행사용 여부 */}
              <Form.Item required label={t('Coupon.useWithSale')} >
                <Select value={UseWithSale} onChange={useWithSaleHandler}>
                {sale.map(item => (
                  <Option key={item.key} value={item.key}> {item.value} </Option>
                ))}
                </Select>
              </Form.Item>
              {/* 쿠폰 사용횟수 */}
              <Form.Item required label={t('Coupon.count')} >
                <Input id="count" placeholder="Coupon use count" type="text" value={Count} onChange={countHandler} 
                  onBlur={handleBlur} style={{ width: '7em' }} />
                  <br />
                <span style={{ color: "red" }}>※Unlimited use if no value is entered</span>
              </Form.Item>
              {/* 쿠폰적용 사용자 아이디 */}
              <Form.Item label={t('Coupon.user')} >
                <Input id="userId" type="text" value={UserName} style={{ width: '7em' }} readOnly/>&nbsp;
                <Button onClick={popupHandler} >
                  Search
                </Button>
                <Button onClick={clearHandler} >
                  Clear
                </Button>
                <br />
              </Form.Item>
              {/* 메일전송 유무 */}
              <Form.Item label={t('Coupon.sendMail')} >
                <Checkbox checked={SendMail} onChange={sendMailHandler} />
              </Form.Item>
              {/* 메일 예약 */}
              { SendMail &&
                <Form.Item label={t('Sale.mailBatch')}>
                  <DatePicker showTime onChange={mailBatchHandler} onOk={onOk} />
                </Form.Item>
              }
            
              <Form.Item {...tailFormItemLayout}>
                <Button onClick={listHandler}>
                  Landing Page
                </Button>
                <Button onClick={handleSubmit} type="primary" disabled={isSubmitting}>
                  Submit
                </Button>
              </Form.Item>
              <br />
              
            </Form>
          </div>
        );
      }}
    </Formik>
  );
};

export default CouponRegisterPage;