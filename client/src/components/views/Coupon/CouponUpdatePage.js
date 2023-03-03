import React, {useEffect, useState, useContext} from "react";
import { Formik } from 'formik';
import { useHistory } from 'react-router-dom';
import { DatePicker, Form, Input, Button, Select, Checkbox } from 'antd';
import { useTranslation } from 'react-i18next';
import { MAIN_CATEGORY, CouponType, CouponActive, UseWithSale } from '../../utils/Const';
import { COUPON_SERVER, MAIL_SERVER, PRODUCT_SERVER, USER_SERVER } from '../../Config.js';
import schedule from 'node-schedule'
import axios from 'axios';
import { LanguageContext } from '../../context/LanguageContext';
// CORS 대책
axios.defaults.withCredentials = true;

const { Option } = Select;
const items = MAIN_CATEGORY;
const types = CouponType;
const actives = CouponActive;
const withSale = UseWithSale;

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
  const [MailBatch, setMailBatch] = useState("");
  const [BirthdayCoupon, setBirthdayCoupon] = useState(false);

  const { isLanguage, setIsLanguage } = useContext(LanguageContext);
  const {t, i18n} = useTranslation();
  
  useEffect(() => {
    i18n.changeLanguage(isLanguage);
     // 쿠폰정보 가져오기
    getCoupon(props.match.params.couponId);
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
        let validFrom = couponInfo.validFrom.substring(0, 10);
        setValidFrom(validFrom);
        // 유효기간 종료일 변형
        let validTo = couponInfo.validTo.substring(0, 10);
        setValidTo(validTo);
        if (validTo === "9999-12-31") {
          setBirthdayCoupon(true);
        }
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
      // 쿠폰수정 페이지의 플래그
      body.mod = "modify";

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
      console.log("CouponUpdatePage sendMail err: ",err);
    }
  }

  async function mailBatch(body) {
    const today = new Date();
    // time: 2022-11-11 19:16:17
    const jtc = new Date(MailBatch);

    if (today > jtc) {
      alert("Mail setup time is in the past");
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
        console.log("Batch setting of coupons information edit mail start :", startTime);
        console.log("-------------------------------------------");

        try {
          // 모든 사용자 또는 지정된 사용자와 관리자에게 메일을 보낸다
          await axios.post(`${MAIL_SERVER}/coupon`, body);
        } catch (err) {
          console.log("Failed to send coupon registration mail: ", err);
        }
    })
  }

  // 메일전송 배치
  const mailBatchHandler = (value, dateString) => {
    setMailBatch(dateString);
  }
  const onOk = (value) => {
    console.log('onOk: ', value);
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

          const body = {
            id: Id,
            active: Active,
            sendMail: SendMail,
          };

          try {
            axios.post(`${COUPON_SERVER}/update`, body)
            .then(response => {
              if (response.data.success) {
                sendMail(body);

                alert('Coupon has been edited');
              } else {
                alert('Please contact the administrator');
              }
              // 쿠폰리스트 이동
              history.push("/coupon/list");
            })
          } catch(err) {
            alert('Please contact the administrator');
            console.log("Coupon edit err: ", err);
            // 쿠폰리스트 이동
            history.push("/coupon/list");
          }

          setSubmitting(false);
        }, 500);
      }}
    >
      {props => {
        const { isSubmitting, handleSubmit, } = props;
        return (
          <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h1>{t('Coupon.updateTitle')}</h1>
            </div>
            <Form style={{height:'80%', margin:'1em'}} {...formItemLayout} onSubmit={handleSubmit} autoComplete="off" >
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
              { !BirthdayCoupon &&
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
              }
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
              { !BirthdayCoupon &&
              <Form.Item label={t('Coupon.count')} >
                <Input id="count"  type="text" value={Count} style={{ width: 250 }} readOnly/>
              </Form.Item>
              }
              {/* 쿠폰적용 사용자 아이디 */}
              { !BirthdayCoupon &&
              <Form.Item label={t('Coupon.user')} >
                <Input id="userId" type="text" value={UserName} style={{ width: 250 }} readOnly/>
              </Form.Item>
              }
              {/* 메일전송 유무 */}
              { !BirthdayCoupon &&
              <Form.Item label={t('Coupon.sendMail')} >
                <Checkbox checked={SendMail} onChange={sendMailHandler} />
              </Form.Item>
              }
              {/* 메일 예약 */}
              { !BirthdayCoupon && SendMail &&
                <Form.Item label={t('Sale.mailBatch')}>
                  <DatePicker showTime onChange={mailBatchHandler} onOk={onOk} />
                </Form.Item>
              }

              <Form.Item {...tailFormItemLayout}>
                <Button onClick={listHandler}>
                  　List　
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