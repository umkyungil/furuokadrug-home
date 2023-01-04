import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import { loginUser } from "../../../_actions/user_actions";
import { USER_SERVER } from '../../Config';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Form, Icon, Input, Button } from 'antd';
import { useDispatch } from "react-redux";
import { useTranslation } from 'react-i18next';
import { useCookies } from "react-cookie";
import axios from 'axios';
// CORS 대책
axios.defaults.withCredentials = true;

function LoginPage(props) {
  const dispatch = useDispatch();
  const rememberMeChecked = localStorage.getItem("rememberMe") ? true : false;
  const [Cookies, setCookie, removeCookie] = useCookies(["w_auth"]);
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(rememberMeChecked);
  const {t, i18n} = useTranslation();

  useEffect(() => {
		// 다국어 설정
		i18n.changeLanguage(localStorage.getItem("i18nextLng"));
  }, [])

  // const handleRememberMe = () => {
  //   setRememberMe(!rememberMe)
  // };

  const initialEmail = localStorage.getItem("rememberMe") ? localStorage.getItem("rememberMe") : '';

  return (
    <Formik
      initialValues={{
        email: initialEmail,
        password: '',
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email('Email is invalid')
          .required('Email is required'),
        password: Yup.string()
          .min(6, 'Password must be at least 6 characters')
          .required('Password is required'),
      })}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          // 로그인 하기전에 쿠키정보가 있으면 
          if (Cookies.w_auth) {
            // 사용자 정보 가져오기
            const objToken = {"w_auth": Cookies.w_auth}
            axios.post(`${USER_SERVER}/w_auth`, objToken)
            .then( userInfo => {
              if (userInfo.data.user[0]) {
                // 불특정 사용자인 경우 삭제
                let userName = userInfo.data.user[0].name;
                if (userName.substring(0, 9) === "Anonymous") {
                  const objUserId = {"userId": userInfo.data.user[0]._id}
                  axios.post(`${USER_SERVER}/delete`, objUserId)
                  .then( userInfo => {
                    // 쿠키 삭제
                    removeCookie("w_auth");
                    removeCookie("w_authExp");
                    console.log("user delete success: ", userInfo);
                  })
                }
              }
            });
          }
          
          let dataToSubmit = {
            email: values.email,
            password: values.password
          };

          // 로그인 
          dispatch(loginUser(dataToSubmit))
            .then(userInfo => {
              if (userInfo.payload.loginSuccess) {
                // local storage에 등록
                localStorage.setItem('userId', userInfo.payload.userInfo._id);
                localStorage.setItem('userName', userInfo.payload.userInfo.name);
                // session storage에 등록
                sessionStorage.removeItem('userId');
                sessionStorage.removeItem('userName');
                // 사용자 정보의 언어 속송값을 다국어에서 사용하기 위해 로컬스토리지에 셋팅
                if (userInfo.payload.userInfo.language) {
                  localStorage.setItem('i18nextLng', userInfo.payload.userInfo.language);
                }

                if (rememberMe === true) {
                  localStorage.setItem('rememberMe', values.id);
                } else {
                  localStorage.removeItem('rememberMe');
                }
                // 랜딩페이지 이동
                props.history.push("/");
              } else {
                setFormErrorMessage('Check out your Account or Password again')
              }
            })
            .catch(err => {
              setFormErrorMessage('Check out your Account or Password again')
              setTimeout(() => {
                setFormErrorMessage("")
              }, 3000);
            });
          setSubmitting(false);
        }, 500);
      }}
    >
      {props => {
        const {
          values,
          touched,
          errors,
          isSubmitting,
          handleChange,
          handleBlur,
          handleSubmit,
        } = props;
        return (
          <div className="app">
            <h1>{t('Login.title')}</h1>
            
            <form onSubmit={handleSubmit} style={{ width: '350px' }}>
              <Form.Item required>
                <Input
                  id="email"
                  prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="Enter your email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    errors.email && touched.email ? 'text-input error' : 'text-input'
                  }
                />
                {errors.email && touched.email && (
                  <div className="input-feedback">{errors.email}</div>
                )}
              </Form.Item>

              <Form.Item required>
                <Input
                  id="password"
                  prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                  placeholder="Enter your password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={
                    errors.password && touched.password ? 'text-input error' : 'text-input'
                  }
                />
                {errors.password && touched.password && (
                  <div className="input-feedback">{errors.password}</div>
                )}
              </Form.Item>
              {formErrorMessage && (
                <label ><p style={{ color: '#ff0000bf', fontSize: '0.7rem', border: '1px solid', padding: '1rem', borderRadius: '10px' }}>{formErrorMessage}</p></label>
              )}

              <Form.Item>
                {/* <Checkbox id="rememberMe" onChange={handleRememberMe} checked={rememberMe} >Remember me</Checkbox>
                <a className="login-form-forgot" href="/reset_user" style={{ float: 'right' }}>
                  forgot password
                  </a> */}
                <div>
                  <Button type="primary" htmlType="submit" className="login-form-button" style={{ minWidth: '100%' }} disabled={isSubmitting} onSubmit={handleSubmit}>
                    {t('Login.title')}
                </Button>
                </div>
                {t('Login.or')} <a href="/preregister">{t('Login.register')}</a>
                &nbsp;&nbsp;&nbsp;
                <a href="/passwordChange">{t('Password.downTitle')}</a>
              </Form.Item>
            </form>
          </div>
        );
      }}
    </Formik>
  );
};

export default withRouter(LoginPage);