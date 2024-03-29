import React, { useState, useEffect, useContext } from "react";
import moment from "moment";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { registerUser } from "../../../_actions/user_actions";
import { useDispatch } from "react-redux";
import { useHistory } from 'react-router-dom';
import { Select, Form, Input, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { MAIL_SERVER } from '../../Config';
import { ENGLISH, JAPANESE, CHINESE } from '../../utils/Const';
import { LanguageContext } from '../../context/LanguageContext';
import { getLanguage, setHtmlLangProps, getMessage } from '../../utils/CommonFunction';

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
    }
  }
};

function UserRegisterPage(props) {
  const [Language, setLanguage] = useState("jp");
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

  // Landing pageへ戻る
  const listHandler = () => {
    history.push("/");
  }  
  // 언어 설정
  const selectHandler = (value) => {
    setLanguage(value);
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
        console.log("UseRegisterPage: Failed to send mail");
        return false;
      } 
      return true;
    } catch(err) {
      console.log("UseRegisterPage sendEmail err: ", err);
      return false;
    }
  }

  return (
    <Formik
      initialValues={{
        name: '',
        lastName: '',
        birthday: '',
        email: '',
        tel: '',
        password: '',
        confirmPassword: '',
        address1: '',
        zip1: '',
        receiver1: '',
        tel1: '',
        address2: '',
        zip2: '',
        receiver2: '',
        tel2: '',
        address3: '',
        zip3: '',
        receiver3: '',
        tel3: '',
        language: ''
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string().required(getMessage(getLanguage(), 'key023')),
        lastName: Yup.string().required(getMessage(getLanguage(), 'key022')),
        birthday: Yup.string().required(getMessage(getLanguage(), 'key005')),
        email: Yup.string()
          .email(getMessage(getLanguage(), 'key029'))
          .required(getMessage(getLanguage(), 'key026')),
        tel: Yup.string().required(getMessage(getLanguage(), 'key006')),
        address1: Yup.string().required(getMessage(getLanguage(), 'key007')),
        zip1: Yup.string().required(getMessage(getLanguage(), 'key008')),
        receiver1: Yup.string().required(getMessage(getLanguage(), 'key009')),
        tel1: Yup.string().required(getMessage(getLanguage(), 'key010')),
        password: Yup.string()
          .min(6, getMessage(getLanguage(), 'key031'))
          .required(getMessage(getLanguage(), 'key027')),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref('password'), null], getMessage(getLanguage(), 'key030'))
          .required(getMessage(getLanguage(), 'key028')),
      })}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          const birthday = values.birthday;
          
          if (birthday.length !== 8) {
            alert(getMessage(getLanguage(), 'key011'));
            setSubmitting(false);
            return false;
          }
          if (isNaN(Number(birthday))) {
            alert(getMessage(getLanguage(), 'key012'));
            setSubmitting(false);
            return false;
          }
          if (Number(birthday) < 1) {
            alert(getMessage(getLanguage(), 'key013'));
            setSubmitting(false);
            return false;
          }

          let dataToSubmit = {
            name: values.name,
            lastName: values.lastName,
            birthday: values.birthday,
            email: values.email,
            tel: values.tel,
            password: values.password,
            address1: values.address1,
            zip1: values.zip1,
            receiver1: values.receiver1,
            tel1: values.tel1,
            address2: values.address2,
            zip2: values.zip2,
            receiver2: values.receiver2,
            tel2: values.tel2,
            address3: values.address3,
            zip3: values.zip3,
            receiver3: values.receiver3,
            tel3: values.tel3,
            image: `http://gravatar.com/avatar/${moment().unix()}?d=identicon`,
            language: Language,
            deletedAt: ''
          };

          dispatch(registerUser(dataToSubmit))
          .then(response => {
            if (response.payload.success) {
              // 회원가입 성공시 메일 전송
              const mailResult = sendEmail(dataToSubmit);
              mailResult.then((res) => {
                if (res) {
                  alert(getMessage(getLanguage(), 'key018'));
                  history.push("/login");
                } else {
                  alert(getMessage(getLanguage(), 'key019'));
                  history.push("/");
                }
              });
            } else {
              alert(getMessage(getLanguage(), 'key019'));
              history.push("/");
            }
          })
          .catch( function(err) {
            console.log("UseRegisterPage submit err: ", err);
            alert(getMessage(getLanguage(), 'key019'));
            props.history.push("/");
          })

          setSubmitting(false);
        }, 500);
      }}
    >
      {props => {
        const { values, touched, errors, isSubmitting, handleChange, handleBlur, handleSubmit, } = props;
        return (
          <div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} style={{ maxWidth: '700px', margin: '2rem auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
              <h1>{t('User.regTitle')}</h1>
            </div>
            
            <Form style={{height:'80%', margin:'1em'}} {...formItemLayout} onSubmit={handleSubmit} autoComplete="off" >
              {/* 이름 */}
              <Form.Item required label={t('SignUp.name')} style={{ marginBottom: 0, }} >
                {/* 성 */}
                <Form.Item name="lastName" required style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '0 8px', }} >
                  <Input id="lastName" placeholder="Enter your last name" type="text" value={values.lastName} onChange={handleChange} 
                    onBlur={handleBlur} className={ errors.lastName && touched.lastName ? 'text-input error' : 'text-input' } />
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
              {/* 생년월일 */}
              <Form.Item required label={t('SignUp.birth')} >
                <Input id="birthday" placeholder="ex) 19700911" type="text" value={values.birthday} onChange={handleChange} onBlur={handleBlur}
                  className={ errors.birthday && touched.birthday ? 'text-input error' : 'text-input' } />
                {errors.birthday && touched.birthday && (
                  <div className="input-feedback">{errors.birthday}</div>
                )}
              </Form.Item>
              {/* 메일주소 */}
              <Form.Item required label={t('SignUp.email')} hasFeedback validateStatus={errors.email && touched.email ? "error" : 'success'}>
                <Input id="email" placeholder="Enter your email" type="email" value={values.email} onChange={handleChange} onBlur={handleBlur}
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
                {/* 우편번호1 */}
                <Form.Item name="zip1" required style={{ display: 'inline-block', width: '32%' }} >
                  <Input id="zip1" placeholder="Zip code" type="text" value={values.zip1} onChange={handleChange} onBlur={handleBlur} 
                    className={ errors.zip1 && touched.zip1 ? 'text-input error' : 'text-input' } />
                  {errors.zip1 && touched.zip1 && (
                    <div className="input-feedback">{errors.zip1}</div>
                  )}
                </Form.Item>
                {/* 받는사람 이름1 */}
                <Form.Item name="receiver1" required style={{ display: 'inline-block', width: '32%', margin: '0 4px', }} >
                  <Input id="receiver1" placeholder="Receiver" type="text" value={values.receiver1} onChange={handleChange} onBlur={handleBlur} 
                    className={ errors.receiver1 && touched.receiver1 ? 'text-input error' : 'text-input' } />
                  {errors.receiver1 && touched.address1 && (
                    <div className="input-feedback">{errors.receiver1}</div>
                  )}
                </Form.Item>
                {/* 받는사람 전화번호1 */}
                <Form.Item name="tel1" required style={{ display: 'inline-block', width: '32%', margin: '0 1px', }} >
                  <Input id="tel1" placeholder="Phone number" type="text" value={values.tel1} onChange={handleChange} onBlur={handleBlur}
                    className={ errors.tel1 && touched.tel1 ? 'text-input error' : 'text-input' } />
                  {errors.tel1 && touched.tel1 && (
                    <div className="input-feedback">{errors.tel1}</div>
                  )}
                </Form.Item>
              </Form.Item>
              {/* 배송지 주소2 */}
              <Form.Item label={t('SignUp.address2')}>
                <Input id="address2" placeholder="Enter your shipping address" type="text" value={values.address2} onChange={handleChange} onBlur={handleBlur} />
              </Form.Item>
              {/* 배송지 주소2 상세*/}
              <Form.Item label={t('SignUp.addressDetail2')} style={{ marginBottom: 0, }} >
                {/* 우편번호2 */}
                <Form.Item name="zip2" required style={{ display: 'inline-block', width: '32%'}} >
                  <Input id="zip2" placeholder="Zip code" type="text" value={values.zip2} onChange={handleChange} onBlur={handleBlur} />
                </Form.Item>
                {/* 받는사람 이름2 */}
                <Form.Item name="receiver2" style={{ display: 'inline-block', width: '32%', margin: '0 4px', }} >
                  <Input id="receiver2" placeholder="Receiver" type="text" value={values.receiver2} onChange={handleChange} onBlur={handleBlur} />
                </Form.Item>
                {/* 받는사람 전화번호2 */}
                <Form.Item name="tel2" style={{ display: 'inline-block', width: '32%', margin: '0 1px', }} >
                  <Input id="tel2" placeholder="Phone number" type="text" value={values.tel2} onChange={handleChange} onBlur={handleBlur} />
                </Form.Item>
              </Form.Item>

              {/* 주소3 */}
              <Form.Item label={t('SignUp.address3')}>
                <Input id="address3" placeholder="Enter your shipping address" type="text" value={values.address3} onChange={handleChange} onBlur={handleBlur} />
              </Form.Item>
              {/* 배송지 주소3 상세 */}
              <Form.Item label={t('SignUp.addressDetail3')} style={{ marginBottom: 0, }} >
                {/* 우편번호3 */}
                <Form.Item name="zip3" required style={{ display: 'inline-block', width: '32%' }} >
                  <Input id="zip3" placeholder="Zip code" type="text" value={values.zip3} onChange={handleChange} onBlur={handleBlur} />
                </Form.Item>
                {/* 받는사람 이름3 */}
                <Form.Item name="receiver3" style={{ display: 'inline-block', width: '32%', margin: '0 4px', }} >
                  <Input id="receiver3" placeholder="Receiver" type="text" value={values.receiver3} onChange={handleChange} onBlur={handleBlur} />
                </Form.Item>
                {/* 받는사람 전화번호3 */}
                <Form.Item name="tel3" style={{ display: 'inline-block', width: '32%', margin: '0 1px'}} >
                  <Input id="tel3" placeholder="Phone number" type="text" value={values.tel3} onChange={handleChange} onBlur={handleBlur} />
                </Form.Item>
              </Form.Item>
              {/* 언어 */}
              <Form.Item required label={t('SignUp.language')}>
                <Select defaultValue="jp" style={{ width: 120 }} onChange={selectHandler}>
                  <Option value="jp">{JAPANESE}</Option>
                  <Option value="en">{ENGLISH}</Option>
                  <Option value="cn">{CHINESE}</Option>
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
                  id="confirmPassword" placeholder="Enter your confirm password" type="password" value={values.confirmPassword} onChange={handleChange} onBlur={handleBlur}
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
              <br />
            
            </Form>
          </div>
        );
      }}
    </Formik>
  );
};

export default UserRegisterPage;