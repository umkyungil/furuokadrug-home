import React, {useEffect, useState} from "react";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { updateCustomer } from "../../../_actions/customer_actions";
import { useDispatch } from "react-redux";
import { Form, Input, Button } from 'antd';
import axios from 'axios';
import { CUSTOMER_SERVER } from '../../Config.js';
// CORS 대책
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

function CustomerUpdatePage(props) {
  const dispatch = useDispatch();
  const [Id, setId] = useState("");
  const [SmaregiId, setSmaregiId] = useState("");
  const [Name, setName] = useState("");
  const [Tel, setTel] = useState("");
  const [Email, setEmail] = useState("");
  const [Address, setAddress] = useState("");
  const [Salesman, setSalesman] = useState("");
  const [Point, setPoint] = useState("");

  // query string 취득
  const customerId = props.match.params.customerId;

  // 고객정보 취득
  useEffect(() => {
    axios.get(`${CUSTOMER_SERVER}/customers_by_id?id=${customerId}&type=single`)
      .then(response => {

        if (response.data.success) {
          setId(response.data.customer[0]._id);
          setSmaregiId(response.data.customer[0].smaregiId);
          setName(response.data.customer[0].name);
          setTel(response.data.customer[0].tel);
          setEmail(response.data.customer[0].email);
          setAddress(response.data.customer[0].address);
          setSalesman(response.data.customer[0].salesman);
          setPoint(response.data.customer[0].point);
        } else {
          alert("Failed to get customer information.")
        }
      })
  }, [])

  const smaregiIdChangeHandler = (event) => {
    setSmaregiId(event.currentTarget.value);
  }
  const nameChangeHandler = (event) => {
    setName(event.currentTarget.value);
  }
  const telChangeHandler = (event) => {
    setTel(event.currentTarget.value);
  }
  const emailChangeHandler = (event) => {
    setEmail(event.currentTarget.value);
  }
  const addressChangehandler = (event) => {
    setAddress(event.currentTarget.value);
  }
  const salesmanChangeHandler = (event) => {
    setSalesman(event.currentTarget.value);
  }
  const pointChangeHandler = (event) => {
    setPoint(event.currentTarget.value);
  }

  return (
    <Formik
      initialValues={{ smaregiId: '', name: '', tel: '', email: '', address: '', salesman: '', point: '' }}
      validationSchema={Yup.object().shape({
        //name: Yup.string().required('Name is required'),
        //salesman: Yup.string().required('SalesMan is required')
      })}

      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {

          let dataToSubmit = {
            id: Id,
            smaregiId: SmaregiId,
            name: Name,
            tel: Tel,
            email: Email,
            address: Address,
            salesman: Salesman,
            point: Point
          };

          dispatch(updateCustomer(dataToSubmit)).then(response => {
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
        const { values, touched, errors, isSubmitting, handleChange, handleBlur, handleSubmit, } = props;

        return (
          <div className="app">
            <h2>Customer Update</h2>
            <br />
            <Form style={{ minWidth: '375px' }} {...formItemLayout} onSubmit={handleSubmit} >

              <Form.Item label="Smaregi ID">
                <Input
                  id="smaregiId"
                  placeholder="Enter the customer's Smaregi id"
                  type="text"
                  value={SmaregiId}
                  onChange={smaregiIdChangeHandler}
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
                  value={Name}
                  onChange={nameChangeHandler}
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
                  value={Tel}
                  onChange={telChangeHandler}
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
                  value={Email}
                  onChange={emailChangeHandler}
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
                  value={Address}
                  onChange={addressChangehandler}
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
                  value={Salesman}
                  onChange={salesmanChangeHandler}
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
                  value={Point}
                  onChange={pointChangeHandler}
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

export default CustomerUpdatePage