import React, { useState, useEffect } from "react";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { preregisterUser } from "../../../_actions/user_actions";
import { useDispatch } from "react-redux";
import { useHistory } from 'react-router-dom';
import { Select, Form, Input, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { MAIL_SERVER, USER_SERVER } from '../../Config';
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

function UserPasswordChangePage(props) {
  const history = useHistory();
  const {t, i18n} = useTranslation();

  useEffect(() => {
		// 다국어 설정
		i18n.changeLanguage(localStorage.getItem("i18nextLng"));
  }, [])

  // Landing pageへ戻る
  const listHandler = () => {
    history.push("/");
  }

  // 등록된 사용자인지 확인
  const getUser = async (email) => {
    try {
			const result = await axios.get(`${USER_SERVER}/users_by_email?email=${email}`);
			if (result.data.success) {
        if (result.data.user.length < 1) {
          return false;  
        } else {
          return result.data;
        }
			} else {
				return false;
			}
		} catch (err) {
			return false;
		}
  }

  // 메일송신
  const sendEmail = async (dataToSubmit) => {
    try {
      // 메일송신
      const result = await axios.post(`${MAIL_SERVER}/passwordChange`, dataToSubmit);

      if (!result.data.success) {
        console.log("UserPasswordChangePage: Failed to send mail");
        return false;
      }
      return true;
    } catch(err) {
      console.log("UserPasswordChangePage err: ", err);
      return false;
    }
  }

  return (
    <Formik
      initialValues={{
        email: ''
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email('Email is invalid')
          .required('Email is required'),
      })}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          try {
            // 사용자 확인
            getUser(values.email).then((result) => {
              if (result.success) {
                let dataToSubmit = {
                  userId: result.user._id,
                  name: result.user.name,
                  lastName: result.user.lastName,
                  email: result.user.email
                }
                // 메일전송
                const mailResult = sendEmail(dataToSubmit);
                mailResult.then((res) => {
                  console.log(res);
                  if (res) {
                    swal({
                      title: "Send mail successfully.",
                      text: "Please continue to change your password.",
                      icon: "success",
                      button: "OK",
                    }).then((value) => {
                      history.push("/login");
                    });
                  } else {
                    swal({
                      title: "Failed to send mail",
                      text: "Please check your email address and contact us.",
                      icon: "error",
                      button: "OK",
                    }).then((value) => {
                      history.push("/login");
                    });
                  }
                });
              } else {
                swal({
                  title: "Failed to send mail",
                  text: "Please check your email address and contact us.",
                  icon: "error",
                  button: "OK",
                }).then((value) => {
                  history.push("/");
                });
              }
            }).catch( function(err) {
              swal({
                title: "Failed to change password",
                text: "Please check your email address and contact us.",
                icon: "error",
                button: "OK",
              }).then((value) => {
                history.push("/login");
              })
            });
          } catch (err) {
            console.log("UserListPage err: ",err);
          }
          setSubmitting(false);
        }, 500);
      }}
    >
      {props => {
        const { values, touched, errors, isSubmitting, handleChange, handleBlur, handleSubmit, } = props;
        return (
          <div className="app">
            <h1>{t('Password.title')}</h1><br />
            <Form style={{ minWidth: '500px' }} {...formItemLayout} onSubmit={handleSubmit} >
              {/* 메일주소 */}
              <Form.Item required label={t('SignUp.email')} hasFeedback validateStatus={errors.email && touched.email ? "error" : 'success'}>
                <Input id="email" placeholder="Enter your Email" type="email" value={values.email} onChange={handleChange} onBlur={handleBlur}
                  className={ errors.email && touched.email ? 'text-input error' : 'text-input' } />
                {errors.email && touched.email && (
                  <div className="input-feedback">{errors.email}</div>
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

export default UserPasswordChangePage