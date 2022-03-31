import React from "react";
import moment from "moment";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { registerUser } from "../../../_actions/user_actions";
import { useDispatch } from "react-redux";
import { useHistory } from 'react-router-dom';

import {
  Form,
  Input,
  Button,
} from 'antd';

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

function UserRegisterPage(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const listHandler = () => {
    history.push("/user/list");
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
          .required('Confirm Password is required')
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
            image: `http://gravatar.com/avatar/${moment().unix()}?d=identicon`
          };

          dispatch(registerUser(dataToSubmit)).then(response => {
            if (response.payload.success) {
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
        const { values, touched, errors, isSubmitting, handleChange, handleBlur, handleSubmit, } = props;
        return (
          <div className="app">
            <h2>Sign up</h2>
            <Form style={{ minWidth: '375px' }} {...formItemLayout} onSubmit={handleSubmit} >

              <Form.Item required label="Name">
                <Input id="name" placeholder="Enter your name" type="text" value={values.name} onChange={handleChange} onBlur={handleBlur}
                  className={ errors.name && touched.name ? 'text-input error' : 'text-input'} />
                {errors.name && touched.name && (
                  <div className="input-feedback">{errors.name}</div>
                )}
              </Form.Item>

              <Form.Item required label="Last Name">
                <Input id="lastName" placeholder="Enter your Last Name" type="text" value={values.lastName} onChange={handleChange} onBlur={handleBlur}
                  className={ errors.lastName && touched.lastName ? 'text-input error' : 'text-input' } />
                {errors.lastName && touched.lastName && (
                  <div className="input-feedback">{errors.lastName}</div>
                )}
              </Form.Item>

              <Form.Item required label="Email" hasFeedback validateStatus={errors.email && touched.email ? "error" : 'success'}>
                <Input id="email" placeholder="Enter your Email" type="email" value={values.email} onChange={handleChange} onBlur={handleBlur}
                  className={ errors.email && touched.email ? 'text-input error' : 'text-input' } />
                {errors.email && touched.email && (
                  <div className="input-feedback">{errors.email}</div>
                )}
              </Form.Item>

              <Form.Item required label="Telephone No.">
                <Input id="tel" placeholder="Enter your tel number" type="text" value={values.tel} onChange={handleChange} onBlur={handleBlur}
                  className={ errors.tel && touched.tel ? 'text-input error' : 'text-input' } />
                {errors.tel && touched.tel && (
                  <div className="input-feedback">{errors.tel}</div>
                )}
              </Form.Item>

              <Form.Item required label="address1">
                <Input id="address1" placeholder="Enter your address1" type="text" value={values.address1} onChange={handleChange} onBlur={handleBlur}
                  className={ errors.address1 && touched.address1 ? 'text-input error' : 'text-input' } />
                {errors.address1 && touched.address1 && (
                  <div className="input-feedback">{errors.address1}</div>
                )}
              </Form.Item>

              <Form.Item label="address2">
                <Input id="address2" placeholder="Enter your address2" type="text" value={values.address2} onChange={handleChange} onBlur={handleBlur} />
              </Form.Item>

              <Form.Item label="address3">
                <Input id="address3" placeholder="Enter your address3" type="text" value={values.address3} onChange={handleChange} onBlur={handleBlur} />
              </Form.Item>

              <Form.Item required label="Password" hasFeedback validateStatus={errors.password && touched.password ? "error" : 'success'}>
                <Input id="password" placeholder="Enter your password" type="password" value={values.password} onChange={handleChange} onBlur={handleBlur}
                  className={ errors.password && touched.password ? 'text-input error' : 'text-input' } />
                {errors.password && touched.password && (
                  <div className="input-feedback">{errors.password}</div>
                )}
              </Form.Item>

              <Form.Item required label="Confirm" hasFeedback>
                <Input
                  id="confirmPassword" placeholder="Enter your confirmPassword" type="password" value={values.confirmPassword} onChange={handleChange} onBlur={handleBlur}
                  className={ errors.confirmPassword && touched.confirmPassword ? 'text-input error' : 'text-input' } />
                {errors.confirmPassword && touched.confirmPassword && (
                  <div className="input-feedback">{errors.confirmPassword}</div>
                )}
              </Form.Item>

              <Form.Item {...tailFormItemLayout}>
                <Button onClick={listHandler}>
                  User List
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

export default UserRegisterPage