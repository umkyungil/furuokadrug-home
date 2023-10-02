import React, { useEffect, useContext } from "react";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useHistory } from 'react-router-dom';
import { Form, Input, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { MAIL_SERVER, USER_SERVER } from '../../Config';
import { LanguageContext } from '../../context/LanguageContext';
import '../ProductPage/Sections/product.css';
import { getLanguage, setHtmlLangProps } from '../../utils/CommonFunction';

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

function UserPasswordChangePage(props) {
  const history = useHistory();
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
      console.log("getUser err: ", err);
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
      console.log("sendEmail err: ", err);
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
                    alert("Send mail successfully\nPlease continue to change your password");
                    history.push("/login");
                  } else {
                    alert("Please contact the administrator");
                    history.push("/login");
                  }
                });
              } else {
                alert("Please contact the administrator");
                history.push("/login");
              }
            }).catch(function(err) {
              console.log("err: ", err);
              alert("Please contact the administrator");
              history.push("/login");
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
            <div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} >
              <h1>{t('Password.title')}</h1>
            </div>
            <br />

            <Form className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} style={{ minWidth: '350px' }} {...formItemLayout} onSubmit={handleSubmit} >
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

export default UserPasswordChangePage;