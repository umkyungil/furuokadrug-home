import React, { useState, useEffect } from "react";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useHistory } from 'react-router-dom';
import { DatePicker, Select, Form, Input, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { COUPON_SERVER } from '../../Config';
import swal from 'sweetalert';
import moment from 'moment';
import axios from 'axios';
// CORS 대책
axios.defaults.withCredentials = true;

const {Option} = Select;
const {RangePicker} = DatePicker;
const dateFormat = 'YYYY/MM/DD';

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

function CouponRegisterPage(props) {
  let date = new Date();
  const fromDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
  const tmpDate = new Date(date.setFullYear(date.getFullYear() + 1));
  const toDate = new Date(tmpDate.getTime() - (tmpDate.getTimezoneOffset() * 60000)).toISOString();

  const [SelectItem, setSelectItem] = useState("1");
  const [ExpirationPeriod, setExpirationPeriod] = useState([fromDate, toDate]);
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
  // 언어 설정
  const selectHandler = (value) => {
    setSelectItem(value);
  }
  // 유효일자
  const dateHandler = (value, dateString) => {
    if(dateString[0] == "" && dateString[0] == "") {
      setExpirationPeriod([]);
    } else {
      setExpirationPeriod(dateString);
    }
  }
  const onOk = (value) => {
    console.log('onOk: ', value);
  }

  return (
    <Formik
      initialValues={{
        code: '',
        description: '',
        active: SelectItem,
        discountRate: '',
        expirationPeriod: ExpirationPeriod
      }}
      validationSchema={Yup.object().shape({
        code: Yup.string()
          .required('Code is required'),
        description: Yup.string()
          .required('Description is required'),
        discountRate: Yup.string()
          .required('Discount rate is required'),
        expirationPeriod: Yup.array()
          .required('Expiration period is required')
      })}
      onSubmit={(values, { setSubmitting }) => {
        const tmpDate = new Date();
        const curDate = new Date(tmpDate.getTime() - (tmpDate.getTimezoneOffset() * 60000)).toISOString();
        const endDate = new Date(ExpirationPeriod[1]);

        console.log("curDate: ", curDate);
        console.log("endDate: ", endDate);

        if (curDate >= endDate) {
          alert("Past dates cannot be used");
          setSubmitting(false);
          return false;
        }

        // 할인율 숫자체크
        if(isNaN(values.discountRate)) {
          alert("Please enter a number only for the discount rate");
          setSubmitting(false);
          return false;
        }

        setTimeout(() => {
          let dataToSubmit = {
            code: values.code,
            description: values.description,
            active: SelectItem,
            discountRate: values.discountRate,
            validFrom: ExpirationPeriod[0],
            validTo: ExpirationPeriod[1]
          };

          console.log("dataToSubmit: ", dataToSubmit);

          axios.post(`${COUPON_SERVER}/register`, dataToSubmit)
          .then(response => {
            if (response.data.success) {
              console.log('Order information registration success');
            } else {
              swal({
                title: "An error occurred in registering payment information",
                text: "Please contact the administrator.",
                icon: "error",
                button: "OK",
              }).then((value) => {
                history.push("/coupon/list");
              });
            }
          });

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
                <Input id="code" placeholder="Enter code" type="text" value={values.code} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                />
                {errors.code && touched.code && (
                  <div className="input-feedback">{errors.code}</div>
                )}
              </Form.Item>
              {/* 쿠폰설명 */}
              <Form.Item required label={t('Coupon.description')} >
                <Input id="description" placeholder="Enter description" type="text" value={values.description} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                />
                {errors.description && touched.description && (
                  <div className="input-feedback">{errors.description}</div>
                )}
              </Form.Item>
              {/* 사용가능 여부 */}
              <Form.Item required label={t('Coupon.active')}>
                <Select defaultValue="1" style={{ width: 120 }} onChange={selectHandler}>
                  <Option value="1">active</Option>
                  <Option value="0">inactive</Option>
                </Select>&nbsp;&nbsp;
              </Form.Item>
              {/* 유효기간 */}
              <Form.Item required label={t('Coupon.expirationPeriod')}>
                <RangePicker 
                  id="expirationPeriod" 
                  defaultValue={[moment(fromDate, dateFormat), moment(toDate, dateFormat)]}
                  // showTime={{ format: 'HH:mm' }}
                  format={dateFormat}
                  onChange={dateHandler}
                  onOk={onOk}
                />
                {errors.expirationPeriod && touched.expirationPeriod && (
                  <div className="input-feedback">{errors.expirationPeriod}</div>
                )}
              </Form.Item>
              {/* 할인율 */}
              <Form.Item required label={t('Coupon.discountRate')}>
                <Input id="discountRate" placeholder="Enter discount rate" type="text" value={values.discountRate} 
                  onChange={handleChange} 
                  onBlur={handleBlur}
                />
                {errors.discountRate && touched.discountRate && (
                  <div className="input-feedback">{errors.discountRate}</div>
                )}
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