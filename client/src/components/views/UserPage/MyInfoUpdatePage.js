import React, {useEffect, useState, useContext} from "react";
import { Formik } from 'formik';
import { updateUser } from "../../../_actions/user_actions";
import { useDispatch } from "react-redux";
import { Select, Form, Input, Button } from 'antd';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ENGLISH, JAPANESE, CHINESE } from '../../utils/Const';
import { USER_SERVER } from '../../Config';

import { LanguageContext } from '../../context/LanguageContext';
import '../ProductPage/Sections/product.css';
import { getLanguage, setHtmlLangProps } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
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

function MyInfoUpdatePage(props) {
  const dispatch = useDispatch();
  const {isLanguage, setIsLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  const [Id, setId] = useState("");
  const [Name, setName] = useState("");
  const [LastName, setLastName] = useState("");
  const [Birthday, setBirthday] = useState("");
  const [Tel, setTel] = useState("");  
  const [Address1, setAddress1] = useState("");
  const [Address2, setAddress2] = useState("");
  const [Address3, setAddress3] = useState("");
  const [Zip1, setZip1] = useState("");
  const [Zip2, setZip2] = useState("");
  const [Zip3, setZip3] = useState("");
  const [Receiver1, setReceiver1] = useState("");
  const [Receiver2, setReceiver2] = useState("");
  const [Receiver3, setReceiver3] = useState("");
  const [Tel1, setTel1] = useState("");
  const [Tel2, setTel2] = useState("");
  const [Tel3, setTel3] = useState("");
  const [Role, setRole] = useState(0);
  const [Language, setLanguage] = useState("");
  const [Checked, setChecked] = useState(false);

  useEffect(() => {
    // 다국어 설정
    const lang = getLanguage(isLanguage);
    i18n.changeLanguage(lang);
    setIsLanguage(lang);

    // HTML lang속성 변경
    setHtmlLangProps(lang);

    // 사용자 정보 가져오기
    getUserInfo();
  }, [isLanguage])

  // 사용자 정보 취득
  const getUserInfo = async (userId) => {
    try {
      const userId = props.match.params.userId
      const userInfo = await axios.get(`${USER_SERVER}/users_by_id?id=${userId}&type=single`);
      
      if (userInfo.data.success) {
        setId(userInfo.data.user[0]._id);          
        setName(userInfo.data.user[0].name);
        setLastName(userInfo.data.user[0].lastName);
        setBirthday(userInfo.data.user[0].birthday);
        setTel(userInfo.data.user[0].tel);
        setAddress1(userInfo.data.user[0].address1);
        setAddress2(userInfo.data.user[0].address2);
        setAddress3(userInfo.data.user[0].address3);
        setZip1(userInfo.data.user[0].zip1);
        setZip2(userInfo.data.user[0].zip2);
        setZip3(userInfo.data.user[0].zip3);
        setReceiver1(userInfo.data.user[0].receiver1);
        setReceiver2(userInfo.data.user[0].receiver2);
        setReceiver3(userInfo.data.user[0].receiver3);
        setTel1(userInfo.data.user[0].tel1);
        setTel2(userInfo.data.user[0].tel2);
        setTel3(userInfo.data.user[0].tel3);
        setRole(userInfo.data.user[0].role);
        setLanguage(userInfo.data.user[0].language);
        if (userInfo.data.user[0].deletedAt) {
          setChecked(true);
        } else {
          setChecked(false);
        }
      } else {
        alert("Please contact the administrator");
      }      
    } catch (err) {
      console.log("err: ",err);
      alert("Please contact the administrator");
    }
  }

  const birthdayHandler = (e) => {
    setBirthday(e.target.value);
  }
  const telHandler = (e) => {
    setTel(e.target.value);
  }  
  const address1Handler = (e) => {
    setAddress1(e.target.value);
  }
  const address2Handler = (e) => {
    setAddress2(e.target.value);
  }
  const address3Handler = (e) => {
    setAddress3(e.target.value);
  }
  const zip1Handler = (e) => {
    setZip1(e.target.value);
  }
  const zip2Handler = (e) => {
    setZip2(e.target.value);
  }
  const zip3Handler = (e) => {
    setZip3(e.target.value);
  }
  const receiver1Handler = (e) => {
    setReceiver1(e.target.value);
  }
  const receiver2Handler = (e) => {
    setReceiver2(e.target.value);
  }
  const receiver3Handler = (e) => {
    setReceiver3(e.target.value);
  }
  const tel1Handler = (e) => {
    setTel1(e.target.value);
  }
  const tel2Handler = (e) => {
    setTel2(e.target.value);
  }
  const tel3Handler = (e) => {
    setTel3(e.target.value);
  }
  const languageHandler = (value) => {
    setLanguage(value);
  }
  
  // 사용자일람 페이지 이동
  const history = useHistory();
  const listHandler = () => {
    history.push("/");
  }
  
  const submitHandler = (e) => {
    e.preventDefault();

    if (Birthday === "") {
      alert("Date of birth is required");
      return false;
    }
    if (Tel === "") {
      alert("Telephone number is required");
      return false;
    }
    if (Address1 === "") {
      alert("Address is required");
      return false;
    }
    if (Zip1 === "") {
      alert("Zip code is required");
      return false;
    }
    if (Receiver1 === "") {
      alert("Receiver is required");
      return false;
    }
    if (Tel1 === "") {
      alert("Telephone is required");
      return false;
    }
    if (Birthday.length !== 8) {
      alert("Birthday must be 8 characters long");
      return false;
    }
    if (!Number(Birthday)) {
      alert("Only numbers can be entered for the birthday");
      return false;
    }
    if (Number(Birthday) < 1) {
      alert("Only positive numbers can be entered for the birthday");
      return false;
    }

    let dataToSubmit = {
      id: Id,
      name: Name,
      lastName: LastName,
      birthday: Birthday,
      tel: Tel,
      address1: Address1,
      zip1: Zip1,
      receiver1: Receiver1,
      tel1: Tel1,
      address2: Address2,
      zip2: Zip2,
      receiver2: Receiver2,
      tel2: Tel2,
      address3: Address3,
      zip3: Zip3,
      receiver3: Receiver3,
      tel3: Tel3,
      role: Role,
      language: Language,
      deletedAt: Checked, // 삭제인 경우 서버쪽에서 날짜를 대입
    };

    dispatch(updateUser(dataToSubmit)).then(response => {
      if (response.payload.success) {
        alert('User update was successful');
        props.history.push("/");
      } else {
        alert('Please contact the administrator');
      }
    })
  };

  return (
    <Formik>
      {props => {
        const { isSubmitting, handleBlur, handleSubmit, } = props;
        return (
          <div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} style={{ maxWidth: '700px', margin: '2rem auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
              <h1>MyInfo update</h1>
            </div>
            
            <Form style={{height:'80%', margin:'1em'}} {...formItemLayout} onSubmit={handleSubmit} >
              {/* 성명 */}
              <Form.Item required label={t('User.name')} style={{ marginBottom: 0, }} >
                {/* 이름 */}
                <Form.Item name="name" required style={{ display: 'inline-block', width: 'calc(50% - 8px)'}} >
                  <Input id="name" type="text" value={Name} style={{backgroundColor: '#f2f2f2'}} readOnly />
                </Form.Item>
                {/* 성 */}
                <Form.Item name="lastName" required style={{ display: 'inline-block', width: 'calc(50% - 8px)', margin: '0 8px', }} >
                  <Input id="lastName" type="text" value={LastName} style={{backgroundColor: '#f2f2f2'}} readOnly />
                </Form.Item>
              </Form.Item>
              {/* 생년월일 */}
              <Form.Item required label={t('User.birth')}>
                <Input id="birthday" placeholder="ex) 19700911" type="text" value={Birthday} onChange={birthdayHandler} onBlur={handleBlur} />
              </Form.Item>
              {/* 메일주소는 변경을 못하게 하기 위해 화면에 표시 안한다 */}
              {/* 전화번호 */}
              <Form.Item required label={t('User.tel')}>
                <Input id="tel" placeholder="Phone number" type="text" value={Tel} onChange={telHandler} onBlur={handleBlur} />
              </Form.Item>
              {/* 배송지 주소1 */}
              <Form.Item required label={t('SignUp.address1')}>
                <Input id="address1" placeholder="Shipping address" type="text" value={Address1} onChange={address1Handler} onBlur={handleBlur} />
              </Form.Item>
              {/* 배송지 주소1 상세*/}
              <Form.Item required label={t('SignUp.addressDetail1')} style={{ marginBottom: 0, }} >
                {/* 우편번호1 */}
                <Form.Item name="zip1" required style={{ display: 'inline-block', width: '32%'}} >
                  <Input id="zip1" placeholder="Zip code" type="text" value={Zip1} onChange={zip1Handler} onBlur={handleBlur} />
                </Form.Item>
                {/* 받는사람 이름1 */}
                <Form.Item name="receiver1" required style={{ display: 'inline-block', width: '32%', margin: '0 4px' }} >
                  <Input id="receiver1" placeholder="Receiver" type="text" value={Receiver1} onChange={receiver1Handler} onBlur={handleBlur} />
                </Form.Item>
                {/* 받는사람 전화번호1 */}
                <Form.Item name="tel1" required style={{ display: 'inline-block', width: '32%', margin: '0 1px', }} >
                  <Input id="tel1" placeholder="Phone number" type="text" value={Tel1} onChange={tel1Handler} onBlur={handleBlur} />
                </Form.Item>
              </Form.Item>
              {/* 배송지 주소2 */}
              <Form.Item label={t('SignUp.address2')}>
                <Input id="address2" placeholder="Shipping address" type="text" value={Address2} onChange={address2Handler} onBlur={handleBlur} />
              </Form.Item>
              {/* 배송지 주소2 상세*/}
              <Form.Item label={t('SignUp.addressDetail2')} style={{ marginBottom: 0, }} >
                {/* 우편번호2 */}
                <Form.Item name="zip2" required style={{ display: 'inline-block', width: '32%'}} >
                  <Input id="zip2" placeholder="Zip code" type="text" value={Zip2} onChange={zip2Handler} onBlur={handleBlur} />
                </Form.Item>
                {/* 받는사람 이름2 */}
                <Form.Item name="receiver2" style={{ display: 'inline-block', width: '32%', margin: '0 4px' }} >
                  <Input id="receiver2" placeholder="Receiver" type="text" value={Receiver2} onChange={receiver2Handler} onBlur={handleBlur} />
                </Form.Item>
                {/* 받는사람 전화번호2 */}
                <Form.Item name="tel2" style={{ display: 'inline-block', width: '32%', margin: '0 1px', }} >
                  <Input id="tel2" placeholder="Phone number" type="text" value={Tel2} onChange={tel2Handler} onBlur={handleBlur} />
                </Form.Item>
              </Form.Item>
              {/* 주소3 */}
              <Form.Item label={t('SignUp.address3')}>
                <Input id="address3" placeholder="Shipping address" type="text" value={Address3} onChange={address3Handler} onBlur={handleBlur} />
              </Form.Item>
              {/* 배송지 주소3 상세 */}
              <Form.Item label={t('SignUp.addressDetail3')} style={{ marginBottom: 0, }} >
                {/* 우편번호3 */}
                <Form.Item name="zip3" required style={{ display: 'inline-block', width: '32%'}} >
                  <Input id="zip3" placeholder="Zip code" type="text" value={Zip3} onChange={zip3Handler} onBlur={handleBlur} />
                </Form.Item>
                {/* 받는사람 이름3 */}
                <Form.Item name="receiver3" style={{ display: 'inline-block', width: '32%', margin: '0 4px' }} >
                  <Input id="receiver3" placeholder="Receiver" type="text" value={Receiver3} onChange={receiver3Handler} onBlur={handleBlur} />
                </Form.Item>
                {/* 받는사람 전화번호3 */}
                <Form.Item name="tel3" style={{ display: 'inline-block', width: '32%', margin: '0 1px'}} >
                  <Input id="tel3" placeholder="Phone number" type="text" value={Tel3} onChange={tel3Handler} onBlur={handleBlur} />
                </Form.Item>
              </Form.Item>
              {/* 언어 */}
              <Form.Item required label={t('User.language')}>
                <Select value={Language} style={{ width: 120 }} onChange={languageHandler}>
                  <Option value="jp">{JAPANESE}</Option>
                  <Option value="en">{ENGLISH}</Option>
                  <Option value="cn">{CHINESE}</Option>
                </Select>
              </Form.Item>

              <Form.Item {...tailFormItemLayout}>
                <Button onClick={listHandler}>
                  Landing Page
                </Button>
                <Button onClick={submitHandler} type="primary" disabled={isSubmitting}>
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

export default MyInfoUpdatePage;