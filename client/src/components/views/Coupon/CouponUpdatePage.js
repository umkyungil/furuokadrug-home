import React, {useEffect, useState} from "react";
import { Formik } from 'formik';
import { Form, Input, Button, Select, Checkbox } from 'antd';
import axios from 'axios';
import { COUPON_SERVER, MAIL_SERVER, PRODUCT_SERVER, USER_SERVER } from '../../Config.js';
import { MainCategory, CouponType, CouponActive, UseWithSale } from '../../utils/Const';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// CORS 대책
axios.defaults.withCredentials = true;

const { Option } = Select;
const items = MainCategory;
const types = CouponType;
const actives = CouponActive;
const withSale = UseWithSale;

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

function CouponUpdatePage(props) {
  const [Id, setId] = useState("");
  const [Code, setCode] = useState("");
  const [Type, setType] = useState("");
  const [Amount, setAmount] = useState("");
  const [Active, setActive] = useState("1");
  const [ValidFrom, setValidFrom] = useState("");
  const [ValidTo, setValidTo] = useState("");
  const [Item, setItem] = useState(0);
  const [UseWithSale, setUseWithSale] = useState(0);
  const [Count, setCount] = useState("1");
  const [UserId, setUserId] = useState("");
  const [UserName, setUserName] = useState("");
  const [ProductId, setProductId] = useState("");
  const [ProductName, setProductName] = useState("");
  const [SendMail, setSendMail] = useState(false);
  
  useEffect(() => {
    // 다국적언어
    setMultiLanguage(localStorage.getItem("i18nextLng"));
    // Query string에서 쿠폰ID 가져오기
    const couponId = props.match.params.couponId;
     // 쿠폰정보 가져오기
    getCoupon(couponId);
  }, [])

  // 쿠폰정보 가져오기
  const getCoupon = async (couponId) => {
    try {
      const result = await axios.get(`${COUPON_SERVER}/coupons_by_id?id=${couponId}`);
      
      if (result.data.success) {
        const couponInfo = result.data.couponInfo[0];

        setId(couponInfo._id);          
        setCode(couponInfo.code);
        setType(couponInfo.type);
        setAmount(couponInfo.amount);
        setActive(couponInfo.active);
        setItem(couponInfo.item);
        setUseWithSale(couponInfo.useWithSale);
        setCount(couponInfo.count);
        setSendMail(couponInfo.sendMail);
        
        // 유효기간 시작일 변형
        let validFrom = couponInfo.validFrom;
        setValidFrom(validFrom.substring(0, 10));
        // 유효기간 종료일 변형
        let validTo = couponInfo.validTo;
        setValidTo(validTo.substring(0, 10));
        // 사용자 정보
        if (couponInfo.userId && couponInfo.userId !== "") {
          // 사용자정보 가져오기
          getUserName(couponInfo.userId)
          setUserId(couponInfo.userId);
        }
        // 상품정보
        if (couponInfo.productId && couponInfo.productId !== "") {
          // 상품정보 가져오기
          getProduct(couponInfo.productId)
          setProductId(couponInfo.productId);
        }
      } else {
        alert("Failed to get coupon information")
      }      
    } catch (err) {
      alert("Failed to get coupon information")
      console.log("getCoupon err: ",err);
    }
  }

  //쿠폰리스트 페이지 이동
  const history = useHistory();
  const listHandler = () => {
    history.push("/coupon/list");
  }
  // 쿠폰사용 유무
  const activeHandler = (value) => {
    setActive(value);
  }
  // 메일전송 유무(체크박스)
  const sendMailHandler = (e) => {
    setSendMail(e.target.checked)
  };

  // 사용자정보 가져오기
  const getUserName = async(userId) => {
    try {
      const result = await axios.get(`${USER_SERVER}/users_by_id?id=${userId}`);
      if (result.data.success) {
        setUserName(result.data.user[0].lastName);
      }
    } catch (err) {
      alert("Failed to get user information")
      console.log("getUserName err: ",err);
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
      if (SendMail) {
        if (window.confirm("Do you want to send mail to all users?")) {
          await axios.post(`${MAIL_SERVER}/coupon`, body);
        } else {
          // 관리자에게만 메일을 보낸다
          await axios.post(`${MAIL_SERVER}/coupon/admin`, body);
          setSendMail(false);
        }
      } else {
        // 관리자에게만 메일을 보낸다
        await axios.post(`${MAIL_SERVER}/coupon/admin`, body);
        setSendMail(false);
      }
    } catch(err) {
      setSendMail(false);
      console.log("sendMail err: ",err);
    }
  }

  // 다국적언어 설정
	const {t, i18n} = useTranslation();
  function setMultiLanguage(lang) {
    i18n.changeLanguage(lang);
  }

  // 쿠폰정보 삭제
  const deleteHandler = () => {
    let dataToSubmit = { id: Id };
    try {
      axios.post(`${COUPON_SERVER}/delete`, dataToSubmit)
      .then(response => {
        if (response.data.success) {
          alert('Coupon has been deleted');
        } else {
          alert('Please contact the administrator');
        }
        // 세일리스트 이동
        history.push("/coupon/list");
      })
    } catch(err) {
      console.log("deleteHandler err: ", err);
      alert('Please contact the administrator');
      history.push("/coupon/list");
    }
	}

  return (
    <Formik
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {

          const dataToSubmit = {
            id: Id,
            code: Code,
            type: Type,
            amount: Amount,
            active: Active,
            validFrom: ValidFrom,
            validTo: ValidTo,
            item: Item,
            useWithSale: UseWithSale,
            count: Count,
            userId: UserId,
            productId: ProductId,
            sendMail: SendMail
          };

          console.log("dataToSubmit: ", dataToSubmit);

          try {
            axios.post(`${COUPON_SERVER}/update`, dataToSubmit)
            .then(response => {
              if (response.data.success) {
                sendMail(dataToSubmit);
                alert('Coupon has been edited');
              } else {
                alert('Please contact the administrator');
              }
              // 쿠폰리스트 이동
              history.push("/coupon/list");
            })
          } catch(err) {
            alert('Please contact the administrator');
            console.log("submit err: ", err);
            // 쿠폰리스트 이동
            history.push("/coupon/list");
          }

          setSubmitting(false);
        }, 500);
      }}
    >
      {props => {
        const { values, touched, errors, isSubmitting, handleChange, handleBlur, handleSubmit, } = props;
        return (
          <div className="app">
            <h1>{t('Coupon.updateTitle')}</h1>
            <br />
            <Form style={{ minWidth: '375px' }} {...formItemLayout} onSubmit={handleSubmit} >
              {/* 쿠폰코드 */}
              <Form.Item label={t('Coupon.code')}>
                <Input id="code"  type="text" value={Code} style={{ width: 250 }} readOnly/>
              </Form.Item>
              {/* 쿠폰종류 */}
              <Form.Item label={t('Coupon.type')} >
                <Select value={Type} style={{ width: 250 }} >
                  {types.map(item => {
                    if (item.value === Type) {
                      return (<Option key={item.key} value={item.key} > {item.value} </Option>)
                    } else {
                      return (<Option key={item.key} value={item.key} disabled> {item.value} </Option>)
                    }
                  })}
                </Select>
              </Form.Item>
              {/* 쿠폰할인율 또는 금액 */}
              <Form.Item label={t('Coupon.amount')} >
                <Input id="amount" type="text" value={Amount} style={{ width: 250 }} readOnly/>
              </Form.Item>
              {/* 사용유무 */}
              <Form.Item required label={t('Coupon.active')} >
                <Select value={Active} style={{ width: 250 }} onChange={activeHandler}>
                {actives.map(item => (
                  <Option key={item.key} value={item.key}> {item.value} </Option>
                ))}
                </Select>
              </Form.Item>
              {/* 쿠폰 유효기간 */}
              <Form.Item label={t('Coupon.validTo')} style={{ marginBottom: 0, }} >
                {/* 쿠폰 유효기간 시작 */}
                <Form.Item name="validFrom" style={{ display: 'inline-block', width: 'calc(35% - 8px)'}} >
                  <Input id="validFrom" type="text" value={ValidFrom} readOnly />
                </Form.Item>～
                {/* 쿠폰 유효기간 종료 */}
                <Form.Item name="validTo" style={{ display: 'inline-block', width: 'calc(35% - 8px)', margin: '0 8px', }} >
                  <Input id="validTo" type="text" value={ValidTo} readOnly />
                </Form.Item>
              </Form.Item>
              {/* 쿠폰적용 카테고리 */}
              <Form.Item label={t('Coupon.item')} >
                <Select value={Item} style={{ width: 250 }} >
                {items.map(item => {
                  if (item.value === Item) {
                    return (<Option key={item.key} value={item.key}> {item.value} </Option>)
                  } else {
                    return (<Option key={item.key} value={item.key} disabled> {item.value} </Option>)
                  }
                })}
                </Select>
              </Form.Item>
              {/* 쿠폰적용 상품 아이디 */}
              <Form.Item label={t('Coupon.product')} >
                <Input id="productId" type="text" value={ProductName} style={{ width: 250 }} readOnly/>
              </Form.Item>
              {/* 쿠폰과 세일 병행사용 여부 */}
              <Form.Item label={t('Coupon.useWithSale')} >
                <Select value={UseWithSale} style={{ width: 250 }} >
                  {withSale.map(item => {
                    if (item.value === Type) {
                      return (<Option key={item.key} value={item.key} > {item.value} </Option>)
                    } else {
                      return (<Option key={item.key} value={item.key} disabled> {item.value} </Option>)
                    }
                  })}
                </Select>
              </Form.Item>
              {/* 쿠폰 사용횟수 */}
              <Form.Item label={t('Coupon.count')} >
                <Input id="count"  type="text" value={Count} style={{ width: 250 }} readOnly/>
              </Form.Item>
              {/* 쿠폰적용 사용자 아이디 */}
              <Form.Item label={t('Coupon.user')} >
                <Input id="userId" type="text" value={UserName} style={{ width: 250 }} readOnly/>
              </Form.Item>
              {/* 메일전송 유무 */}
              <Form.Item label={t('Coupon.sendMail')} >
                <Checkbox checked={SendMail} onChange={sendMailHandler} />
              </Form.Item>

              <Form.Item {...tailFormItemLayout}>
                <Button onClick={listHandler}>
                  Coupon List
                </Button>&nbsp;&nbsp;
                <Button onClick={handleSubmit} type="primary" disabled={isSubmitting}>
                  Submit
                </Button>&nbsp;&nbsp;
                <Button onClick={deleteHandler} type="danger">
                  Delete
                </Button>
              </Form.Item>
            </Form>
          </div>
        );
      }}
    </Formik>
  );
};

export default CouponUpdatePage