import React, { useState, useEffect, useContext } from "react";
import moment from "moment";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { registerUser } from "../../../_actions/user_actions";
import { useDispatch } from "react-redux";
import { useHistory } from 'react-router-dom';
import { Select, Form, Input, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import { LanguageContext } from '../../context/LanguageContext';
import '../ProductPage/Sections/product.css';
import { getLanguage } from '../../utils/CommonFunction';

const { TextArea } = Input;
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

function MailRegisterPage(props) {
  const [SelectItem, setSelectItem] = useState("notice");
  const [Message, setMessage] = useState("");
  const dispatch = useDispatch();
  const history = useHistory();

  const {isLanguage, setIsLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  useEffect(() => {
		// 다국어 설정
		i18n.changeLanguage(isLanguage);
  }, [])

  const listHandler = () => {
    history.push("/user/list");
  }
  
  // 언어 설정
  const selectHandler = (value) => {
    setSelectItem(value);
  }

  const messageHandler = (event) => {
    setMessage(event.currentTarget.value)
  }

  return (
    <Formik
      initialValues={{
        name: '',
        lastName: '',
        email: '',
        tel: '',
        password: '',
        confirmPassword: '',
        address1: '',
        address2: '',
        address3: '',
        language: SelectItem,
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string()
          .required('Name is required'),
        lastName: Yup.string()
          .required('Last Name is required'),
        email: Yup.string()
          .email('Email is invalid')
          .required('Email is required'),
        tel: Yup.string()
          .required('Telephone number is required'),
        address1: Yup.string()          
          .required('address is required'),
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
            name: values.name,
            lastName: values.lastName,
            email: values.email,
            tel: values.tel,
            password: values.password,
            address1: values.address1,
            address2: values.address2,
            address3: values.address3,
            image: `http://gravatar.com/avatar/${moment().unix()}?d=identicon`,
            language: SelectItem,
          };

          dispatch(registerUser(dataToSubmit)).then(response => {
            if (response.payload.success) {
              // 회원가입 성공시 메일 전송
              sendEmail(dataToSubmit)
              // 로그인 페이지에 이동
              props.history.push("/login");
            } else {
              alert(response.payload.err.errmsg)
            }
          })

          setSubmitting(false);
        }, 500);
      }}
    >
      {props => {
        const { touched, errors, isSubmitting, handleSubmit, } = props;
        return (
          <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
              <h1>Mail Content Registration</h1>
            </div>

            <Form style={{ height:'80%', margin:'1em' }} {...formItemLayout} onSubmit={handleSubmit} >
              <Form.Item required label= "Mail Type">
                <Select defaultValue="notice" style={{ width: 120 }} onChange={selectHandler}>
                  <Option value="notice">notice</Option>
                  <Option value="inquiry">inquiry</Option>
                  <Option value="reservation">reservation</Option>{/* Virtual Reservation */}
                  <Option value="registration">Registration</Option>{/* User Registration */}
                </Select>&nbsp;&nbsp;
              </Form.Item>
              <Form.Item label="Content(Japanese)" required>
                <TextArea maxLength={100} name="message" label="Message" style={{ height: 120, minWidth: '500px' }} value={Message} 
                onChange={messageHandler} placeholder="Please enter your message" required
                className={ errors.address1 && touched.address1 ? 'text-input error' : 'text-input' } />                
              </Form.Item>
              <Form.Item label="Content(English)" required>
                <TextArea maxLength={100} name="message" label="Message" style={{ height: 120, minWidth: '500px' }} value={Message} onChange={messageHandler} placeholder="Please enter your message" required/>
              </Form.Item>
              <Form.Item label="Content(Chinese)" required>
                <TextArea maxLength={100} name="message" label="Message" style={{ height: 120, minWidth: '500px' }} value={Message} onChange={messageHandler} placeholder="Please enter your message" required/>
              </Form.Item>
              <Form.Item {...tailFormItemLayout}>
                <Button onClick={listHandler}>
                  User List
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

export default MailRegisterPage;