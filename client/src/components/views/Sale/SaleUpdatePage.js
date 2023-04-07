import React, {useEffect, useState, useContext} from "react";
import { Formik } from 'formik';
import { useHistory } from 'react-router-dom';
import { DatePicker, Form, Input, Button, Select, Checkbox } from 'antd';
import { useTranslation } from 'react-i18next';
import { MAIN_CATEGORY, SaleType, SaleActive } from '../../utils/Const';
import { SALE_SERVER, MAIL_SERVER, PRODUCT_SERVER } from '../../Config.js';
import schedule from 'node-schedule'
import axios from 'axios';
import { LanguageContext } from '../../context/LanguageContext';
// CORS 대책
axios.defaults.withCredentials = true;

const { Option } = Select;
const { TextArea } = Input;
const items = MAIN_CATEGORY;
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
  const [MailBatch, setMailBatch] = useState("");
  const [ShowMailComment, setShowMailComment] = useState(true);
  const [CnMailComment, setCnMailComment] = useState("");
  const [JpMailComment, setJpMailComment] = useState("");
  const [EnMailComment, setEnMailComment] = useState("");
  const [Except, setExcept] = useState(false);
  const [ShowExcept, setShowExcept] = useState(false);
  const {isLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();
  
  useEffect(() => {
    // 다국적언어
    i18n.changeLanguage(isLanguage);
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

  // 메일 송신
  const sendMail = async(body) => {
    try {
      // 세일수정 페이지의 플래그
      body.mod = "modify";

      // 세일제외 등록이 아닌경우
      if (!Except) {
        // 메일체크박스가 on인경우
        if (SendMail) {
          if (window.confirm("Do you want to send mail to all users?")) {
            // 메일 전송시간이 설정된 경우
            if (MailBatch !== "") {
              await mailBatch(body)
            } else {
              // 모든 사용자와 관리자에게 메일을 보낸다
              await axios.post(`${MAIL_SERVER}/sale`, body);
            }
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
      console.log("SaleUpdatePage sendMail err: ",err);
    }
  }

  async function mailBatch(body) {
    const today = new Date();
    // time: 2022-11-11 19:16:17
    const jtc = new Date(MailBatch);

    if (today > jtc) {
      alert("Mail setup time is in the past");
      return false;
    }
    
    const year = jtc.getFullYear();
    const month = jtc.getMonth() + 1;
    const date = jtc.getDate();
    const hour = jtc.getHours();
    const minute = jtc.getMinutes();

    // RecurrenceRule 설정
    // second (0-59)
    // minute (0-59)
    // hour (0-23)
    // date (1-31)
    // month (0-11)
    // year
    // dayOfWeek (0-6) Starting with Sunday
    // tz
    let rule = new schedule.RecurrenceRule();
    rule.year = year;
    rule.month = month - 1; // month (0-11)
    rule.date = date;
    rule.hour = hour;
    rule.minute = minute;
    rule.second = 59; // 화면에서 현재시간을 설정하면 배치가 실행되는 시간이 과거가 될수있기에 59초로 설정한다
    rule.tz = 'Asia/Tokyo';

    schedule.scheduleJob(rule, async function() {
        let startToday = new Date();
        let startTime = startToday.toLocaleString('ja-JP');
        console.log("-------------------------------------------");
        console.log("Batch setting of sales information edit mail start :", startTime);
        console.log("-------------------------------------------");

        try {
          // 모든 사용자와 관리자에게 메일을 보낸다
          await axios.post(`${MAIL_SERVER}/sale`, body);
        } catch (err) {
          console.log("Failed to send sale registration mail: ", err);
        }
    })
  }

  // 메일전송 배치
  const mailBatchHandler = (value, dateString) => {
    setMailBatch(dateString);
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
  const onOk = (value) => {
    console.log('onOk: ', value);
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
          
          let body = {
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
            axios.post(`${SALE_SERVER}/update`, body)
            .then(response => {
              if (response.data.success) {
                // 메일 송신
                sendMail(body);

                alert('Sale has been edited');
              } else {
                alert('Please contact the administrator');
              }
              // 리스트 페이지로 이동
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
          <div style={{ maxWidth: '700px', margin: '2rem auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
              <h1>{t('Sale.updateTitle')}</h1>
            </div>

            <Form style={{height:'80%', margin:'1em'}} {...formItemLayout} onSubmit={handleSubmit} >
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
              {/* 메일 예약 */}
              { ShowMailComment &&
                <Form.Item label={t('Sale.mailBatch')}>
                  <DatePicker showTime onChange={mailBatchHandler} onOk={onOk} />
                </Form.Item>
              }
              {/* 관리자 커멘트 */}
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
                </Button>
                <Button onClick={handleSubmit} type="primary" disabled={isSubmitting}>
                  Submit
                </Button>
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