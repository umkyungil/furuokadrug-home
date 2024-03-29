import React, { useState, useEffect, useContext } from "react";
import { withRouter } from "react-router-dom";
import { loginUser } from "../../../_actions/user_actions";
import { CODE_SERVER } from '../../Config';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Form, Icon, Input, Button } from 'antd';
import { useDispatch } from "react-redux";
import { useTranslation } from 'react-i18next';
import cookie from 'react-cookies';
import { LanguageContext } from '../../context/LanguageContext';
import { getLanguage, setHtmlLangProps, getMessage } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

function LoginPage(props) {
  const dispatch = useDispatch();
  const rememberMeChecked = localStorage.getItem("rememberMe") ? true : false;
  const [formErrorMessage, setFormErrorMessage] = useState('');
  const [rememberMe, setRememberMe] = useState(rememberMeChecked);
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
          .email(getMessage(getLanguage(), 'key029'))
          .required(getMessage(getLanguage(), 'key026')),
        password: Yup.string()
          .min(6, getMessage(getLanguage(), 'key031'))
          .required(getMessage(getLanguage(), 'key027')),
      })}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          // 로그인 하기전에 쿠키정보가 있으면 
          if (cookie.load('w_auth')) {
            // 로그인 할때 쿠키가 있으면 삭제
            cookie.remove('w_auth', { path: '/' });
            cookie.remove('w_authExp', { path: '/' });
            // 불특정사용자의 정보가 남아 있을수 있기 때문에 삭제
            sessionStorage.removeItem('userId');
            sessionStorage.removeItem('userName');
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
                
                // 사용자 정보의 언어 속송값을 다국어에서 사용하기 위해 로컬스토리지에 셋팅
                if (userInfo.payload.userInfo.language) {
                  setIsLanguage(userInfo.payload.userInfo.language);
                }

                // 유효시간 가져오기
                axios.get(`${CODE_SERVER}/code_by_code?code=TOKEN`)
                .then( result => {
                  // 세션에 저장
                  sessionStorage.setItem("tokenAddedTime", result.data.codeInfo.value1);
                    
                  // remember
                  if (rememberMe === true) {
                    localStorage.setItem('rememberMe', values.id);
                  } else {
                    localStorage.removeItem('rememberMe');
                  }
                  // 랜딩페이지 이동
                  props.history.push("/");
                });
              } else {
                setFormErrorMessage(getMessage(getLanguage(), 'key129'));
              }
            })
            .catch(err => {
              setFormErrorMessage(getMessage(getLanguage(), 'key129'));
              setTimeout(() => {
                setFormErrorMessage("")
              }, 3000);
            });
          setSubmitting(false);
        }, 500);
      }}
    >
      {props => {
        const { values, touched, errors, isSubmitting, handleChange, handleBlur, handleSubmit, } = props;
        return (
          
          <div className="app">
            <div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} >
              <h1>{t('Login.title')}</h1>
            </div>
            
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
                <div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'}>
                  <Button type="primary" htmlType="submit" className="login-form-button" style={{ minWidth: '100%' }} disabled={isSubmitting} onSubmit={handleSubmit}>
                    {t('Login.title')}
                  </Button>
                </div>
                <span className={isLanguage === "cn" ? 'lanCN' : 'lanJP'}>{t('Login.or')} </span> 
                <a href="/preregister">
                  <span className={isLanguage === "cn" ? 'lanCN' : 'lanJP'}>{t('Login.register')}</span>
                </a>
                &nbsp;
                &nbsp;
                &nbsp;

                <a href="/passwordChange">
                  <span className={isLanguage === "cn" ? 'lanCN' : 'lanJP'}>{t('Password.downTitle')}</span>
                </a>
              </Form.Item>
            </form>
          </div>
        );
      }}
    </Formik>
  );
};

export default withRouter(LoginPage);