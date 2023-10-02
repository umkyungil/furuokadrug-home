import React, { useState, useEffect, useContext } from "react";
import { Formik } from 'formik';
import { useHistory } from 'react-router-dom';
import { Select, Form, Input, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { MAIN_CATEGORY, CouponType, UseWithSale } from '../../utils/Const';
import { dateFormatYMD } from '../../utils/CommonFunction'
import { COUPON_SERVER, MAIL_SERVER, USER_SERVER, PRODUCT_SERVER } from '../../Config.js'

import { LanguageContext } from '../../context/LanguageContext';
import '../ProductPage/Sections/product.css';
import { getLanguage, setHtmlLangProps } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

const {Option} = Select;
const items = MAIN_CATEGORY; // 쿠폰적용 Item
const types = CouponType;
const sale = UseWithSale;
const formItemLayout = {
  labelCol: {
    span: 6
  },
  wrapperCol: {
    span: 14
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

function CouponBirthRegisterPage() {
  const [Users, setUsers] = useState([]);
  const [CouponCode, setCouponCode] = useState("");
  const [Type, setType] = useState(CouponType[2].key);
  const [Amount, setAmount] = useState("");
  const [Item, setItem] = useState(0);
  const [UseWithSale, setUseWithSale] = useState(1);
  const [ProductId, setProductId] = useState("");
  const [ProductName, setProductName] = useState("");
  const [ProductItem, setProductItem] = useState("");
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

    // 사용자 정보가져오기
    getUsers();
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
  // 쿠폰적용Item
  const itemHandler = (value) => {
    setItem(value);
  }
  // 세일과 병행 사용여부
  const saleHandler = (value) => {
    setUseWithSale(value);
  }
  // 상품 검색(검색버튼)
  const productPopupHandler = () => {
    if (Item === 0) {
      alert("In case of category ALL, product selection is not possible");
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
  // 쿠폰타입의 값
  const amountHandler = (e) => {
    setAmount(e.target.value)
  };
  // 사용자정보 가져오기
  const getUsers = async() => {
    try {
      const users = await axios.get(`${USER_SERVER}/list`);
      if (users.data.success) {
        setUsers(users);
      }
    } catch (err) {
      console.log("getUser err: ",err);
      alert("Failed to get user information");
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
      console.log("getProduct err: ",err);
      alert("Failed to get product information");
    }
  }
  // 메일 송신
  const sendMail = async(body) => {
    try {
      // 쿠폰정보를 등록했으니깐 관리자에게는 메일을 보낸다
      await axios.post(`${MAIL_SERVER}/coupon/birth/admin`, body);
    } catch(err) {
      console.log("CouponBirthRegisterPage sendMail err: ",err);
    }
  }

  return (
    <Formik
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          // 쿠폰코드 체크
          if (CouponCode === "") {
            alert("Code is required");
            setSubmitting(false);
            return false;
          }
          if (CouponCode.length > 4) {
            alert("Must be exactly 4 characters");
            setSubmitting(false);
            return false;
          }
          // 금액 체크
          if (Amount === "") {
            alert("Please enter a value for the sale type");
            setSubmitting(false);
            return false;
          }
          if (isNaN(Number(Amount))) {
            alert("Only numbers can be entered for the amount");
            setSubmitting(false);
            return false;
          }
          if (Number(Amount) < 1) {
            alert("Only positive numbers can be entered for the amount");
            setSubmitting(false);
            return false;
          }
          // 카테고리가 ALL인데 상품이 지정되어 있는경우
          if (Item === MAIN_CATEGORY[0].key) {
            if (ProductId !== "") {
              alert("If the category is ALL, you cannot designate a product");
              setSubmitting(false);
              return false;
            }
          }
          // 카테고리의 상품인지 확인
          if (Item !== MAIN_CATEGORY[0].key) {
            if (ProductId !== "") {
              getProduct(ProductId);
              
              if (Item !== ProductItem) {
                alert("This product does not belong to a category");
                setSubmitting(false);
                return false;
              }
            }
          }

          // 쿠폰 정보 셋팅
          let body = {
            code: CouponCode,
            type: Type,
            amount: Amount,
            validFrom: dateFormatYMD(),
            validTo: "9999-12-31",
            item: Item,
            active: "1", // 활성
            useWithSale: UseWithSale,
            count: "1",
            userId: "",
            productId: ProductId,
            sendMail: true, // 생일자 쿠폰은 사용자의 생일에 메일을 발송하기에 여기서는 관리자에게만 메일을 보낸다 임시로 true로 설정을해 놓는다
          };

          try {
            // 생일자 쿠폰코드가 이미 존재하는지 확인
            axios.post(`${COUPON_SERVER}/birth/list`, body)
            .then(response => {
              // 쿠폰이 존재하면 에러
              if (response.data.success) {
                if (response.data.couponInfos.length > 0) {
                  alert("Please check if the coupon code already exists")

                  return false;
                } else {
                  // 생일자 쿠폰 등록
                  axios.post(`${COUPON_SERVER}/register`, body)
                  .then(response => {
                    if (response.data.success) {
                      // 메일 전송
                      sendMail(body);
                      alert('Coupon has been registered');
                    } else {
                      alert('Please contact the administrator');
                    }
                    // 리스트페이지로 이동
                    history.push("/coupon/list");
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
            console.log("Coupon birthday register err: ", err);
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
              <h1>{t('Coupon.birthRegTitle')}</h1>
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
                <Select value={UseWithSale} onChange={saleHandler}>
                {sale.map(item => (
                  <Option key={item.key} value={item.key}> {item.value} </Option>
                ))}
                </Select>
              </Form.Item>
            
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

export default CouponBirthRegisterPage;