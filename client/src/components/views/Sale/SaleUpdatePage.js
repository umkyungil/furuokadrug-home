import React, {useEffect, useState} from "react";
import { Formik } from 'formik';
import { Form, Input, Button, Select, Checkbox } from 'antd';
import axios from 'axios';
import { SALE_SERVER, MAIL_SERVER, PRODUCT_SERVER } from '../../Config.js';
import { MainCategory, SaleType, SaleActive } from '../../utils/Const';
import { useHistory } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// CORS 대책
axios.defaults.withCredentials = true;

const { Option } = Select;
const { TextArea } = Input;

const items = MainCategory;
const types = SaleType;
const actives = SaleActive;

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

function SaleUpdatePage(props) {
  const [Id, setId] = useState("");
  const [Code, setCode] = useState("");
  const [Type, setType] = useState("");
  const [Amount, setAmount] = useState("");
  const [MinAmount, setMinAmount] = useState("");
  const [ShowMinAmount, setShowMinAmount] = useState(false);
  const [Active, setActive] = useState("1");
  const [ValidFrom, setValidFrom] = useState("");
  const [ValidTo, setValidTo] = useState("");
  const [Item, setItem] = useState(0);
  const [ProductId, setProductId] = useState("");
  const [ProductName, setProductName] = useState("");
  const [SendMail, setSendMail] = useState(false);
  const [ShowMailComment, setShowMailComment] = useState(true);
  const [CnMailComment, setCnMailComment] = useState("");
  const [JpMailComment, setJpMailComment] = useState("");
  const [EnMailComment, setEnMailComment] = useState("");
  const [Except, setExcept] = useState(false);
  const [ShowExcept, setShowExcept] = useState(false);
  
  useEffect(() => {
    // 다국적언어
    setMultiLanguage(localStorage.getItem("i18nextLng"));
    // Query string에서 세일ID 가져오기
    const saleId = props.match.params.saleId;
     // 세일정보 가져오기
    getSale(saleId);
  }, [])

  // 세일정보 가져오기
  const getSale = async (saleId) => {
    try {
      const result = await axios.get(`${SALE_SERVER}/sales_by_id?id=${saleId}`);
      
      if (result.data.success) {
        const saleInfo = result.data.saleInfo[0];

        setId(saleInfo._id);          
        setCode(saleInfo.code);
        setType(saleInfo.type);
        setAmount(saleInfo.amount);
        // 최소금액
        if (saleInfo.type === SaleType[2].key) {
          setShowMinAmount(true);
        } else {
          setShowMinAmount(false);
        }
        setMinAmount(saleInfo.minAmount);
        setItem(saleInfo.item);
        setActive(saleInfo.active);
        // 메일송신
        setSendMail(saleInfo.sendMail);
        // 관리자 메일커멘트
        if (saleInfo.sendMail) {
          setShowMailComment(true);
        } else {
          setShowMailComment(false);
        }
        setCnMailComment(saleInfo.cnMailComment);
        setJpMailComment(saleInfo.jpMailComment);
        setEnMailComment(saleInfo.enMailComment);
        // 세일대상 제외
        setExcept(saleInfo.except);
        if (saleInfo.except) {
          // 세일 대상제외 정보
          setShowExcept(true);
          setShowMailComment(false);
          setShowMinAmount(false);
        } else {
          setShowExcept(false);
        }        
        // 유효기간 시작일 변형
        let validFrom = saleInfo.validFrom;
        setValidFrom(validFrom.substring(0, 10));
        // 유효기간 종료일 변형
        let validTo = saleInfo.validTo;
        setValidTo(validTo.substring(0, 10));
        // 상품정보
        if (saleInfo.productId && saleInfo.productId !== "") {
          // 상품정보 가져오기
          getProduct(saleInfo.productId)
          setProductId(saleInfo.productId);
        }
      } else {
        alert("Failed to get sale information")
      }      
    } catch (err) {
      alert("Failed to get sale information")
      console.log("getSale err: ",err);
    }
  }

  // 상품정보 가져오기
  const getProduct = async(productId) => {
    try {
      const result = await axios.get(`${PRODUCT_SERVER}/coupon/products_by_id?id=${productId}`);
      if (result.data.success) {
        setProductName(result.data.productInfo[0].title);
      }
    } catch (err) {
      alert("Failed to get product information")
      console.log("getProduct err: ",err);
    }
  }

  // 세일정보 삭제
  const deleteHandler = () => {
    let dataToSubmit = { id: Id };
    try {
      axios.post(`${SALE_SERVER}/delete`, dataToSubmit)
      .then(response => {
        if (response.data.success) {
          alert('Sale has been deleted');
        } else {
          alert('Please contact the administrator');
        }
        // 세일리스트 이동
        history.push("/sale/list");
      })
    } catch(err) {
      console.log("submit err: ", err);
      alert('Please contact the administrator');
      history.push("/sale/list");
    }
	}

  // 관리자 메일 송신
  const sendMail = async(body) => {
    try {
      if (!Except) {
        if (SendMail) {
          if (window.confirm("Do you want to send mail to all users?")) {
            // 세일정보인 경우 모든 사용자와 관리자에게 메일을 보낸다
            await axios.post(`${MAIL_SERVER}/sale`, body);
          } else {
            // 관리자에게만 메일을 보낸다
            await axios.post(`${MAIL_SERVER}/sale/admin`, body);
            setSendMail(false);
          }
        } else {
          // 관리자에게만 메일을 보낸다
          await axios.post(`${MAIL_SERVER}/sale/admin`, body);
          setSendMail(false);
        }
      } else {
        // 세일제외정보인 경우 관리자에게만 메일을 보낸다
        await axios.post(`${MAIL_SERVER}/saleExcept`, body);
        setSendMail(false);
      }
    } catch(err) {
      setSendMail(false);
      console.log("err: ",err);
    }
  }

  // 세일사용 유무
  const activeHandler = (value) => {
    setActive(value);
  }
  // 세일리스트 페이지 이동
  const history = useHistory();
  const listHandler = () => {
    history.push("/sale/list");
  }

  // 다국적언어 설정
	const {t, i18n} = useTranslation();
  function setMultiLanguage(lang) {
    i18n.changeLanguage(lang);
  }

  // 메일전송 유무(체크박스)
  const sendMailHandler = (e) => {
    setSendMail(e.target.checked)

    if (e.target.checked) {
      setShowMailComment(true);
    } else {
      setShowMailComment(false)
      setJpMailComment("");
      setCnMailComment("");
      setEnMailComment("");
    }
  };

  return (
    <Formik
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {

          if (!Active || Active === "") {
            alert("Please select whether the sale is active or inactive");
            setSubmitting(false);
            return false;
          } 
          
          let dataToSubmit = {
            id: Id,
            code: Code,
            type: Type,
            amount: Amount,
            minAmount: MinAmount,
            active: Active,
            validFrom: ValidFrom,
            validTo: ValidTo,
            item: Item,
            productId: ProductId,
            sendMail: SendMail,
            cnMailComment: CnMailComment,
            jpMailComment: JpMailComment,
            enMailComment: EnMailComment,
            except: Except
          };

          try {
            axios.post(`${SALE_SERVER}/update`, dataToSubmit)
            .then(response => {
              if (response.data.success) {
                // 메일 송신
                sendMail(dataToSubmit);
                alert('Sale has been edited');
              } else {
                alert('Please contact the administrator');
              }
              // 세일리스트 이동
              history.push("/sale/list");
            })
          } catch(err) {
            alert('Please contact the administrator');
            console.log("Sale edit err: ", err);
            // 세일리스트 이동
            history.push("/sale/list");
          }

          setSubmitting(false);
        }, 500);
      }}
    >
      {props => {
        const { values, touched, errors, isSubmitting, handleChange, handleBlur, handleSubmit, } = props;
        return (
          <div className="app">
            <h1>{t('Sale.updateTitle')}</h1>
            <br />
            <Form style={{ minWidth: '375px' }} {...formItemLayout} onSubmit={handleSubmit} >
              {/* 세일코드 */}
              <Form.Item label={t('Sale.code')}>
                <Input id="code"  type="text" value={Code} style={{ width: 250 }} readOnly/>
              </Form.Item>
              {/* 세일종류 */}
              <Form.Item label={t('Sale.type')} >
                <Select value={Type} style={{ width: 250 }} >
                  {types.map(item => {
                    if (item.value === Type) {
                      return (<Option key={item.key} value={item.key} > {item.value} </Option>)
                    } else {
                      return (<Option key={item.key} value={item.key} disabled> {item.value} </Option>)
                    }
                  })}
                </Select>
              </Form.Item>
              {/* 세일할인율 또는 금액 */}
              {!ShowExcept &&
                <Form.Item label={t('Sale.amount')} >
                  <Input id="amount" type="text" value={Amount} style={{ width: 250 }} readOnly/>
                </Form.Item>
              }
              {/* 세일할인 최소금액 */}
              { ShowMinAmount &&
                <Form.Item label={t('Sale.minAmount')} >
                  <Input id="minAmount" type="text" value={MinAmount} style={{ width: 250 }} readOnly/>
                </Form.Item>
              }
              {/* 사용유무 */}
              <Form.Item required label={t('Sale.active')} >
                <Select value={Active} style={{ width: 250 }} onChange={activeHandler}>
                  {actives.map(item => (
                    <Option key={item.key} value={item.key}> {item.value} </Option>
                  ))}
                </Select>
              </Form.Item>
              {/* 세일 유효기간 */}
              <Form.Item label={t('Sale.validTo')} style={{ marginBottom: 0, }} >
                {/* 세일 유효기간 시작 */}
                <Form.Item name="validFrom" style={{ display: 'inline-block', width: 'calc(35% - 8px)' }} >
                  <Input id="validFrom" type="text" value={ValidFrom} readOnly />
                </Form.Item>～
                {/* 세일 유효기간 종료 */}
                <Form.Item name="validTo" style={{ display: 'inline-block', width: 'calc(35% - 8px)', margin: '0 8px', }} >
                  <Input id="validTo" type="text" value={ValidTo} readOnly />
                </Form.Item>
              </Form.Item>

              {/* 세일적용 카테고리 */}
              <Form.Item label={t('Sale.item')} >
                <Select value={Item} style={{ width: 250 }} >
                {items.map(item => {
                  if (item.value === Item) {
                    return (<Option key={item.key} value={item.key}> {item.value} </Option>)
                  } else {
                    return (<Option key={item.key} value={item.key} disabled> {item.value} </Option>)
                  }
                })}
                </Select>
              </Form.Item>
              {/* 세일적용 상품 아이디 */}
              <Form.Item label={t('Sale.product')} >
                <Input id="productId" type="text" value={ProductName} style={{ width: 250 }} readOnly/>
              </Form.Item>
              {/* 메일전송 유무 */}
              {!ShowExcept &&
                <Form.Item label={t('Sale.sendMail')} >
                  <Checkbox checked={SendMail} onChange={sendMailHandler} />
                </Form.Item>
              }
              {/* 메일 추가 커멘트 */}
              { ShowMailComment && 
                <Form.Item label={t('Sale.jpMailComment')} >
                  <TextArea style={{ width: 250 }} maxLength={500} rows={1} placeholder="Mail comment" value={JpMailComment} />
                </Form.Item>
              }
              { ShowMailComment && 
                <Form.Item label={t('Sale.cnMailComment')} >
                  <TextArea style={{ width: 250 }} maxLength={500} rows={1} placeholder="Mail comment" value={CnMailComment} />
                </Form.Item>
              }
              { ShowMailComment && 
                <Form.Item label={t('Sale.enMailComment')} >
                  <TextArea style={{ width: 250 }} maxLength={500} rows={1} placeholder="Mail comment" value={EnMailComment} />
                </Form.Item>
              }
              {/* 세일대상 제외정보 유무 */}
              { ShowExcept && 
                <Form.Item label={t('Sale.saleExcept')} >
                  <Checkbox checked={Except} readOnly/>
                </Form.Item>
              }

              <Form.Item {...tailFormItemLayout}>
                <Button onClick={listHandler}>
                  Sale List
                </Button>&nbsp;&nbsp;
                <Button onClick={handleSubmit} type="primary" disabled={isSubmitting}>
                  Submit
                </Button>&nbsp;&nbsp;
                <Button onClick={deleteHandler} type="danger" >
                  Delete
                </Button>
              </Form.Item>
            </Form>
          </div>
        );
      }}
    </Formik>
  );
};

export default SaleUpdatePage;