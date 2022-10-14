import React, { useState, useEffect } from "react";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useHistory } from 'react-router-dom';
import { DatePicker, Select, Form, Input, Button, Checkbox } from 'antd';
import { useTranslation } from 'react-i18next';
import { MainCategory, SaleType } from '../../utils/Const';
import { dateFormatYMD } from '../../utils/CommonFunction'
import { MAIL_SERVER, SALE_SERVER, PRODUCT_SERVER } from '../../Config.js'
import axios from 'axios';
// CORS 대책
axios.defaults.withCredentials = true;

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const dateFormat = 'YYYY-MM-DD';

const items = MainCategory;
const types = SaleType;

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

function SaleRegisterPage() {
  const [Type, setType] = useState(SaleType[2].key);
  const [ExpirationPeriod, setExpirationPeriod] = useState([]);
  const [Item, setItem] = useState(0);
  const [MinAmount, setMinAmount] = useState("");
  const [MailCheckBox, setMailCheckBox] = useState(true);
  const [CnMailComment, setCnMailComment] = useState("");
  const [JpMailComment, setJpMailComment] = useState("");
  const [EnMailComment, setEnMailComment] = useState("");
  const [ExceptCheckBox, setExceptCheckBox] = useState(false);
  const [ProductId, setProductId] = useState("");
  const [ProductName, setProductName] = useState("");
  const [ShowMinAmount, setShowMinAmount] = useState(true);
  const [ShowMailComment, setShowMailComment] = useState(true);
  const [ShowExcept, setShowExcept] = useState(false);
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
  // 세일종류
  const typeHandler = (value) => {
    setType(value);

    if (value === SaleType[2].key) {
      setShowMinAmount(true);
    } else {
      setShowMinAmount(false)
    }
  }
  // 유효일자
  const dateHandler = (value, dateString) => {
    setExpirationPeriod(dateString);
  }
  // 세일 카테고리
  const itemHandler = (value) => {
    setItem(value);
  }
  // 메일전송 유무(체크박스)
  const mailCheckboxHandler = (e) => {
    setMailCheckBox(e.target.checked)

    if (e.target.checked) {
      setShowMailComment(true);
    } else {
      setShowMailComment(false)
      setJpMailComment("");
      setCnMailComment("");
      setEnMailComment("");
    }
  };
  // 메일 커멘트
  const jpMailCommentHandler = (e) => {
    setJpMailComment(e.target.value)
  };
  const cnMailCommentHandler = (e) => {
    setCnMailComment(e.target.value)
  };
  const enMailCommentHandler = (e) => {
    setEnMailComment(e.target.value)
  };
  // 세일대상 제외(체크박스)
  const saleExceptCheckboxHandler = (e) => {
    setExceptCheckBox(e.target.checked)

    if (e.target.checked) {
      setShowExcept(true);
      setMailCheckBox(false);
      setShowMailComment(false);
      setJpMailComment("");
      setEnMailComment("");
      setCnMailComment("");
      setShowMinAmount(false);
      setMinAmount("")
    } else {
      setShowExcept(false);

      // 세일타입이 할인금액인 경우 최소금액을 보여준다
      if (Type === SaleType[2].key) {
        setShowMinAmount(true);
      } else {
        setShowMinAmount(false);
      }
    }
  };
  // 최소금액
  const minAmountHandler = (e) => {
    setMinAmount(e.target.value)
  };

  const onOk = (value) => {
    console.log('onOk: ', value);
  }

  // 메일 송신
  const sendMail = async(body) => {
    try {
      if (!ExceptCheckBox) {
        if (window.confirm("Do you want to send mail to all users?")) {
          // 세일정보인 경우 모든 사용자와 관리자에게 메일을 보낸다
          await axios.post(`${MAIL_SERVER}/sale`, body);
        } else {
          setMailCheckBox(false);
        }
      } else {
        // 세일제외정보인 경우 관리자에게만 메일을 보낸다
        await axios.post(`${MAIL_SERVER}/saleExcept`, body);
      }
    } catch(err) {
      setMailCheckBox(false);
      console.log("err: ",err);
    }
  }

  // 상품검색(검색버튼)
  const productPopupHandler = () => {
    window.open(`/coupon/product/${Item}`,"product list","width=550, height=700, top=10, left=10");
  }
  // 상품검색(크리어버튼)
  const productClearHandler = () => {
    setProductId("");
    setProductName("");
  }
  // 상품 검색 팝업창에서 productId를 전달받음
  window.productClickHandler = function (productId) {
    setProductId(productId);
    // 상품정보 가져오기
    getProduct(productId)
  };
  // 상품이름 가져오기
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

  return (
    <Formik
      initialValues={{
        code: '',
        amount: '',
      }}
      validationSchema={Yup.object().shape({
        code: Yup.string()
          .max(4, 'Must be exactly 4 characters')
          .required('Code is required'),
        amount: Yup.string()
          .required('Discount rate or discount amount is required')
      })}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {

          // 카테고리가 ALL인데 상품이 지정되어 있는경우
          if (Item === MainCategory[0].key) {
            if (ProductId !== "") {
              alert("If the category is ALL, you cannot designate a product");
              
              setSubmitting(false);
              return false;
            }
          }
          // 세일타입이 할인금액이 아닌데 최소금액에 값이있는경우
          if (Type !== SaleType[2].key) {
            console.log("MinAmount: ", MinAmount);

            if (MinAmount !== "") {
              alert("The minimum amount can be set only for the discount amount");

              setSubmitting(false);
              return false;
            }
          }

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
          // 최소금액 체크
          if (MinAmount !== "") {
            // 금액 체크
            if (isNaN(Number(MinAmount))) {
              alert("Only numbers can be entered for the minimum amount");

              setSubmitting(false);
              return false;
            }
            if (Number(MinAmount) < 1) {
              alert("Only positive numbers can be entered for the minimum minimum amount");
              
              setSubmitting(false);
              return false;
            }
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

          // 세일 정보 셋팅
          let body = {
            code: values.code,
            type: Type,
            amount: values.amount,
            minAmount: MinAmount,
            item: Item,
            active: "1", // 활성
            validFrom: ExpirationPeriod[0],
            validTo: ExpirationPeriod[1],
            productId: ProductId,
            sendMail: MailCheckBox,
            cnMailComment: CnMailComment,
            jpMailComment: JpMailComment,
            enMailComment: EnMailComment,
            except: ExceptCheckBox
          };

          // 세일 제외대상 등록인 경우
          if (ExceptCheckBox) {
            // 세일 제외대상 에서 ALL은 선택할수 없다 
            if (Item === 0) {
              alert("You cannot select category ALL in sales exclusion information");
              setSubmitting(false);
              return false;
            }
          }

          try {
            // 세일이 이미 존재하는지 확인
            axios.post(`${SALE_SERVER}/exist`, body)
            .then(response => {
              // 세일정보가 존재하면 에러
              if (response.data.success) {
                if (response.data.saleInfos.length > 0) {
                  alert("The same kind of sale exists within the period");
                  return false;
                } else {
                  // 세일이 존재하지 않으면 세일 등록
                  axios.post(`${SALE_SERVER}/register`, body)
                  .then(response => {
                    if (response.data.success) {
                      // 메일 송신 (메일송신에 체크되어 있거나 세일대상제외에 체크되어 있을때)
                      if (MailCheckBox || ExceptCheckBox) {
                        sendMail(body)
                      }
                      alert('Sale has been registered');
                      // 세일 정상등록 후 리스트 페이지로 이동
                      history.push("/sale/list");
                    } 
                  });
                }
              } else {
                // 같은 세일코드가 존재하는 경우
                alert("There are duplicate sale codes");
                return false;
              }
            })
          } catch (err) {
            alert("Please contact the administrator");
            console.log("Sale register err: ", err);
          }
          
        setSubmitting(false);
      }, 500);
    }}
    >
      {props => {
        const { values, touched, errors, isSubmitting, handleChange, handleBlur, handleSubmit, } = props;
        return (
          <div className="app">
            <h1>{t('Sale.regTitle')}</h1><br />
            
            <Form style={{ minWidth: '500px' }} {...formItemLayout} onSubmit={handleSubmit} >
              {/* 세일코드 */}
              <Form.Item required label={t('Sale.code')} >
                <Input id="code" placeholder="Sale code" type="text" value={values.code} 
                  onChange={handleChange} 
                  onBlur={handleBlur} 
                  style={{ width: 250 }} 
                  className={ errors.code && touched.code ? 'text-input error' : 'text-input' }
                />
                {errors.code && touched.code && (<div className="input-feedback">{errors.code}</div>)}
              </Form.Item>
              {/* 세일종류 */}
              <Form.Item required label={t('Sale.type')} >
                <Select value={Type} style={{ width: 250 }} onChange={typeHandler}>
                {types.map(item => (
                  <Option key={item.key} value={item.key}> {item.value} </Option>
                ))}
                </Select>
              </Form.Item>
              {/* 세일할인율 또는 금액 */}
              <Form.Item required label={t('Sale.amount')} >
                <Input id="amount" placeholder="Sale amount" type="text" value={values.amount} 
                  onChange={handleChange} 
                  onBlur={handleBlur} 
                  style={{ width: 250 }} 
                  className={ errors.amount && touched.amount ? 'text-input error' : 'text-input' }
                />
                {errors.amount && touched.amount && (<div className="input-feedback">{errors.amount}</div>)}
              </Form.Item>
              {/* 세일할인 최소금액 */}
              {ShowMinAmount &&
                <Form.Item label={t('Sale.minAmount')} >
                  <Input id="minAmount" placeholder="Sale discount minimum amount" type="text" value={MinAmount} onChange={minAmountHandler} 
                    onBlur={handleBlur}
                    style={{ width: 250 }}
                  />
                </Form.Item> 
              }
              {/* 세일 유효기간 */}
              <Form.Item required label={t('Sale.validTo')}>
                <RangePicker 
                  id="validTo" 
                  format={dateFormat}
                  onChange={dateHandler}
                  onOk={onOk} 
                  style={{ width: 250 }} 
                />
              </Form.Item>
              {/* 세일 카테고리 */}
              <Form.Item required label={t('Sale.item')} >
                <Select value={Item} style={{ width: 250 }} onChange={itemHandler}>
                {items.map(item => (
                  <Option key={item.key} value={item.key}> {item.value} </Option>
                ))}
                </Select>
              </Form.Item>
              {/* 세일적용 상품 아이디 */}
              <Form.Item label={t('Sale.product')} >
                <Input id="userId" placeholder="Enter product" type="text" value={ProductName} style={{ width: 110 }} readOnly/>&nbsp;
                <Button onClick={productPopupHandler} style={{width: '70px'}}>Search</Button>&nbsp;
                <Button onClick={productClearHandler} style={{width: '65px'}}>Clear</Button>
                <br />
              </Form.Item>
              {/* 메일전송 유무 */}
              {!ShowExcept &&
                <Form.Item label={t('Sale.sendMail')} >
                  <Checkbox checked={MailCheckBox} onChange={mailCheckboxHandler} />
                </Form.Item>
              }
              { ShowMailComment &&
                <Form.Item label={t('Sale.jpMailComment')} >
                  <TextArea style={{ width: 250 }} maxLength={500} rows={1} placeholder="Mail comment" value={JpMailComment} onChange={jpMailCommentHandler} />
                </Form.Item>
              }
              { ShowMailComment &&
                <Form.Item label={t('Sale.cnMailComment')} >
                  <TextArea style={{ width: 250 }} maxLength={500} rows={1} placeholder="Mail comment" value={CnMailComment} onChange={cnMailCommentHandler} />
                </Form.Item>
              }
              { ShowMailComment &&
                <Form.Item label={t('Sale.enMailComment')} >
                  <TextArea style={{ width: 250 }} maxLength={500} rows={1} placeholder="Mail comment" value={EnMailComment} onChange={enMailCommentHandler} />
                </Form.Item>
              }
              {/* 세일대상 제외 */}
              <Form.Item label={t('Sale.saleExcept')} >
                <Checkbox checked={ExceptCheckBox} onChange={saleExceptCheckboxHandler} />
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

export default SaleRegisterPage