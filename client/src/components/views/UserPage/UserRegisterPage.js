import React, { useState, useEffect } from "react";
import moment from "moment";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { registerUser } from "../../../_actions/user_actions";
import { useDispatch } from "react-redux";
import { useHistory } from 'react-router-dom';
import { Select, Form, Input, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { MAIL_SERVER } from '../../Config';
import axios from 'axios';
// CORS 대책
axios.defaults.withCredentials = true;

const {Option} = Select;
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

function UserRegisterPage(props) {
  const [SelectItem, setSelectItem] = useState("jp");
  const dispatch = useDispatch();
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

  // 메일 송신 & 메일 이력등록
  const sendEmail = async (dataToSubmit) => {
    const body = {
      name: dataToSubmit.name,
      email: dataToSubmit.email
    }

    try {
      const result = await axios.post(`${MAIL_SERVER}/register`, body);
      if (result.data.success) {
        history.push("/user/list");
      } else {
        console.log("UserRegisterPage: Failed to send mail");
      }
    } catch(err) {
      console.log("UserRegisterPage err: ", err);
    }
  }

  return (
    <Formik
      initialValues={{
        name: '',
        lastName: '',
        email: '',
        tel: '',
        password: '',
        confirmPassword: '',
        address1: '',
        receiver1: '',
        tel1: '',
        address2: '',
        receiver2: '',
        tel2: '',
        address3: '',
        receiver3: '',
        tel3: '',
        language: SelectItem
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string()
          .required('Name is required'),
        lastName: Yup.string()
          .required('Last name is required'),
        email: Yup.string()
          .email('Email is invalid')
          .required('Email is required'),
        tel: Yup.string()
          .required('Telephone number is required'),
        address1: Yup.string()          
          .required('Address is required'),
        receiver1: Yup.string()          
          .required('Receiver is required'),
        tel1: Yup.string()          
          .required('Telephone is required'),
        password: Yup.string()
          .min(6, 'Password must be at least 6 characters')
          .required('Password is required'),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref('password'), null], 'Passwords must match')
          .required('Confirm Password is required'),
      })}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          let dataToSubmit = {
            name: values.name,
            lastName: values.lastName,
            email: values.email,
            tel: values.tel,
            password: values.password,
            address1: values.address1,
            receiver1: values.receiver1,
            tel1: values.tel1,
            address2: values.address2,
            receiver2: values.receiver2,
            tel2: values.tel2,
            address3: values.address3,
            receiver3: values.receiver3,
            tel3: values.tel3,
            image: `http://gravatar.com/avatar/${moment().unix()}?d=identicon`,
            language: SelectItem,
            deletedAt: ''
          };

          dispatch(registerUser(dataToSubmit)).then(response => {
            if (response.payload.success) {
              // 회원가입 성공시 메일 전송
              sendEmail(dataToSubmit)
              // 로그인 페이지에
              props.history.push("/login");
            } else {
              alert(response.payload.err.errmsg)
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
            <h1>{t('SignUp.title')}</h1><br />
            <Form style={{ minWidth: '500px' }} {...formItemLayout} onSubmit={handleSubmit} >
              {/* 이름 */}
              <Form.Item required label={t('SignUp.name')} style={{ marginBottom: 0, }} >
                {/* 성 */}
                <Form.Item name="lastName" required style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '0 8px', }} >
                  <Input id="lastName" placeholder="Enter your last Name" type="text" value={values.lastName} onChange={handleChange} onBlur={handleBlur}
                    className={ errors.lastName && touched.lastName ? 'text-input error' : 'text-input' } />
                  {errors.lastName && touched.lastName && (
                    <div className="input-feedback">{errors.lastName}</div>
                  )}
                </Form.Item>
                {/* 이름 */}
                <Form.Item name="name" required style={{ display: 'inline-block', width: 'calc(50% - 8px)'}} >
                  <Input id="name" placeholder="Enter your name" type="text" value={values.name} onChange={handleChange} onBlur={handleBlur} 
                    className={ errors.name && touched.name ? 'text-input error' : 'text-input' } />
                  {errors.name && touched.address1 && (
                    <div className="input-feedback">{errors.name}</div>
                  )}
                </Form.Item>
              </Form.Item>
              {/* 메일주소 */}
              <Form.Item required label={t('SignUp.email')} hasFeedback validateStatus={errors.email && touched.email ? "error" : 'success'}>
                <Input id="email" placeholder="Enter your Email" type="email" value={values.email} onChange={handleChange} onBlur={handleBlur}
                  className={ errors.email && touched.email ? 'text-input error' : 'text-input' } />
                {errors.email && touched.email && (
                  <div className="input-feedback">{errors.email}</div>
                )}
              </Form.Item>
              {/* 전화번호 */}
              <Form.Item required label={t('SignUp.tel')}>
                <Input id="tel" placeholder="Enter your tel number" type="text" value={values.tel} onChange={handleChange} onBlur={handleBlur}
                  className={ errors.tel && touched.tel ? 'text-input error' : 'text-input' } />
                {errors.tel && touched.tel && (
                  <div className="input-feedback">{errors.tel}</div>
                )}
              </Form.Item>

              {/* 배송지 주소1 */}
              <Form.Item required label={t('SignUp.address1')}>
                <Input id="address1" placeholder="Enter your shipping address" type="text" value={values.address1} onChange={handleChange} onBlur={handleBlur}
                  className={ errors.address1 && touched.address1 ? 'text-input error' : 'text-input' } />
                {errors.address1 && touched.address1 && (
                  <div className="input-feedback">{errors.address1}</div>
                )}
              </Form.Item>
              {/* 배송지 주소1 상세*/}
              <Form.Item required label={t('SignUp.addressDetail1')} style={{ marginBottom: 0, }} >
                {/* 받는사람 이름1 */}
                <Form.Item name="receiver1" required style={{ display: 'inline-block', width: 'calc(50% - 8px)'}} >
                  <Input id="receiver1" placeholder="Receiver" type="text" value={values.receiver1} onChange={handleChange} onBlur={handleBlur} 
                    className={ errors.receiver1 && touched.receiver1 ? 'text-input error' : 'text-input' } />
                  {errors.receiver1 && touched.address1 && (
                    <div className="input-feedback">{errors.receiver1}</div>
                  )}
                </Form.Item>
                {/* 받는사람 전화번호1 */}
                <Form.Item name="tel1" required style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '0 8px', }} >
                  <Input id="tel1" placeholder="Phone number" type="text" value={values.tel1} onChange={handleChange} onBlur={handleBlur}
                    className={ errors.tel1 && touched.tel1 ? 'text-input error' : 'text-input' } />
                  {errors.tel1 && touched.tel1 && (
                    <div className="input-feedback">{errors.tel1}</div>
                  )}
                </Form.Item>
              </Form.Item>
              {/* 배송지 주소2 */}
              <Form.Item label={t('SignUp.address2')}>
                <Input id="address2" placeholder="Enter your address2" type="text" value={values.address2} onChange={handleChange} onBlur={handleBlur} />
              </Form.Item>
              {/* 배송지 주소2 상세*/}
              <Form.Item label={t('SignUp.addressDetail2')} style={{ marginBottom: 0, }} >
                {/* 받는사람 이름2 */}
                <Form.Item name="receiver2" style={{ display: 'inline-block', width: 'calc(50% - 8px)'}} >
                  <Input id="receiver2" placeholder="Receiver" type="text" value={values.receiver2} onChange={handleChange} onBlur={handleBlur} />
                </Form.Item>
                {/* 받는사람 전화번호2 */}
                <Form.Item name="tel2" style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '0 8px', }} >
                  <Input id="tel2" placeholder="Phone number" type="text" value={values.tel2} onChange={handleChange} onBlur={handleBlur} />
                </Form.Item>
              </Form.Item>

              {/* 주소3 */}
              <Form.Item label={t('SignUp.address3')}>
                <Input id="address3" placeholder="Enter your address3" type="text" value={values.address3} onChange={handleChange} onBlur={handleBlur} />
              </Form.Item>
              {/* 배송지 주소3 상세 */}
              <Form.Item label={t('SignUp.addressDetail3')} style={{ marginBottom: 0, }} >
                {/* 받는사람 이름3 */}
                <Form.Item name="receiver3" style={{ display: 'inline-block', width: 'calc(50% - 8px)'}} >
                  <Input id="receiver3" placeholder="Receiver" type="text" value={values.receiver3} onChange={handleChange} onBlur={handleBlur} />
                </Form.Item>
                {/* 받는사람 전화번호3 */}
                <Form.Item name="tel3" style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '0 8px'}} >
                  <Input id="tel3" placeholder="Phone number" type="text" value={values.tel3} onChange={handleChange} onBlur={handleBlur} />
                </Form.Item>
              </Form.Item>
              {/* 언어 */}
              <Form.Item required label={t('SignUp.language')}>
                <Select defaultValue="jp" style={{ width: 120 }} onChange={selectHandler}>
                  <Option value="jp">日本語</Option>
                  <Option value="en">English</Option>
                  <Option value="cn">中文（簡体）</Option>
                </Select>&nbsp;&nbsp;
              </Form.Item>
              {/* 비밀번호 */}
              <Form.Item required label={t('SignUp.password')} hasFeedback validateStatus={errors.password && touched.password ? "error" : 'success'}>
                <Input id="password" placeholder="Enter your password" type="password" value={values.password} onChange={handleChange} onBlur={handleBlur}
                  className={ errors.password && touched.password ? 'text-input error' : 'text-input' } />
                {errors.password && touched.password && (
                  <div className="input-feedback">{errors.password}</div>
                )}
              </Form.Item>
              {/* 비밀번호 확인 */}
              <Form.Item required label={t('SignUp.confirm')} hasFeedback>
                <Input
                  id="confirmPassword" placeholder="Enter your confirmPassword" type="password" value={values.confirmPassword} onChange={handleChange} onBlur={handleBlur}
                  className={ errors.confirmPassword && touched.confirmPassword ? 'text-input error' : 'text-input' } />
                {errors.confirmPassword && touched.confirmPassword && (
                  <div className="input-feedback">{errors.confirmPassword}</div>
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

export default UserRegisterPage