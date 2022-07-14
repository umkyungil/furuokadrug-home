import React, { useState, useEffect } from "react";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { preregisterUser } from "../../../_actions/user_actions";
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

function UserPreregisterPage(props) {
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

  // 메일송신
  const sendEmail = async (dataToSubmit) => {
    try {
      const result = await axios.post(`${MAIL_SERVER}/preregister`, dataToSubmit);

      if (!result.data.success) {
        console.log("UserRegisterPage: Failed to send mail");
        return false;
      } 
      return true;
    } catch(err) {
      console.log("UserRegisterPage err: ", err);
      return false;
    }
  }

  return (
    <Formik
      initialValues={{
        name: '',
        lastName: '',
        email: '',
        language: SelectItem
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string()
          .required('Name is required'),
        lastName: Yup.string()
          .required('Last Name is required'),
        email: Yup.string()
          .email('Email is invalid')
          .required('Email is required'),
      })}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          let dataToSubmit = {
            name: values.name,
            lastName: values.lastName,
            email: values.email,
            language: SelectItem,
          };

          dispatch(preregisterUser(dataToSubmit)).then(response => {
            if (response.payload.success) {
              // 임시사용자 ID설정
              dataToSubmit._id = response.payload.doc._id;
              // 임시메일 전송
              const mailResult = sendEmail(dataToSubmit);
              mailResult.then((res) => {
                if (res) {
                  swal({
                    title: "Temporary user registration successful",
                    text: "Please continue with the user registration process.",
                    icon: "success",
                    button: "OK",
                  }).then((value) => {
                    props.history.push("/login");
                  });
                } else {
                  swal({
                    title: "Temporary user registration failed",
                    text: "Please inquire at the Contact Us.",
                    icon: "error",
                    button: "OK",
                  }).then((value) => {
                    history.push("/");
                  });
                }
              });
            } else {
              swal({
                title: "Temporary user registration failed",
                text: "Please inquire at the Contact Us.",
                icon: "error",
                button: "OK",
              }).then((value) => {
                history.push("/");
              });
            }
          })
          .catch( function(err) {
            swal({
              title: "Temporary user registration failed",
              text: "Please inquire at the Contact Us.",
              icon: "error",
              button: "OK",
            }).then((value) => {
              history.push("/");
            });
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
                {/* 이름 */}
                <Form.Item name="name" required style={{ display: 'inline-block', width: 'calc(50% - 8px)'}} >
                  <Input id="name" placeholder="Enter your name" type="text" value={values.name} onChange={handleChange} onBlur={handleBlur} 
                    className={ errors.name && touched.name ? 'text-input error' : 'text-input' } />
                  {errors.name && touched.address1 && (
                    <div className="input-feedback">{errors.name}</div>
                  )}
                </Form.Item>
                {/* 성 */}
                <Form.Item name="lastName" required style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '0 8px', }} >
                  <Input id="lastName" placeholder="Enter your last Name" type="text" value={values.lastName} onChange={handleChange} onBlur={handleBlur}
                    className={ errors.lastName && touched.lastName ? 'text-input error' : 'text-input' } />
                  {errors.lastName && touched.lastName && (
                    <div className="input-feedback">{errors.lastName}</div>
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
              {/* 언어 */}
              <Form.Item required label={t('SignUp.language')}>
                <Select defaultValue="jp" style={{ width: 120 }} onChange={selectHandler}>
                  <Option value="jp">日本語</Option>
                  <Option value="en">English</Option>
                  <Option value="cn">中文（簡体）</Option>
                </Select>&nbsp;&nbsp;
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

export default UserPreregisterPage