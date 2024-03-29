import React, { useState, useEffect, useContext } from "react";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { passwordConfirm } from "../../../_actions/user_actions";
import { useDispatch } from "react-redux";
import { useHistory } from 'react-router-dom';
import { Form, Input, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { MAIL_SERVER } from '../../Config';
import { LanguageContext } from '../../context/LanguageContext';
import { getLanguage, setHtmlLangProps, getMessage } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

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

function UserPasswordConfirmPage(props) {
  const [UserId, setUserId] = useState({});
  const dispatch = useDispatch();
  const history = useHistory();
  const {isLanguage, setIsLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  useEffect(() => {
    if (!props.match.params.userId) {
      alert(getMessage(getLanguage(), 'key001'));
      history.push("/");
    } else {
      // 다국어 설정
      const lang = getLanguage(isLanguage);
      i18n.changeLanguage(lang);
      setIsLanguage(lang);

      // HTML lang속성 변경
      setHtmlLangProps(lang);

      // query string 취득
      setUserId(props.match.params.userId);
    }
  }, [isLanguage])

  // Landing pageへ戻る
  const listHandler = () => {
    history.push("/");
  }

  // 메일 송신 & 메일 이력등록
  const sendEmail = async (dataToSubmit) => {
    try {
      const result = await axios.post(`${MAIL_SERVER}/passwordConfirm`, dataToSubmit);
      console.log("sendEmail result: ", result);

      if (!result.data.success) {
        console.log("UserPasswordChangeConfirmPage: Failed to send mail");
        return false;
      }
      return true;
    } catch(err) {
      console.log("UserPasswordChangeConfirmPage sendEmail err: ", err);
      return false;
    }
  }

  return (
    <Formik
      initialValues={{
        password: '',
        confirmPassword: '',
      }}
      validationSchema={Yup.object().shape({
        password: Yup.string()
          .min(6, getMessage(getLanguage(), 'key031'))
          .required(getMessage(getLanguage(), 'key027')),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref('password'), null], getMessage(getLanguage(), 'key030'))
          .required(getMessage(getLanguage(), 'key028')),
      })}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          let dataToSubmit = {
            userId: UserId,
            password: values.password
          };

          // 비밀번호 변경처리
          dispatch(passwordConfirm(dataToSubmit))
          .then(response => {
            if (response.payload.success) {
              dataToSubmit.name = response.payload.user.name;
              dataToSubmit.lastName = response.payload.user.lastName;
              dataToSubmit.email = response.payload.user.email;
              dataToSubmit.lastLogin = response.payload.user.lastLogin;
              dataToSubmit.passwordChangedAt = response.payload.user.passwordChangedAt;

              // 비밀번호 변경성공시 메일 전송
              const mailResult = sendEmail(dataToSubmit);
              mailResult.then((res) => {
                console.log(res);
                if (res) {
                  alert(getMessage(getLanguage(), 'key017'));
                  history.push("/login");
                } else {
                  alert(getMessage(getLanguage(), 'key001'));
                  history.push("/login");
                }
              });
            } else {
              alert(getMessage(getLanguage(), 'key001'));
              history.push("/login");
            }
          }).catch( function(err) {
            console.log("UserPasswordChangeConfirmPage submit err: ", err);
            alert(getMessage(getLanguage(), 'key001'));
            history.push("/login");
          })

          setSubmitting(false);
        }, 500);
      }}
    >
      {props => {
        const { values, touched, errors, isSubmitting, handleChange, handleBlur, handleSubmit, } = props;
        return (
          <div className="app">
            <div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'}>
              <h1>{t('Password.subTitle')}</h1>
            </div>
            <br />

            <Form className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} style={{ minWidth: '350px' }} {...formItemLayout} onSubmit={handleSubmit} >
              {/* 비밀번호 */}
              <Form.Item required label={t('Password.password')} hasFeedback validateStatus={errors.password && touched.password ? "error" : 'success'} >
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
                </Button>
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

export default UserPasswordConfirmPage;