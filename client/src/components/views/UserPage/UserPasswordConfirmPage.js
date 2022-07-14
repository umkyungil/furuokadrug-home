import React, { useState, useEffect } from "react";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { passwordConfirm } from "../../../_actions/user_actions";
import { useDispatch } from "react-redux";
import { useHistory } from 'react-router-dom';
import { Select, Form, Input, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { MAIL_SERVER } from '../../Config';
import axios from 'axios';
import swal from 'sweetalert'
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

function UserPasswordConfirmPage(props) {

  const [UserId, setUserId] = useState({});

  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
		// 다국어 설정
		setMultiLanguage(localStorage.getItem("i18nextLng"));
    // query string 취득
    setUserId(props.match.params.userId);

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
      console.log("UserPasswordChangeConfirmPage err: ", err);
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
          .min(6, 'Password must be at least 6 characters')
          .required('Password is required'),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref('password'), null], 'Passwords must match')
          .required('Confirm Password is required'),
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
                  swal({
                    title: "Password change successful",
                    text: "You have successfully changed your password.",
                    icon: "success",
                    button: "OK",
                  }).then((value) => {
                    history.push("/login");
                  });
                } else {
                  swal({
                    title: "Failed to send mail",
                    text: "Please inquire at the Contact Us.",
                    icon: "error",
                    button: "OK",
                  }).then((value) => {
                    history.push("/login");
                  });
                }
              });
            } else {
              swal({
                title: "Failed to change password",
                text: "Please try again later.",
                icon: "error",
                button: "OK",
              }).then((value) => {
                history.push("/login");
              });
            }
          }).catch( function(err) {
            swal({
              title: "Timed out",
              text: "Please request to change your password again.\nPlease try again later.",
              icon: "error",
              button: "OK",
            }).then((value) => {
              history.push("/login");
            })
          })

          setSubmitting(false);
        }, 500);
      }}
    >
      {props => {
        const { values, touched, errors, isSubmitting, handleChange, handleBlur, handleSubmit, } = props;
        return (
          <div className="app">
            <h1>{t('Password.subTitle')}</h1><br />
            <Form style={{ minWidth: '500px' }} {...formItemLayout} onSubmit={handleSubmit} >
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

export default UserPasswordConfirmPage