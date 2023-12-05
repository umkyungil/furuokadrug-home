import React, { useState, useEffect, useContext } from "react";
import { Formik } from 'formik';
import { useHistory } from 'react-router-dom';
import { DatePicker, Select, Form, Input, Button, Checkbox } from 'antd';
import { useTranslation } from 'react-i18next';
import { MAIN_CATEGORY, SaleType } from '../../utils/Const';
import { MAIL_SERVER, SALE_SERVER, PRODUCT_SERVER } from '../../Config.js';
import schedule from 'node-schedule';

import { LanguageContext } from '../../context/LanguageContext';
import { dateFormatYMD, getLanguage, setHtmlLangProps, getMessage } from '../../utils/CommonFunction';

// CORS 대책
import axios from 'axios';
axios.defaults.withCredentials = true;

const { Option } = Select;
const { RangePicker } = DatePicker;
const { TextArea } = Input;
const dateFormat = 'YYYY-MM-DD';

const items = MAIN_CATEGORY;
const types = SaleType;

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

function SaleRegisterPage() {
  const [SaleCode, setSaleCode] = useState("");
  const [Type, setType] = useState(SaleType[2].key);
  const [Amount, setAmount] = useState("");
  const [Item, setItem] = useState(0);
  const [MinAmount, setMinAmount] = useState("");
  const [ExpirationPeriod, setExpirationPeriod] = useState([]);
  const [ProductId, setProductId] = useState("");
  const [ProductName, setProductName] = useState(""); 
  const [ProductItem, setProductItem] = useState(""); 
  const [CnMailComment, setCnMailComment] = useState("");
  const [JpMailComment, setJpMailComment] = useState("");
  const [EnMailComment, setEnMailComment] = useState("");
  const [SendMail, setSendMail] = useState(false);
  const [MailBatch, setMailBatch] = useState("");
  const [Except, setExcept] = useState(false);
  const [ShowMinAmount, setShowMinAmount] = useState(true);
  const [ShowMailComment, setShowMailComment] = useState(false);
  const [ShowExcept, setShowExcept] = useState(false);
  const history = useHistory();

  const {isLanguage, setIsLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();

  useEffect(() => {
		// 다국어 설정
    const lang = getLanguage(isLanguage);
    i18n.changeLanguage(lang);
    setIsLanguage(lang);

		// HTML lang속성 변경
    setHtmlLangProps(lang);
  }, [isLanguage])

  // Landing pageへ戻る
  const listHandler = () => {
    history.push("/");
  }  
  // 세일종류
  const typeHandler = (value) => {
    setType(value);

    if (!Except) {
      if (value === SaleType[2].key) {
        setShowMinAmount(true);
      } else {
        setShowMinAmount(false);
      }
    } else {
      setShowMinAmount(false);
    }
  }
  // 유효일자
  const dateHandler = (value, dateString) => {
    setExpirationPeriod(dateString);
  }
  // 세일 카테고리
  const itemHandler = (value) => {
    setItem(value);
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
  // 메일전송 배치
  const mailBatchHandler = (value, dateString) => {
    setMailBatch(dateString);
  }
  // 메일 커멘트
  const jpMailCommentHandler = (e) => {
    setJpMailComment(e.target.value)
  };
  const cnMailCommentHandler = (e) => {
    setCnMailComment(e.target.value)
  };
  const enMailCommentHandler = (e) => {
    setEnMailComment(e.target.value)
  };
  // 세일대상 제외(체크박스)
  const exceptHandler = (e) => {
    setExcept(e.target.checked)

    if (e.target.checked) {
      setShowExcept(true);
      setSendMail(false);
      setShowMailComment(false);
      setJpMailComment("");
      setEnMailComment("");
      setCnMailComment("");
      setShowMinAmount(false);
      setAmount("")
      setMinAmount("")
    } else {
      setShowExcept(false);

      // 세일타입이 할인금액인 경우 최소금액을 보여준다
      if (Type === SaleType[2].key) {
        setShowMinAmount(true);
      } else {
        setShowMinAmount(false);
      }
    }
  };
  // 세일코드
  const saleCodeHandler = (e) => {
    setSaleCode(e.target.value)
  };
  // 세일타입의 값
  const amountHandler = (e) => {
    setAmount(e.target.value)
  };
  // 최소금액
  const minAmountHandler = (e) => {
    setMinAmount(e.target.value)
  };
  const onOk = (value) => {
    console.log('onOk: ', value);
  }
  // 메일 송신
  const sendMail = async(body) => {
    try {
      // 세일등록 페이지의 플래그
      body.mod = "reg";

      // 세일제외 등록이 아닌경우
      if (!Except) {
        // 메일체크박스가 on인경우
        if (SendMail) {
          if (window.confirm("Do you want to send mail to all users?")) {
            // 메일 전송시간이 설정된 경우
            if (MailBatch !== "") {
              // 정해진 시간에 메일을 보낸다
              await mailBatch(body)
            } else {
              // 모든 사용자와 관리자에게 메일을 보낸다
              await axios.post(`${MAIL_SERVER}/sale`, body);
            }
          } else {
            // 세일정보를 등록했으니깐 관리자에게는 메일을 보낸다
            await axios.post(`${MAIL_SERVER}/sale/admin`, body);
            setSendMail(false);
          }
        } else {
          // 메일을 안 보내더라도 세일정보를 등록하니깐 관리자에게는 메일을 보낸다
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
      console.log("SaleRegisterPage sendMail err: ",err);
    }
  }

  async function mailBatch(body) {
    const today = new Date();
    // time: 2022-11-11 19:16:17
    const jtc = new Date(MailBatch);

    if (today > jtc) {
      alert(getMessage(getLanguage(), 'key049'));
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
        console.log("Batch setting of sales information registration mail start :", startTime);
        console.log("-------------------------------------------");

        try {
          // 모든 사용자와 관리자에게 메일을 보낸다
          await axios.post(`${MAIL_SERVER}/sale`, body);
        } catch (err) {
          console.log("SaleRegisterPage mailBatch err: ", err);
        }
    })
  }

  // 상품검색(검색버튼)
  const productPopupHandler = () => {
    if (Item === 0) {
      alert(getMessage(getLanguage(), 'key056'));
    } else {
      window.open(`/coupon/product/${Item}`,"product list","width=550, height=700, top=10, left=10");
    }
  }
  // 상품검색(크리어버튼)
  const productClearHandler = () => {
    setProductId("");
    setProductName("");
  }
  // 상품 검색 팝업창에서 productId를 전달받음
  window.productClickHandler = function (productId) {
    setProductId(productId);
    // 상품정보 가져오기
    getProduct(productId)
  };
  // 상품이름 가져오기
  const getProduct = async(productId) => {
    try {
      const result = await axios.get(`${PRODUCT_SERVER}/coupon/products_by_id?id=${productId}`);
      if (result.data.success) {
        setProductName(result.data.productInfo[0].title);
        setProductItem(result.data.productInfo[0].continents);
      }
    } catch (err) {
      alert(getMessage(getLanguage(), 'key048'));
      console.log("SaleRegisterPage getProduct err: ",err);
    }
  }

  return (
    <Formik
      onSubmit={(values, { setSubmitting }) => {
        setTimeout(() => {
          // 세일코드 체크
          if (SaleCode === "") {
            alert(getMessage(getLanguage(), 'key051'));
            setSubmitting(false);
            return false;
          }
          if (SaleCode.length > 4) {
            alert(getMessage(getLanguage(), 'key052'));
            setSubmitting(false);
            return false;
          }
          if (!Except) {
            // 세일타입의 값 체크
            if (Amount === "") {
              alert(getMessage(getLanguage(), 'key053'));
              setSubmitting(false);
              return false;
            }
            if (isNaN(Number(Amount))) {
              alert(getMessage(getLanguage(), 'key054'));
              setSubmitting(false);
              return false;
            }
            if (Number(Amount) < 1) {
              alert(getMessage(getLanguage(), 'key055'));
              setSubmitting(false);
              return false;
            }
          }
          // 카테고리가 ALL인데 상품이 지정되어 있는경우
          if (Item === MAIN_CATEGORY[0].key) {
            if (ProductId !== "") {
              alert(getMessage(getLanguage(), 'key056'));
              setSubmitting(false);
              return false;
            }
          }
          // 카테고리의 상품인지 확인
          if (Item !== MAIN_CATEGORY[0].key) {
            if (ProductId !== "") {
              getProduct(ProductId);
                
              if (Item !== ProductItem) {
                alert(getMessage(getLanguage(), 'key057'));
                setSubmitting(false);
                return false;
              }
            }
          }
          // 세일타입이 할인금액이 아닌데 최소금액에 값이있는경우
          if (Type !== SaleType[2].key) {
            if (MinAmount !== "") {
              alert(getMessage(getLanguage(), 'key058'));
              setSubmitting(false);
              return false;
            }
          }
          // 최소금액 체크
          if (MinAmount !== "") {
            // 금액 체크
            if (isNaN(Number(MinAmount))) {
              alert(getMessage(getLanguage(), 'key059'));
              setSubmitting(false);
              return false;
            }
            if (Number(MinAmount) < 1) {
              alert(getMessage(getLanguage(), 'key060'));
              setSubmitting(false);
              return false;
            }
          }
          // 날짜 체크
          if (ExpirationPeriod.length < 1) {
            alert(getMessage(getLanguage(), 'key061'));
            setSubmitting(false);
            return false;
          }
          if (!ExpirationPeriod[0]) {
            alert(getMessage(getLanguage(), 'key061'));
            setSubmitting(false);
            return false;
          }
          if (!ExpirationPeriod[1]) {
            alert(getMessage(getLanguage(), 'key061'));
            setSubmitting(false);
            return false;
          }

          const curDate = new Date(dateFormatYMD());
          const startDate = new Date(ExpirationPeriod[0]);
          const endDate = new Date(ExpirationPeriod[1]);
          // 입력한 날짜가 과거인지 체크
          if (curDate > startDate) {
            alert(getMessage(getLanguage(), 'key062'));
            setSubmitting(false);
            return false;
          }
          // 입력한 날짜가 과거인지 체크
          if (curDate > endDate) {
            alert(getMessage(getLanguage(), 'key062'));
            setSubmitting(false);
            return false;
          }
          // 날짜의 form to 상관관계 체크
          if (startDate > endDate) {
            alert(getMessage(getLanguage(), 'key062'));
            setSubmitting(false);
            return false;
          }

          // 세일 정보 셋팅
          let body = {
            code: SaleCode,
            type: Type,
            amount: Amount,
            minAmount: MinAmount,
            item: Item,
            active: "1", // 활성
            validFrom: ExpirationPeriod[0],
            validTo: ExpirationPeriod[1],
            productId: ProductId,
            sendMail: SendMail,
            cnMailComment: CnMailComment,
            jpMailComment: JpMailComment,
            enMailComment: EnMailComment,
            except: Except,
          };

          // 세일 제외대상 등록인 경우
          if (Except) {
            // ALL은 선택할수 없다 
            if (Item === 0) {
              alert(getMessage(getLanguage(), 'key063'));
              setSubmitting(false);
              return false;
            }
          }

          try {
            // 세일이 이미 존재하는지 확인
            axios.post(`${SALE_SERVER}/exist`, body)
            .then(response => {
              // 세일정보가 존재하면 에러
              if (response.data.success) {
                if (response.data.saleInfos.length > 0) {
                  alert(getMessage(getLanguage(), 'key064'));

                  return false;
                } else {
                  // 세일이 존재하지 않으면 세일 등록
                  axios.post(`${SALE_SERVER}/register`, body)
                  .then(response => {
                    if (response.data.success) {
                      // 메일 전송
                      sendMail(body);

                      alert(getMessage(getLanguage(), 'key065'));
                    } else {
                      alert(getMessage(getLanguage(), 'key001'));
                    }
                    // 리스트 페이지로 이동
                    history.push("/sale/list");
                  });
                }
              } else {
                // 같은 세일코드가 존재하는 경우
                alert(getMessage(getLanguage(), 'key066'));
                return false;
              }
            })
          } catch (err) {
            alert(getMessage(getLanguage(), 'key001'));
            console.log("SaleRegisterPage return err: ", err);
            // 세일리스트 이동
            history.push("/sale/list");
          }
          
        setSubmitting(false);
      }, 500);
    }}
    >
      {props => {
        const { isSubmitting, handleBlur, handleSubmit, } = props;
        return (
          <div className={isLanguage === "cn" ? 'lanCN' : 'lanJP'} style={{ maxWidth: '700px', margin: '2rem auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
              <h1>{t('Sale.regTitle')}</h1>
            </div>

            <Form style={{height:'80%', margin:'1em'}} {...formItemLayout} onSubmit={handleSubmit} >
              {/* 세일코드 */}
              <Form.Item required label={t('Sale.code')} >
                <Input id="code" placeholder="Sale code" type="text" value={SaleCode} onChange={saleCodeHandler} onBlur={handleBlur} />
              </Form.Item>
              {/* 세일종류 */}
              <Form.Item required label={t('Sale.type')} >
                <Select value={Type} onChange={typeHandler}>
                {types.map(item => (
                  <Option key={item.key} value={item.key}> {item.value} </Option>
                ))}
                </Select>
              </Form.Item>
              {/* 세일할인율 또는 금액 */}
              {!ShowExcept &&
                <Form.Item required label={t('Sale.amount')} >
                  <Input id="amount" placeholder="Sale amount" type="text" value={Amount} onChange={amountHandler} onBlur={handleBlur} />
                </Form.Item>
              }
              {/* 세일할인 최소금액 */}
              {ShowMinAmount &&
                <Form.Item label={t('Sale.minAmount')} >
                  <Input id="minAmount" placeholder="Sale discount minimum amount" type="text" value={MinAmount} onChange={minAmountHandler} 
                    onBlur={handleBlur} />
                </Form.Item> 
              }
              {/* 세일 유효기간 */}
              <Form.Item required label={t('Sale.validTo')}>
                <RangePicker id="validTo" format={dateFormat} onChange={dateHandler} onOk={onOk} />
              </Form.Item>
              {/* 세일 카테고리 */}
              <Form.Item required label={t('Sale.item')} >
                <Select value={Item} onChange={itemHandler}>
                {items.map(item => (
                  <Option key={item.key} value={item.key}> {item.value} </Option>
                ))}
                </Select>
              </Form.Item>
              {/* 세일적용 상품 아이디 */}
              <Form.Item label={t('Sale.product')} >
                <Input id="userId" placeholder="Product" type="text" value={ProductName} style={{ width: '7em' }} readOnly/>&nbsp;
                <Button onClick={productPopupHandler} >
                  Search
                </Button>
                <Button onClick={productClearHandler} >
                  Clear
                </Button>
                <br />
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
                  <TextArea style={{ width: 250 }} maxLength={500} rows={1} placeholder="Mail comment" value={JpMailComment} onChange={jpMailCommentHandler} />
                </Form.Item>
              }
              { ShowMailComment &&
                <Form.Item label={t('Sale.cnMailComment')} >
                  <TextArea style={{ width: 250 }} maxLength={500} rows={1} placeholder="Mail comment" value={CnMailComment} onChange={cnMailCommentHandler} />
                </Form.Item>
              }
              { ShowMailComment &&
                <Form.Item label={t('Sale.enMailComment')} >
                  <TextArea style={{ width: 250 }} maxLength={500} rows={1} placeholder="Mail comment" value={EnMailComment} onChange={enMailCommentHandler} />
                </Form.Item>
              }
              {/* 세일대상 제외 */}
              <Form.Item label={t('Sale.saleExcept')} >
                <Checkbox checked={Except} onChange={exceptHandler} />
              </Form.Item>
            
              <Form.Item {...tailFormItemLayout}>
                <Button onClick={listHandler}>
                  Landing Page
                </Button>
                <Button onClick={handleSubmit} type="primary" disabled={isSubmitting}>
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

export default SaleRegisterPage;