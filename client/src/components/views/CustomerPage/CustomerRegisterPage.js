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
        email: '',
        address1: '',
        address2: '',
        address3: '',
        salesman: '',
        point: ''
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string()
          .required('Name is required'),
        address1: Yup.string()
          .required('Address1 is required'),
        salesman: Yup.string()
          .required('SalesMan is required')
      })}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {

          let dataToSubmit = {
            smaregiId: values.smaregiId,
            name: values.name,
            tel: values.tel,
            email: values.email,
            address1: values.address1,
            address2: values.address2,
            address3: values.address3,
            salesman: values.salesman
          };

          dispatch(registerCustomer(dataToSubmit)).then(response => {
            if (response.payload.success) {
              props.history.push("/customer/list");
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

              <Form.Item required label="Email" hasFeedback validateStatus={errors.email && touched.email ? "error" : 'success'}>
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

              <Form.Item required label="Address1" validateStatus={errors.address1 && touched.address1 ? "error" : 'success'}>
                <Input id="address1" placeholder="Enter the customer's address1" type="text" value={values.address1} onChange={handleChange} onBlur={handleBlur}
                  className={errors.address1 && touched.address1 ? 'text-input error' : 'text-input'} />
                {errors.address1 && touched.address1 && (
                  <div className="input-feedback">{errors.address1}</div>
                )}
              </Form.Item>

              <Form.Item label="Address2" validateStatus={errors.address2 && touched.address2 ? "error" : 'success'}>
                <Input id="address2" placeholder="Enter the customer's address2" type="text" value={values.address2} onChange={handleChange} onBlur={handleBlur} />
              </Form.Item>

              <Form.Item label="Address3" validateStatus={errors.address3 && touched.address3 ? "error" : 'success'}>
                <Input id="address3" placeholder="Enter the customer's address3" type="text" value={values.address3} onChange={handleChange} onBlur={handleBlur} />
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