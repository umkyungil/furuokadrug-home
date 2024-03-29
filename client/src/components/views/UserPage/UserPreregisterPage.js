import React, { useState, useEffect, useContext } from "react";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { preregisterUser } from "../../../_actions/user_actions";
import { useDispatch } from "react-redux";
import { useHistory } from 'react-router-dom';
import { Select, Form, Input, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { MAIL_SERVER } from '../../Config';
import { ENGLISH, JAPANESE, CHINESE } from '../../utils/Const';
import { LanguageContext } from '../../context/LanguageContext';
import { getLanguage, setHtmlLangProps, getMessage } from '../../utils/CommonFunction.js';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

const {Option} = Select;
const formItemLayout = {
  labelCol: {
    span: 6
  },
  wrapperCol: {
    span: 14
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
      offset: 6,
    },
  },
};

function UserPreregisterPage(props) {
  const [SelectItem, setSelectItem] = useState("jp");
  const dispatch = useDispatch();
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

  // 언어 설정
  const selectHandler = (value) => {
    setSelectItem(value);
  }

  // 메일송신
  const sendEmail = async (dataToSubmit) => {
    try {
      const result = await axios.post(`${MAIL_SERVER}/preregister`, dataToSubmit);

      if (!result.data.success) {
        console.log("UserPreregisterPage: Failed to send mail");
        return false;
      } 
      return true;
    } catch(err) {
      console.log("UserPreregisterPage sendEmail err: ", err);
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
          .required(getMessage(getLanguage(), 'key023')),
        lastName: Yup.string()
          .required(getMessage(getLanguage(), 'key022')),
        email: Yup.string()
          .email(getMessage(getLanguage(), 'key029'))
          .required(getMessage(getLanguage(), 'key026')),
      })}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          let dataToSubmit = {
            name: values.name,
            lastName: values.lastName,
            email: values.email,
            language: SelectItem,
          };
          // 임시사용자 저장
          dispatch(preregisterUser(dataToSubmit)).then(response => {
            if (response.payload.success) {
              // 임시사용자 ID설정
              dataToSubmit._id = response.payload.doc._id;
              // 임시메일 전송
              const mailResult = sendEmail(dataToSubmit);
              mailResult.then((res) => {
                if (res) {
                  alert(getMessage(getLanguage(), 'key020'));
                  history.push("/login");
                } else {
                  alert(getMessage(getLanguage(), 'key004'));
                  history.push("/");
                }
              });
            } else {
              alert(getMessage(getLanguage(), 'key021'));
            }
          })
          .catch( function(err) {
            console.log("UserPreregisterPage submit err: ", err);
            alert(getMessage(getLanguage(), 'key001'));
            history.push("/");
          })

          setSubmitting(false);
        }, 500);
      }}
    >
      {props => {
        const { values, touched, errors, isSubmitting, handleChange, handleBlur, handleSubmit, } = props;
        return (
          <div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} style={{ maxWidth: '700px', margin: '3rem auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
              <h1>{t('SignUp.title')}</h1>
            </div>

            <Form style={{ height:'80%', margin:'1em' }} {...formItemLayout} onSubmit={handleSubmit} autoComplete="off" >
              {/* 이름 */}
              <Form.Item required label={t('SignUp.name')} style={{ marginBottom: 0, }} >
                {/* 이름 */}
                <Form.Item name="name" required style={{ display: 'inline-block', width: 'calc(50% - 8px)'}} >
                  <Input id="name" placeholder="Enter your name" type="text" value={values.name} 
                    onChange={handleChange} onBlur={handleBlur} 
                    className={ errors.name && touched.name ? 'text-input error' : 'text-input' } />
                  {errors.name && touched.name && (
                    <div className="input-feedback">{errors.name}</div>
                  )}
                </Form.Item>
                {/* 성 */}
                <Form.Item name="lastName" required style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '0 8px', }} >
                  <Input id="lastName" placeholder="Enter your last Name" type="text" value={values.lastName} 
                    onChange={handleChange} onBlur={handleBlur} 
                    className={ errors.lastName && touched.lastName ? 'text-input error' : 'text-input' } />
                  {errors.lastName && touched.lastName && (
                    <div className="input-feedback">{errors.lastName}</div>
                  )}
                </Form.Item>
              </Form.Item>
              {/* 메일주소 */}
              <Form.Item required label={t('SignUp.email')} hasFeedback validateStatus={errors.email && touched.email ? "error" : 'success'}>
                <Input id="email" placeholder="Enter your Email" type="email" value={values.email} 
                  onChange={handleChange} onBlur={handleBlur}
                  className={ errors.email && touched.email ? 'text-input error' : 'text-input' } />
                {errors.email && touched.email && (
                  <div className="input-feedback">{errors.email}</div>
                )}
              </Form.Item>
              {/* 언어 */}
              <Form.Item required label={t('SignUp.language')}>
                <Select defaultValue="jp" style={{ width: 120 }} onChange={selectHandler}>
                  <Option value="jp">{JAPANESE}</Option>
                  <Option value="en">{ENGLISH}</Option>
                  <Option value="cn">{CHINESE}</Option>
                </Select>&nbsp;&nbsp;
              </Form.Item>

              <Form.Item {...tailFormItemLayout}>
                <Button onClick={handleSubmit} type="primary" disabled={isSubmitting}>
                  Send by email for registration
                </Button>
              </Form.Item>
            </Form>
          </div>
        );
      }}
    </Formik>
  );
};

export default UserPreregisterPage;