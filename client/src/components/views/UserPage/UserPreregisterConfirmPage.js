import React, { useState, useEffect } from "react";
import moment from "moment";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { preregisterConfirmUser } from "../../../_actions/user_actions";
import { useDispatch } from "react-redux";
import { useHistory } from 'react-router-dom';
import { Select, Form, Input, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { MAIL_SERVER, USER_SERVER } from '../../Config';
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

function UserPreregisterConfirmPage(props) {
  const [Id, setId] = useState("");
  const [Name, setName] = useState("");
  const [LastName, setLastName] = useState("");
  const [Language, setLanguage] = useState("");
  const [Email, setEmail] = useState("");
  const dispatch = useDispatch();
  const history = useHistory();
  const {t, i18n} = useTranslation();

  useEffect(() => {
		// 다국어 설정
		i18n.changeLanguage(localStorage.getItem("i18nextLng"));
    // query string 취득
    const userId = props.match.params.userId;
    // 사용자 정보 취득
    getUser(userId);
  }, [])

  // Landing pageへ戻る
  const listHandler = () => {
    history.push("/");
  }
  // 핸들러
  const languageHandler = (value) => {
    setLanguage(value);
  }

  // 사용자 정보 취득
  const getUser = async (userId) => {
    try {
      const result = await axios.get(`${USER_SERVER}/users_by_id?id=${userId}&type=single`);
      
      if (result.data.success) {
        setId(userId);
        setName(result.data.user[0].name);
        setEmail(result.data.user[0].email);
        setLastName(result.data.user[0].lastName);
        setLanguage(result.data.user[0].language);
      } else {
        alert("Please contact the administrator");
        history.push("/");
      }      
    } catch (err) {
      console.log("UserPreregisterConfirmPage err: ",err);
      alert("Please contact the administrator");
      history.push("/");
    }
  }

  // 메일송신 & 메일 이력등록
  const sendEmail = async (dataToSubmit) => {
    const body = {
      name: dataToSubmit.name,
      email: dataToSubmit.email
    }
    try {
      const result = await axios.post(`${MAIL_SERVER}/register`, body);

      if (!result.data.success) {
        console.log("UserPreregisterConfirmPage: Failed to send mail");
        return false;
      } 
      return true;
    } catch(err) {
      console.log("UserPreregisterConfirmPage err: ", err);
      return false;
    }
  }

  return (
    <Formik
      initialValues={{
        name: '',
        lastName: '',
        birthday: '',
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
        language: ''
      }}
      validationSchema={Yup.object().shape({
        tel: Yup.string()
          .required('Telephone number is required'),
        birthday: Yup.string()
          .required('Date of birth is required'),
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
          const birthday = values.birthday;
          
          if (birthday.length !== 8) {
            alert("Must be exactly 8 characters");
            setSubmitting(false);
            return false;
          }
          if (isNaN(Number(birthday))) {
            alert("Only numbers can be entered for the birthday");
            setSubmitting(false);
            return false;
          }
          if (Number(birthday) < 1) {
            alert("Only positive numbers can be entered for the birthday");
            setSubmitting(false);
            return false;
          }

          let dataToSubmit = {
            userId: Id,
            name: Name,
            lastName: LastName,
            birthday: values.birthday,
            email: Email,
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
            role: '0',
            image: `http://gravatar.com/avatar/${moment().unix()}?d=identicon`,
            language: Language,
            deletedAt: ''
          };

          dispatch(preregisterConfirmUser(dataToSubmit))
          .then(response => {
            if (response.payload.success) {
              // 회원가입 성공시 메일 전송
              const mailResult = sendEmail(dataToSubmit);
              mailResult.then((res) => {
                if (res) {
                  alert("Membership registration has been completed");
                  props.history.push("/login");
                } else {
                  alert("Request user registration again.\nPlease try again later.");
                  history.push("/");
                }
              });
            } else {
              alert("Request user registration again.\nPlease try again later.");
              history.push("/");
            }
          })
          .catch( function(err) {
            alert("Request user registration again.\nPlease try again later.");
            history.push("/");
          })

          setSubmitting(false);
        }, 500);
      }}
    >
      {props => {
        const { values, touched, errors, isSubmitting, handleChange, handleBlur, handleSubmit, } = props;
        return (
          <div className="app">
            <br />
            <br />
            <br />
            <br />
            <br />
            <br />
            
            <h1>{t('SignUp.title')}</h1><br />
            <Form style={{ minWidth: '500px' }} {...formItemLayout} onSubmit={handleSubmit} >
              {/* 이름 */}  
              <Form.Item label={t('SignUp.name')} style={{ marginBottom: 0, }} >
                {/* 성 */}
                <Form.Item name="name" style={{ display: 'inline-block', width: 'calc(50% - 8px)'}} >
                  <Input id="name" placeholder="Enter your name" type="text" value={Name} readOnly />
                </Form.Item>
                {/* 이름 */}
                <Form.Item name="lastName" style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '0 8px', }} >
                  <Input id="lastName" placeholder="Enter your last Name" type="text" value={LastName} readOnly />
                </Form.Item>
              </Form.Item>
              {/* 생년월일 */}
              <Form.Item required label={t('SignUp.birth')} >
                <Input id="birthday" placeholder="ex) 19700911" type="text" value={values.birthday} onChange={handleChange} onBlur={handleBlur}
                  className={ errors.birthday && touched.birthday ? 'text-input error' : 'text-input' } />
                {errors.birthday && touched.birthday && (
                  <div className="input-feedback">{errors.birthday}</div>
                )}
              </Form.Item>
              {/* 메일주소 */}
              <Form.Item label={t('SignUp.email')}  >
                <Input id="email" placeholder="Enter your Email" type="email" value={Email} readOnly/>
              </Form.Item>
              {/* 전화번호 */}
              <Form.Item required label={t('SignUp.tel')} >
                <Input id="tel" placeholder="Enter your tel number" type="text" value={values.tel} onChange={handleChange} onBlur={handleBlur}
                  className={ errors.tel && touched.tel ? 'text-input error' : 'text-input' } />
                {errors.tel && touched.tel && (
                  <div className="input-feedback">{errors.tel}</div>
                )}
              </Form.Item>

              {/* 배송지 주소1 */}
              <Form.Item required label={t('SignUp.address1')} >
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
              <Form.Item label={t('SignUp.address2')} >
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
              {/* 배송지 주소3 */}
              <Form.Item label={t('SignUp.address3')} >
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
              <Form.Item required label={t('SignUp.language')} >
                <Select value={Language} style={{ width: 120 }} onChange={languageHandler}>
                  <Option value="jp">日本語</Option>
                  <Option value="en">English</Option>
                  <Option value="cn">中文（簡体）</Option>
                </Select>&nbsp;&nbsp;
              </Form.Item>
              {/* 비밀번호 */}
              <Form.Item required label={t('SignUp.password')} hasFeedback validateStatus={errors.password && touched.password ? "error" : 'success'} >
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

export default UserPreregisterConfirmPage