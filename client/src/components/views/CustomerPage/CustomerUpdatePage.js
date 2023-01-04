import React, {useEffect, useState} from "react";
import { Formik } from 'formik';
import { updateCustomer } from "../../../_actions/customer_actions";
import { useDispatch } from "react-redux";
import { Form, Input, Button } from 'antd';
import axios from 'axios';
import { CUSTOMER_SERVER } from '../../Config.js';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const [Address1, setAddress1] = useState("");
  const [Address2, setAddress2] = useState("");
  const [Address3, setAddress3] = useState("");
  const [Salesman, setSalesman] = useState("");
  const [Point, setPoint] = useState("");
  const {t, i18n} = useTranslation();
  
  useEffect(() => {
    // 다국적언어
    i18n.changeLanguage(localStorage.getItem("i18nextLng"));
    // query string 취득
    const customerId = props.match.params.customerId;
    // 고객정보 취득
    getCustomer(customerId);
  }, [])

  // 고객정보 취득
  const getCustomer = async (customerId) => {
    try {
      const result = await axios.get(`${CUSTOMER_SERVER}/customers_by_id?id=${customerId}&type=single`);

      if (result.data.success) {
        // 값 대입
        setId(result.data.customer[0]._id);
        setSmaregiId(result.data.customer[0].smaregiId);
        setName(result.data.customer[0].name);
        setTel(result.data.customer[0].tel);
        setEmail(result.data.customer[0].email);
        setAddress1(result.data.customer[0].address1);
        setAddress2(result.data.customer[0].address2);
        setAddress3(result.data.customer[0].address3);
        setSalesman(result.data.customer[0].salesman);
        setPoint(result.data.customer[0].point);
      } else {
        alert("Failed to get customer information.")
      }
    } catch (err) {
      console.log("CustomerUpdatePage err: ",err);
    }
  }

  // 스마레지 ID 핸들러
  const smaregiIdChangeHandler = (event) => {
    setSmaregiId(event.currentTarget.value);
  }
  // 이름 핸들러
  const nameChangeHandler = (event) => {
    setName(event.currentTarget.value);
  }
  // 전호번호 핸들러
  const telChangeHandler = (event) => {
    setTel(event.currentTarget.value);
  }
  // 이메일 핸들러
  const emailChangeHandler = (event) => {
    setEmail(event.currentTarget.value);
  }
  // 주소1 핸들러
  const address1Changehandler = (event) => {
    setAddress1(event.currentTarget.value);
  }
  // 주소2 핸들러
  const address2Changehandler = (event) => {
    setAddress2(event.currentTarget.value);
  }
  // 주소3 핸들러
  const address3Changehandler = (event) => {
    setAddress3(event.currentTarget.value);
  }
  // 스텝 핸들러
  const salesmanChangeHandler = (event) => {
    setSalesman(event.currentTarget.value);
  }
  // 포인트 핸들러
  const pointChangeHandler = (event) => {
    setPoint(event.currentTarget.value);
  }

  // 고객일람 페이지 이동
  const history = useHistory();
  const listHandler = () => {
    history.push("/customer/list");
  }

  return (
    <Formik
      // initialValues={{ smaregiId: '', name: '', tel: '', email: '', address: '', salesman: '', point: '' }}
      // validationSchema={Yup.object().shape({
        // name: Yup.string().required('Name is required'),
        // salesman: Yup.string().required('SalesMan is required')
      // })}
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          let dataToSubmit = {
            id: Id,
            smaregiId: SmaregiId,
            name: Name,
            tel: Tel,
            email: Email,
            address1: Address1,
            address2: Address2,
            address3: Address3,
            salesman: Salesman,
            point: Point
          };

          let bol = true;
          if (Name === "" ) {                        
            alert("Name is required");
            bol = false;
          }

          if (Tel === "" ) {                        
            alert("Telephone number is required");
            bol = false;
          }
          if (Email === "" ) {                        
            alert("Email is required");
            bol = false;
          }
          if (Address1 === "" ) {                        
            alert("Address1 is required");
            bol = false;
          }
          if (Salesman === "" ) {                        
            alert("Salesman is required");
            bol = false;
          }

          if (bol) {
            dispatch(updateCustomer(dataToSubmit)).then(response => {
              if (response.payload.success) {
                props.history.push("/customer/list");
              } else {
                console.log(response.payload.err);
                alert("This is a registered email.")
              }
            })
          }

          setSubmitting(false);
        }, 500);
      }}
    >
      {props => {
        const { values, touched, errors, isSubmitting, handleChange, handleBlur, handleSubmit, } = props;
        return (
          <div className="app">
            <h1>{t('Customer.updateTitle')}</h1>
            <br />
            <Form style={{ minWidth: '375px' }} {...formItemLayout} onSubmit={handleSubmit} >
              <Form.Item label={t('Customer.smaregiId')}>
                <Input id="smaregiId" placeholder="Enter the customer's Smaregi id" type="text" value={SmaregiId} 
                  onChange={smaregiIdChangeHandler} onBlur={handleBlur} required />
              </Form.Item>
              <Form.Item required label={t('Customer.name')}>
                <Input id="name" placeholder="Enter the customer's name" type="text" value={Name} 
                  onChange={nameChangeHandler} onBlur={handleBlur} required />
              </Form.Item>
              <Form.Item required label={t('Customer.tel')} >
                <Input id="tel" placeholder="Enter the customer's phone number" type="text" value={Tel}
                  onChange={telChangeHandler} onBlur={handleBlur} required/>
              </Form.Item>
              <Form.Item required label={t('Customer.email')} >
                <Input id="email" placeholder="Enter the customer's email" type="email" value={Email}
                  onChange={emailChangeHandler} onBlur={handleBlur} required/>
              </Form.Item>
              {/* 주소 */}
              <Form.Item required label={t('Customer.address1')} >
                <Input id="address1" placeholder="Enter the customer's address1" type="text" value={Address1} 
                  onChange={address1Changehandler} onBlur={handleBlur} required />
              </Form.Item>
              <Form.Item label={t('Customer.address2')} >
                <Input id="address2" placeholder="Enter the customer's address2" type="text" value={Address2} 
                  onChange={address2Changehandler} onBlur={handleBlur} />
              </Form.Item>
              <Form.Item label={t('Customer.address3')} >
                <Input id="address3" placeholder="Enter the customer's address3" type="text" value={Address3} 
                  onChange={address3Changehandler} onBlur={handleBlur} />
              </Form.Item>
              <Form.Item required label={t('Customer.salesman')} >
                <Input id="salesman" placeholder="Enter your sales representative" type="text" value={Salesman}
                  onChange={salesmanChangeHandler} onBlur={handleBlur} />
              </Form.Item>
              <Form.Item label={t('Customer.point')} >
                <Input id="point" placeholder="Enter your sales representative" type="text" value={Point}
                  onChange={pointChangeHandler} onBlur={handleBlur} />
              </Form.Item>
              <Form.Item {...tailFormItemLayout}>
                <Button onClick={listHandler}>
                  Customer List
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

export default CustomerUpdatePage