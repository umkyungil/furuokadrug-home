import React from "react";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { registerCustomer } from "../../../_actions/customer_actions";
import { useDispatch } from "react-redux";
import { Form, Input, Button } from 'antd';

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

function CustomerRegisterPage(props) {
  const dispatch = useDispatch();
  return (

    <Formik
      initialValues={{
        smaregiId: '',
        name: '',
        tel: '',
        lastName: '',
        email: '',
        address: '',
        salesman: '',
        point: ''
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string()
          .required('Name is required'),
        salesman: Yup.string()
          .required('SalesMan is required')
      })}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {

          let dataToSubmit = {
            smaregiId: values.smaregiId,
            name: values.name,
            lastname: values.lastname,
            tel: values.tel,
            email: values.email,
            address: values.address,
            salesman: values.salesman
          };

          dispatch(registerCustomer(dataToSubmit)).then(response => {
            if (response.payload.success) {
              props.history.push("/");
            } else {
              alert(response.payload.err.errmsg)
            }
          })

          setSubmitting(false);
        }, 500);
      }}
    >
      {props => {
        const {
          values,
          touched,
          errors,
          isSubmitting,
          handleChange,
          handleBlur,
          handleSubmit,
        } = props;
        return (
          <div className="app">
            <h2>Customer Register</h2>
            <Form style={{ minWidth: '375px' }} {...formItemLayout} onSubmit={handleSubmit} >

              <Form.Item label="Smaregi ID">
                <Input
                  id="smaregiId"
                  placeholder="Enter the customer's Smaregi id"
                  type="text"
                  value={values.smaregiId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.smaregiId && touched.smaregiId ? 'text-input error' : 'text-input'}
                />
                {errors.smaregiId && touched.smaregiId && (
                  <div className="input-feedback">{errors.smaregiId}</div>
                )}
              </Form.Item>

              <Form.Item required label="Name">
                <Input
                  id="name"
                  placeholder="Enter the customer's name"
                  type="text"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.name && touched.name ? 'text-input error' : 'text-input'}
                />
                {errors.name && touched.name && (
                  <div className="input-feedback">{errors.name}</div>
                )}
              </Form.Item>

              <Form.Item label="Last Name">
                <Input
                  id="lastName"
                  placeholder="Enter the customer's last name"
                  type="text"
                  value={values.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.lastName && touched.lastName ? 'text-input error' : 'text-input'}
                />
                {errors.lastName && touched.lastName && (
                  <div className="input-feedback">{errors.lastName}</div>
                )}
              </Form.Item>

              <Form.Item label="Phone number" validateStatus={errors.tel && touched.tel ? "error" : 'success'}>
                <Input
                  id="tel"
                  placeholder="Enter the customer's phone number"
                  type="text"
                  value={values.tel}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.tel && touched.tel ? 'text-input error' : 'text-input'}
                />
                {errors.tel && touched.tel && (
                  <div className="input-feedback">{errors.tel}</div>
                )}
              </Form.Item>

              <Form.Item label="Email" hasFeedback validateStatus={errors.email && touched.email ? "error" : 'success'}>
                <Input
                  id="email"
                  placeholder="Enter the customer's email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.email && touched.email ? 'text-input error' : 'text-input'}
                />
                {errors.email && touched.email && (
                  <div className="input-feedback">{errors.email}</div>
                )}
              </Form.Item>

              <Form.Item label="Address" validateStatus={errors.address && touched.address ? "error" : 'success'}>
                <Input
                  id="address"
                  placeholder="Enter the customer's address"
                  type="text"
                  value={values.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.address && touched.address ? 'text-input error' : 'text-input'}
                />
                {errors.address && touched.address && (
                  <div className="input-feedback">{errors.address}</div>
                )}
              </Form.Item>

              <Form.Item required label="Salesman" validateStatus={errors.salesman && touched.salesman ? "error" : 'success'}>
                <Input
                  id="salesman"
                  placeholder="Enter your sales representative"
                  type="text"
                  value={values.salesman}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.salesman && touched.salesman ? 'text-input error' : 'text-input'}
                />
                {errors.salesman && touched.salesman && (
                  <div className="input-feedback">{errors.salesman}</div>
                )}
              </Form.Item>

              <Form.Item label="Point" validateStatus={errors.point && touched.point ? "error" : 'success'}>
                <Input
                  id="point"
                  placeholder="Enter your sales representative"
                  type="text"
                  value={values.point}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.point && touched.point ? 'text-input error' : 'text-input'}
                />
                {errors.point && touched.point && (
                  <div className="input-feedback">{errors.point}</div>
                )}
              </Form.Item>

              <Form.Item {...tailFormItemLayout}>
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

export default CustomerRegisterPage