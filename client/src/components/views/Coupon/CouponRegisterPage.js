import React, { useState, useEffect } from "react";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useHistory } from 'react-router-dom';
import { DatePicker, Select, Form, Input, Button, Checkbox } from 'antd';
import { useTranslation } from 'react-i18next';
import { MainCategory, CouponType, UseWithSale } from '../../utils/Const';
import { dateFormatYMD } from '../../utils/CommonFunction'
import { COUPON_SERVER, MAIL_SERVER, USER_SERVER, PRODUCT_SERVER } from '../../Config.js'
import axios from 'axios';
// CORS 대책
axios.defaults.withCredentials = true;

const {Option} = Select;
const {RangePicker} = DatePicker;
const dateFormat = 'YYYY-MM-DD';

const items = MainCategory; // 쿠폰적용 Item
const types = CouponType;
const sale = UseWithSale;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
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
  const [Type, setType] = useState("2");
  const [ExpirationPeriod, setExpirationPeriod] = useState([]);
  const [Item, setItem] = useState(0);
  const [UseWithSale, setUseWithSale] = useState(0);
  const [CheckBox, setCheckBox] = useState(true);
  const [UserId, setUserId] = useState("");
  const [UserName, setUserName] = useState("");
  const [ProductId, setProductId] = useState("");
  const [ProductName, setProductName] = useState("");
  const history = useHistory();

  useEffect(() => {
		// 다국어 설정
		setMultiLanguage(localStorage.getItem("i18nextLng"));

  }, [])

  // 다국어 설정
  const {t, i18n} = useTranslation();
  function setMultiLanguage(lang) {
    i18n.changeLanguage(lang);
  }
  // Landing pageへ戻る
  const listHandler = () => {
    history.push("/");
  }  
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
  const saleHandler = (value) => {
    setUseWithSale(value);
  }
  // 사용자 검색(검색버튼)
  const popupHandler = () => {
    window.open("/coupon/user","user list","width=550, height=700, top=10, left=10");
  }
  // 사용자 검색(크리어버튼)
  const clearHandler = () => {
    setUserId("");
  }
  // 사용자 검색 팝업창에서 userId를 전달받음
  window.clickHandler = function (userId) {
    setUserId(userId);
    getUser(userId);
  };
  // 상품 검색(검색버튼)
  const productPopupHandler = () => {
    window.open(`/coupon/product/${Item}`,"product list","width=550, height=700, top=10, left=10");
  }
  // 상품 검색(크리어버튼)
  const productClearHandler = () => {
    setProductId("");
  }
  // 상품 검색 팝업창에서 productId를 전달받음
  window.productClickHandler = function (productId) {
    setProductId(productId);
    getProduct(productId)
  };
  // 메일전송 유무(체크박스)
  const checkboxHandler = (e) => {
    setCheckBox(e.target.checked)
  };

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
      alert("Failed to get user information")
      console.log("getUser err: ",err);
    }
  } 

  // 상품정보 가져오기
  const getProduct = async(productId) => {
    try {
      const result = await axios.get(`${PRODUCT_SERVER}/coupon/products_by_id?id=${productId}`);
      if (result.data.success) {
        setProductName(result.data.productInfo[0].title);
      }
    } catch (err) {
      alert("Failed to get product information")
      console.log("getProduct err: ",err);
    }
  }

  // 메일 송신
  const sendMail = async(body) => {
    try {
      if (window.confirm("Do you want to send mail to all users?")) {
        const result = await axios.post(`${MAIL_SERVER}/coupon`, body);
        if (result.data.success) {
          console.log('Coupon information email has been sent normally');
        } else {
          console.log('Failed to send coupon information email\nPlease contact the administrator');
        }
      } else {
        setCheckBox(false);
      }
    } catch(err) {
      setCheckBox(false);
      console.log("sendMail err: ",err);
    }
  }

  return (
    <Formik
      initialValues={{
        code: '',
        amount: '',
        count: '1'
      }}
      validationSchema={Yup.object().shape({
        code: Yup.string()
          .max(4, 'Must be exactly 4 characters')
          .required('Code is required'),
        amount: Yup.string()
          .required('Discount rate or discount amount is required'),
        count: Yup.string()
          .max(2, 'Must be exactly 2 characters')
          .required('Count is required'),
      })}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          // 금액 체크
          if (isNaN(Number(values.amount))) {
            alert("Only numbers can be entered for the amount");
            setSubmitting(false);
            return false;
          }
          if (Number(values.amount) < 1) {
            alert("Only positive numbers can be entered for the amount");
            setSubmitting(false);
            return false;
          }
          // 날짜 체크
          if (ExpirationPeriod.length < 1) {
            alert("Expiration period is required");
            setSubmitting(false);
            return false;
          }
          if (!ExpirationPeriod[0]) {
            alert("Expiration period is required");
            setSubmitting(false);
            return false;
          }
          if (!ExpirationPeriod[1]) {
            alert("Expiration period is required");
            setSubmitting(false);
            return false;
          }

          const curDate = new Date(dateFormatYMD());
          const startDate = new Date(ExpirationPeriod[0]);
          const endDate = new Date(ExpirationPeriod[1]);

          // 입력한 날짜가 과거인지 체크
          if (curDate > startDate) {
            alert("Past dates cannot be used");
            setSubmitting(false);
            return false;
          }
          // 입력한 날짜가 과거인지 체크
          if (curDate > endDate) {
            alert("Past dates cannot be used");
            setSubmitting(false);
            return false;
          }
          // 날짜의 form to 상관관계 체크
          if (startDate > endDate) {
            alert("Please check the entered date");
            setSubmitting(false);
            return false;
          }

          // 쿠폰 사용횟수 체크
          if (isNaN(Number(values.count))) {
            alert("Only numbers can be entered for the count");
            setSubmitting(false);
            return false;
          }
          if (Number(values.count) < 1) {
            alert("Only positive numbers can be entered for the coupon count");
            setSubmitting(false);
            return false;
          }

          // 쿠폰 정보 셋팅
          let body = {
            code: values.code,
            type: Type,
            amount: values.amount,
            validFrom: ExpirationPeriod[0],
            validTo: ExpirationPeriod[1],
            item: Item,
            active: "1", // 활성
            useWithSale: UseWithSale,
            count: values.count,
            userId: UserId,
            productId: ProductId,
            sendMail: CheckBox
          };

          // 쿠폰이 이미 존재하는지 확인
          axios.post(`${COUPON_SERVER}/list`, body)
          .then(response => {
              // 쿠폰이 존재하면 에러
              if (response.data.success) {
                if (response.data.couponInfos.length > 0) {
                  alert("Please check if the coupon code already exists")

                  return false;
                } else {
                  // 쿠폰이 존재하지 않으면 쿠폰 등록
                  axios.post(`${COUPON_SERVER}/register`, body)
                  .then(response => {
                    if (response.data.success) {
                      // 메일 송신 여부
                      if (CheckBox) {
                        sendMail(body)
                        alert('Coupon has been registered');
                      }
                      // 쿠폰 정상등록후 리스트페이지로 이동
                      history.push("/coupon/list");
                    } 
                  });
                }
              }
          })
          
        setSubmitting(false);
      }, 500);
    }}
    >
      {props => {
        const { values, touched, errors, isSubmitting, handleChange, handleBlur, handleSubmit, } = props;
        return (
          <div className="app">
            <h1>{t('Coupon.regTitle')}</h1><br />
            
            <Form style={{ minWidth: '500px' }} {...formItemLayout} onSubmit={handleSubmit} >
              {/* 쿠폰코드 */}
              <Form.Item required label={t('Coupon.code')} >
                <Input id="code" placeholder="Coupon code" type="text" value={values.code} 
                  onChange={handleChange} 
                  onBlur={handleBlur} 
                  style={{ width: 250 }} 
                  className={ errors.code && touched.code ? 'text-input error' : 'text-input' }
                />
                {errors.code && touched.code && (<div className="input-feedback">{errors.code}</div>)}
              </Form.Item>
              {/* 쿠폰종류 */}
              <Form.Item required label={t('Coupon.type')} >
                <Select value={Type} style={{ width: 250 }} onChange={typeHandler}>
                {types.map(item => (
                  <Option key={item.key} value={item.key}> {item.value} </Option>
                ))}
                </Select>
              </Form.Item>
              {/* 쿠폰할인율 또는 금액 */}
              <Form.Item required label={t('Coupon.amount')} >
                <Input id="amount" placeholder="Coupon amount" type="text" value={values.amount} 
                  onChange={handleChange} 
                  onBlur={handleBlur} 
                  style={{ width: 250 }} 
                  className={ errors.amount && touched.amount ? 'text-input error' : 'text-input' }
                />
                {errors.amount && touched.amount && (<div className="input-feedback">{errors.amount}</div>)}
              </Form.Item>
              {/* 쿠폰 유효기간 */}
              <Form.Item required label={t('Coupon.validTo')}>
                <RangePicker 
                  id="validTo" 
                  format={dateFormat}
                  onChange={dateHandler}
                  onOk={onOk} 
                  style={{ width: 250 }} 
                />
              </Form.Item>
              {/* 쿠폰적용 카테고리 */}
              <Form.Item required label={t('Coupon.item')} >
                <Select value={Item} style={{ width: 250 }} onChange={itemHandler}>
                {items.map(item => (
                  <Option key={item.key} value={item.key}> {item.value} </Option>
                ))}
                </Select>
              </Form.Item>
              {/* 쿠폰적용 상품 아이디 */}
              <Form.Item label={t('Coupon.product')} >
                <Input id="userId" placeholder="Enter product" type="text" value={ProductName} style={{ width: 110 }} readOnly/>&nbsp;
                <Button onClick={productPopupHandler} style={{width: '70px'}}>Search</Button>&nbsp;
                <Button onClick={productClearHandler} style={{width: '65px'}}>Clear</Button>
                <br />
              </Form.Item>
              {/* 쿠폰과 세일 병행사용 여부 */}
              <Form.Item required label={t('Coupon.useWithSale')} >
                <Select value={UseWithSale} style={{ width: 250 }} onChange={saleHandler}>
                {sale.map(item => (
                  <Option key={item.key} value={item.key}> {item.value} </Option>
                ))}
                </Select>
              </Form.Item>
              {/* 쿠폰 사용횟수 */}
              <Form.Item required label={t('Coupon.count')} >
                <Input id="count" placeholder="Coupon use count" type="text" value={values.count} 
                  onChange={handleChange} 
                  onBlur={handleBlur} 
                  style={{ width: 250 }} 
                  className={ errors.count && touched.count ? 'text-input error' : 'text-input' }
                />
                {errors.count && touched.count && (<div className="input-feedback">{errors.count}</div>)}
                <br />
                <span style={{ color: "red" }}>※Unlimited use is possible if no value is set</span>
              </Form.Item>
              {/* 쿠폰적용 사용자 아이디 */}
              <Form.Item label={t('Coupon.user')} >
                <Input id="userId" placeholder="Enter user" type="text" value={UserName} style={{ width: 110 }} readOnly/>&nbsp;
                <Button onClick={popupHandler} style={{width: '70px'}}>Search</Button>&nbsp;
                <Button onClick={clearHandler} style={{width: '65px'}}>Clear</Button>
                <br />
              </Form.Item>
              {/* 메일전송 유무 */}
              <Form.Item required label={t('Coupon.sendMail')} >
                <Checkbox checked={CheckBox} onChange={checkboxHandler} />
              </Form.Item>
            
              <Form.Item {...tailFormItemLayout}>
                <Button onClick={listHandler}>
                  Landing Page
                </Button>&nbsp;&nbsp;
                <Button onClick={handleSubmit} type="primary" disabled={isSubmitting}>
                  Submit
                </Button>
              </Form.Item>
            </Form>
          </div>
        );
      }}
    </Formik>
  );
};

export default CouponRegisterPage