import React, {useEffect, useState} from "react";
import { Formik } from 'formik';
import * as Yup from 'yup';
import { updateUser } from "../../../_actions/user_actions";
import { useDispatch } from "react-redux";
import { Form, Input, Button, Select } from 'antd';
import axios from 'axios';
import { USER_SERVER } from '../../Config.js';
import { useHistory } from 'react-router-dom';
// CORS 대책
axios.defaults.withCredentials = true;

const { Option } = Select;

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

function UserUpdatePage(props) {
  const dispatch = useDispatch();
  const [Id, setId] = useState("");
  const [Name, setName] = useState("");
  const [LastName, setLastName] = useState("");
  const [Tel, setTel] = useState("");  
  const [Address1, setAddress1] = useState("");
  const [Address2, setAddress2] = useState("");
  const [Address3, setAddress3] = useState("");
  const [Role, setRole] = useState(0);
  const [Language, setLanguage] = useState("");

  // query string 취득
  const userId = props.match.params.userId;

  // 고객정보 취득
  useEffect(() => {
    axios.get(`${USER_SERVER}/users_by_id?id=${userId}&type=single`)
      .then(response => {
        if (response.data.success) {
          console.log("response.data.user[0]: ", response.data.user[0]);
          setId(response.data.user[0]._id);          
          setName(response.data.user[0].name);
          setLastName(response.data.user[0].lastName);
          setTel(response.data.user[0].tel);
          setAddress1(response.data.user[0].address1);
          setAddress2(response.data.user[0].address2);
          setAddress3(response.data.user[0].address3);
          setRole(response.data.user[0].role);
          setLanguage(response.data.user[0].language);

          console.log("Language: ", Language);
        } else {
          alert("Failed to get user information.")
        }
      })
  }, [])

  const nameHandler = (event) => {
    setName(event.currentTarget.value);
  }
  const lastNameHandler = (event) => {
    setLastName(event.currentTarget.value);
  }
  const telHandler = (event) => {
    setTel(event.currentTarget.value);
  }  
  const address1Handler = (event) => {
    setAddress1(event.currentTarget.value);
  }
  const address2Handler = (event) => {
    setAddress2(event.currentTarget.value);
  }
  const address3Handler = (event) => {
    setAddress3(event.currentTarget.value);
  }
  const roleHandler = (value) => {
    setRole(value);
  }
  const languageHandler = (value) => {
    setLanguage(value);
  }

  const history = useHistory();
  const listHandler = () => {
    history.push("/user/list");
  }

  return (
    <Formik
      // initialValues={{ name: Name, lastName: LastName, tel: '', email: '', address1: '', address2: '', address3: '', role: '' }}
      // validationSchema={Yup.object().shape({
      //   name: Yup.string()
      //     .required('Name is required'),
      //   lastName: Yup.string()
      //     .required('Last Name is required'),
      //   tel: Yup.string()
      //     .required('Telephone number is required'),
      //   address1: Yup.string()
      //     .required('Address is required'),
      //   role: Yup.string()
      //     .max(1, 'Role is one digit number')
      //     .required('Role is required')
      // })}

      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          let dataToSubmit = {
            id: Id,
            name: Name,
            lastName: LastName,
            tel: Tel,
            address1: Address1,
            address2: Address2,
            address3: Address3,
            role: Role,
            language: Language
          };

          let bol = true;
          if (Name === "" ) {                        
            alert("Name is required");
            bol = false;
          }
          if (LastName === "" ) {                        
            alert("Last Name is required");
            bol = false;
          }
          if (Tel === "" ) {                        
            alert("Telephone number is required");
            bol = false;
          }
          if (Address1 === "" ) {                        
            alert("Address1 is required");
            bol = false;
          }

          if(bol) {
            dispatch(updateUser(dataToSubmit)).then(response => {
              if (response.payload.success) {
                props.history.push("/user/list");
              } else {
                alert(response.payload.err.errmsg)
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
            <h2>User Update</h2>
            <br />
            <Form style={{ minWidth: '375px' }} {...formItemLayout} onSubmit={handleSubmit} >
              {/* 성명 */}
              <Form.Item required label="Name">
                <Input id="name" placeholder="Enter the user's name" type="text" value={Name} onChange={nameHandler} onBlur={handleBlur} />
              </Form.Item>
              {/* 이름 */}
              <Form.Item required label="Last Name">
                <Input id="lastName" placeholder="Enter your Last Name" type="text" value={LastName} onChange={lastNameHandler} onBlur={handleBlur} />
              </Form.Item>
              {/* 전화 */}
              <Form.Item required label="Telephone number">
                <Input id="tel" placeholder="Enter the user's phone number" type="text" value={Tel} onChange={telHandler} onBlur={handleBlur} />
              </Form.Item>              
              {/* 주소1 */}
              <Form.Item required label="Address1">
                <Input id="address1" placeholder="Enter the user's address1" type="text" value={Address1} onChange={address1Handler} onBlur={handleBlur} />
              </Form.Item>
              {/* 주소2 */}
              <Form.Item label="Address2">
                <Input id="address2" placeholder="Enter the user's address2" type="text" value={Address2} onChange={address2Handler} onBlur={handleBlur} />
              </Form.Item>
              {/* 주소3 */}
              <Form.Item label="Address3">
                <Input id="address3" placeholder="Enter the user's address3" type="text" value={Address3} onChange={address3Handler} onBlur={handleBlur} />
              </Form.Item>
              {/* 권한 */}
              <Form.Item required label="Role">
                <Select value={Role.toString()} style={{ width: 120 }} onChange={roleHandler}>
                  <Option value="0">user</Option>
                  <Option value="1">staff</Option>
                  <Option value="2">admin</Option>
                </Select>
              </Form.Item>
              {/* 권한 */}
              <Form.Item required label="Language">
                <Select value={Language} style={{ width: 120 }} onChange={languageHandler}>
                  <Option value="jp">Japanese</Option>
                  <Option value="en">English</Option>
                  <Option value="cn">Chinese</Option>
                </Select>
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

export default UserUpdatePage