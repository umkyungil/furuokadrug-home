import React, {useEffect, useState, useRef, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import UserCardBlock from './Sections/UserCardBlock';
import Paypal from '../../utils/Paypal'
import { Empty, Button, Result, Icon, Input } from 'antd';
import { getCartItems, removeCartItem, onSuccessBuy, onSuccessBuyTmp } from '../../../_actions/user_actions';
import { ORDER_SERVER, COUPON_SERVER, POINT_SERVER, SALE_SERVER, SID } from '../../Config.js';
import { NOT_SET, UNIDENTIFIED, DEPOSITED, EC_SYSTEM, MAIN_CATEGORY, UseWithSale, CouponType, SaleType } from '../../utils/Const';
import { LanguageContext } from '../../context/LanguageContext';
import axios from 'axios';
// CORS 대책
axios.defaults.withCredentials = true;

function CartPage(props) {
  const [CartDetail, setCartDetail] = useState([]);
  const [FinalTotal, setFinalTotal] = useState(0); // 상품 총 금액
  const [Total, setTotal] = useState(0); // 카트의 상품 총 금액
  const [Discount, setDiscount] = useState(0); // 할인금액
  const [AvailablePoints, setAvailablePoints] = useState(0); // 보유하고 있는 포인트 - 사용자가 입력한 포인트
  const [AcquisitionPoints, setAcquisitionPoints] = useState(0); // 구매시 취득가능한 포인트(총금액의 10%)
  const [UsePoint, setUsePoint] = useState(0); // 사용자가 입력한 포인트
  const [InputPoint, setInputPoint] = useState(""); // 사용자가 입력한 포인트
  const [PointConfirm, setPointConfirm] = useState(0); // 포인트 확인 버튼을 눌렀는지 확인
  const [MyPoint, setMyPoint] = useState(0); // 보유 포인트
  const [Coupon, setCoupon] = useState({}); // 사용자가 입력한 쿠폰코드로 검색한 쿠폰정보
  const [CouponCode, setCouponCode] = useState(""); // 사용자가 입력한 쿠폰
  const [CouponAmount, setCouponAmount] = useState(0); // 쿠폰타입에 의해 계산된 할인금액
  const [ShowTotal, setShowTotal] = useState(false);
  const [ShowSuccess, setShowSuccess] = useState(false);
  const [PointRate, setPointRate] = useState(() => {
    return sessionStorage.getItem("pointRate") || 10
  });
  
  const showSaleTotalRef = useRef(false); // 세일금액 표시(화면이 리로드되도 저장됨)
  const saleTotalDiscountAmount = useRef(0);
  const saleAcquisitionPoints = useRef(0);
  const couponTotalDiscountAmount = useRef(0);
  const couponAcquisitionPoints = useRef(0);

  const {isLanguage} = useContext(LanguageContext);
  const {t, i18n} = useTranslation();
  const dispatch = useDispatch();
  const history = useHistory();

  // 결제정보 설정
  const paymentData = {
    address: {
      city: NOT_SET,
      country_code: NOT_SET,
      line1: NOT_SET,
      postal_code: NOT_SET,
      recipient_name: NOT_SET,
      state: NOT_SET,
    },
    cancelled: NOT_SET,
    email: NOT_SET,
    paid: NOT_SET,
    payerID: NOT_SET,
    paymentID: NOT_SET,
    paymentToken: NOT_SET,
    returnUrl: NOT_SET,
  };

  useEffect(() => {
    // 다국적언어 설정
		i18n.changeLanguage(isLanguage);

    process();
  }, [props.user.userData])

  const process = async () => {
    let cartItems=[]
    
    // 리덕스 User state안에 cart 안에 상품이 들어있는지 확인
    if (props.user.userData && props.user.userData.cart) {
      if (props.user.userData.cart.length > 0) {
        // 사용자의 유효기간 내의 사용가능한 포인트 가져오기
        // 포인트가 없으면 0을 받는다
        const myPoint = await getCalcPoint(props.user.userData._id);
        setMyPoint(myPoint);
        setAvailablePoints(myPoint); // 사용할수 있는 포인트(취득한 포인트)

        // 카트의 상품의 ID를 가지고와서 배열에 넣는다
        props.user.userData.cart.forEach(item => {
          cartItems.push(item.id);
        });

        // 하나 이상의 상품정보에 수량을 포함해서 가져오기
        // 1번째 파라메터는 사용자의 카트정보의 상품의 ID
        // 2번째 파라메터는 사용자의 카트정보
        dispatch(getCartItems(cartItems, props.user.userData.cart))
        .then(response => {
          // 카트에 들어있는 상품금액 및 누적될 포인트 계산
          const cartDetail = response.payload;
          let total = 0;
          cartDetail.map(item => {
            total += parseInt(item.price,10) * item.quantity;
          })
          
          setCartDetail(cartDetail); // 카트의 모든 상품정보
          setTotal(total); // 카트의 상품 누적금액
          setFinalTotal(total);
          setAcquisitionPoints(percent(total, PointRate)); // 취득할 포인트 계산하기
          setDiscount(0);
          setShowTotal(true);

          // 세일정보가 있을경우 총 합계, 취득 포인트, 할인금액등을 계산한다
          const mySale = getSale();
          mySale.then(saleInfos => {
            if (saleInfos.length > 0) {
              showSaleTotalRef.current = true;
              calcBySaleItem(saleInfos, cartDetail);
            } else {
              showSaleTotalRef.current = false;
            }
          })
        })
      } 
    }
  }

  // 현재날짜가 포함되어 있는 모든 세일정보 가져와서 배열에 담아 넘긴다
  const getSale = async () => {
    let saleInfos = [];
    try {
      const result = await axios.get(`${SALE_SERVER}/listOfAvailable`);

      if (result.data.success) {
        for (let i=0; i<result.data.saleInfos.length; i++) {
          saleInfos.push(result.data.saleInfos[i]);
        }

        return saleInfos;
      }
    } catch (err) {
      console.log("getSale err: ", err);
      alert("Please contact the administrator");
      history.push("/");
    }
  }

  // 카테고리 또는 상품이 지정된 경우 세일금액을 계산한다.
  const calcBySaleItem = async (saleInfos, cartDetail) => {
    // 특정상품의 세일정보를 저장(세일등록 화면에서 카테고리 ALL인 경우는 상품을 지정할수 없게 되어있다)
    let saleProduct = [];
    for (let i=0; i<saleInfos.length; i++) {
      // 카테고리와 관계없이 특정상품 세일정보가 있는경우
      if (!saleInfos[i].except && saleInfos[i].productId !== "") {
        saleProduct.push(saleInfos[i]);
      }
    }
    // 카테고리가 ALL이 아닌 카테고리 세일정보를 저장
    let saleCategory = [];
    for (let i=0; i<saleInfos.length; i++) {
      // 카테고리 세일정보가 ALL이 아니고 특정상품이 지정되지 않은경우 
      if (!saleInfos[i].except && saleInfos[i].item !== 0 && saleInfos[i].productId === "") {
        saleCategory.push(saleInfos[i]);
      } 
    }
    // 카테고리가 ALL인 세일정보를 저장
    let allCategory = [];
    for (let i=0; i<saleInfos.length; i++) {
      // 카테고리 세일정보가 ALL이고 특정상품이 지정되지 않은경우 
      if (!saleInfos[i].except && saleInfos[i].item === 0 && saleInfos[i].productId === "") {
        allCategory.push(saleInfos[i]);
      } 
    }
    // 세일대상 제외인 카테고리 세일정보를 저장
    let exceptCategory = [];
    for (let i=0; i<saleInfos.length; i++) {
      // ALL이외의 카테고리가 세일대상 제외이고 상품아이디가 지정되지 않은경우 
      if (saleInfos[i].except && saleInfos[i].item !== 0 && saleInfos[i].productId === "") {
        exceptCategory.push(saleInfos[i]);
      } 
    }
    // 세일대상 제외인 특정상품 세일정보를 저장
    let exceptProduct = [];
    for (let i=0; i<saleInfos.length; i++) {
      // 카테고리가 세일대상 제외이고 상품아이디가 지정되지 않은경우 
      if (saleInfos[i].except && saleInfos[i].item !== 0 && saleInfos[i].productId !== "") {
        exceptProduct.push(saleInfos[i]);
      } 
    }

    // 세일계산
    let totalDiscountAmount = 0;
    let totalAcquisitionPoints = 0;
    let tmpCartDetail = [];
    let cpCartDetail = [];

    // cartDetail copy
    cpCartDetail = [...cartDetail];
    // 세일대상 제외 상품을 삭제
    tmpCartDetail =[...cpCartDetail];
    for (let i=0; i<exceptProduct.length; i++) {
      for (let j=0; j<tmpCartDetail.length; j++) {
        if (exceptProduct[i].productId === tmpCartDetail[j]._id) {
          cpCartDetail.splice(j, 1);
        }
      }
    }
    // 세일대상 제외 카테고리의 상품을 삭제
    tmpCartDetail =[...cpCartDetail];
    for (let i=0; i<exceptCategory.length; i++) {
      for (let j=0; j<tmpCartDetail.length; j++) {
        if (exceptCategory[i].item === tmpCartDetail[j].continents) {
          cpCartDetail.splice(j, 1);
        }
      }
    }
    // 특정 상품세일이 있으면 적용
    tmpCartDetail =[...cpCartDetail];
    for (let i=0; i<saleProduct.length; i++) {
      let price = 0;
      let count = 0;
      
      // 동일상품의 수량만큼 값이 계산된다
      for (let j=0; j<tmpCartDetail.length; j++) {
        // 상품세일의 대상 상품이 카트에 있다면 해당상품의 합계를 구한다
        if (saleProduct[i].productId === tmpCartDetail[j]._id) {
          price += parseInt(tmpCartDetail[j].price,10) * tmpCartDetail[j].quantity;
          count = tmpCartDetail[j].quantity;
          // 해당상품을 카트에서 삭제한다
          cpCartDetail.splice(j, 1);
        }
      }

      // 상품세일에 최소금액이 있는경우(동일상품이 하나이상있는 경우 합계금액에 대해 최소금액을 비교한다)
      if (saleProduct[i].minAmount !== "") {
        const minProductAmount = parseInt(saleProduct[i].minAmount);
        // 해당 상품의 합계금액이 최소금액보다 작은경우 세일계산을 하지 않는다
        if (price < minProductAmount) {
          price = 0;
        }
      }
      
      // price > 0은 상품세일의 대상상품이 카트안에 있어서 세일을 적용한경우
      if (price > 0) {
        // 상품세일에 의한 할인금액 또는 포인트를  구한다
        const saleProductAmount  = calcBySaleType(price, saleProduct[i]);

        if (saleProduct[i].type === SaleType[1].key) {
          // 상품갯수당 포인트를 부여한다
          const point = saleProductAmount * count;
          saleAcquisitionPoints.current = point;
          totalAcquisitionPoints += point;
        } else {
          totalDiscountAmount += saleProductAmount;
          saleTotalDiscountAmount.current = saleProductAmount;;
        }
      }
    }

    // 카테고리 ALL 이외의 세일이 있으면 적용
    tmpCartDetail = [...cpCartDetail];
    for (let i=0; i<saleCategory.length; i++) {
      let price = 0;
      let count = 0;

      for (let j=0; j<tmpCartDetail.length; j++) {
        // 카테고리 세일의 대상 상품이 카트에 있다면 해당상품의 합계를 구한다
        if (saleCategory[i].item === tmpCartDetail[j].continents ) {
          price += parseInt(tmpCartDetail[j].price,10) * tmpCartDetail[j].quantity;
          count = tmpCartDetail[j].quantity;
          // 해당상품을 카트에서 삭제한다
          cpCartDetail.splice(j, 1);
        }
      }

      // 카테고리 세일에 최소금액이 있는경우
      if (saleCategory[i].minAmount !== "") {
        const minCategoryAmount = Number(saleCategory[i].minAmount);
        // 해당 카테고리의 모든상품의 합계금액이 최소금액보다 작은경우 세일대상외로 한다
        if (price < minCategoryAmount) {
          price = 0;
        }
      }

      // price > 0은 카테고리 세일 적용상품이 카트안에 있어서 세일을 적용한 경우
      if (price > 0) {
        const saleCategoryAmount = calcBySaleType(price, saleCategory[i]);

        if (saleCategory[i].type === SaleType[1].key) {
          // 상품갯수당 포인트를 부여한다
          const point = saleCategoryAmount * count;
          saleAcquisitionPoints.current = point;
          totalAcquisitionPoints += point;
        } else {
          totalDiscountAmount += saleCategoryAmount;
          saleTotalDiscountAmount.current = saleCategoryAmount;
        }
      }
    }
    
    // 카테고리 ALL인 세일정보가 있는 경우
    tmpCartDetail = [...cpCartDetail];
    // 카테고리 ALL은 하나만 존재한다
    for (let i = 0; i < allCategory.length; i++) {
      let price = 0;
      let count = 0;
      
      for (let j = 0; j < tmpCartDetail.length; j++) {
        price += parseInt(tmpCartDetail[j].price,10) * tmpCartDetail[j].quantity;
        count = tmpCartDetail[j].quantity;
        cpCartDetail.splice(j, 1);
      }

      // ALL 카테고리 세일에 최소금액이 있는경우
      if (allCategory[i].minAmount !== "") {
        const minAllAmount = Number(allCategory[i].minAmount);
        // ALL 카테고리에 해당하는 모든상품의 합계금액이 최소금액보다 작은경우 세일대상외로 한다
        if (price < minAllAmount) {
          price = 0;
        }
      }

      // ALL 카테고리 세일 적용상품이 카트안에 있는경우
      if (price > 0) {
        const allCategoryAmount  = calcBySaleType(price, allCategory[i]);
        
        // 세일타입이 포인트부여인 경우
        if (allCategory[i].type === SaleType[1].key) {
          // 상품갯수당 포인트를 부여한다
          const point = allCategoryAmount * count;
          saleAcquisitionPoints.current = point;
          totalAcquisitionPoints += point;
        } else {
          totalDiscountAmount += allCategoryAmount;
          saleTotalDiscountAmount.current = allCategoryAmount;
        }
      }
    }

    // 세일금액이 포인트 부여인 경우 또는 세일금액이 0인 경우 화면에 최소선으로 금액을 보여줄 필요가 없다
    if (totalDiscountAmount === 0) {
      showSaleTotalRef.current = false;
    }

    // 카트안의 모든 상품금액을 구한다
    let allProductPrice = 0;
    cartDetail.map(item => {
      allProductPrice += parseInt(item.price,10) * item.quantity;
    })
    
    if (allProductPrice <= totalDiscountAmount) {
      setFinalTotal(0);
      // 구매상품의 총 금액에서 취득할수 있는 포인트는 없지만 포인트 부여로 취득한 포인트가 있을수 있다
      setAcquisitionPoints(totalAcquisitionPoints);
      setDiscount(allProductPrice);
    } else {
      // 세일은 포인트나 쿠폰을 계산하기 전 이니까 총금액을 카트의 총금액에서 할인금액을 빼도 된다
      let total = parseInt(allProductPrice - totalDiscountAmount);
      setFinalTotal(total);
      // 포인트 부여로 취득한 포인트와 구매상품의 총 금액에서 취득한 포인트를 추가한다
      const point = percent(total, PointRate);
      totalAcquisitionPoints += point;
      setAcquisitionPoints(totalAcquisitionPoints);
      setDiscount(totalDiscountAmount);
    }
  }

  // 세일 타입에 의한 할인금액을 구한다
  const calcBySaleType = (targetProductPrice, saleInfo) => {
    // 세일 타입("0": "Gross Percentage", "1": "Granting points", "2": "Discount amount")
    const type = saleInfo.type;
    const amount = Number(saleInfo.amount);
    let discountAmount = 0;
    
    // 0: Gross Percentage(총 금액의 몇 퍼센트 할인)
    if (type === SaleType[0].key) {
      // 전체금액이 아닌 해당상품의 총 금액에서 할인율을 적용한다 (전체값 * 퍼센트 / 100)
      discountAmount = parseInt((targetProductPrice * amount) / 100);
    // 1: Granting points(포인트 부여)는 그대로 넘긴다
    } else if (type === SaleType[1].key) {
      // 포인트를 돌려준다
      discountAmount = amount;
    // 2: Discount amount(할인금액)는 그대로 넘긴다
    } else if (type === SaleType[2].key) {
      discountAmount = amount
    }

    return discountAmount;
  }

  // 랜딩페이지 이동
  const handleList = () => {
    history.push("/");
  }

  // 카트삭제
  let removeFromCart = (productId) => {
    dispatch(removeCartItem(productId))
    .then(response => {
      // 삭제후 카트에 상품이 없는경우
      if (response.payload.productInfo.length <= 0) {
        setShowTotal(false);
        history.push("/");
      } else {
        if (Discount > 0) {
          setUsePoint(0);
          setPointConfirm(0);
          setCoupon({});
          setCouponCode("");
          setCouponAmount(0);
          alert("Please re-enter the coupon or points")
        }
      }
    })
  }

  // 사용자의 유효기간 내의 사용가능한 포인트 계산
  async function getCalcPoint(userId) {
    try {
      let totalPoint = 0;
      // 사용자 아이디로 포인트 테이블에서 포인트 가져오기
      const result = await axios.get(`${POINT_SERVER}/users_by_id?id=${userId}`);
        
      if (result.data.success) {
        let pointInfos = result.data.pointInfos;
        // 유효기간 내의 사용가능한 포인트 합산
        for (let i=0; i<pointInfos.length; i++) {
          totalPoint += pointInfos[i].remainingPoints;
        }
      } else {
        alert("Failed to get point information")
      }

      return totalPoint;
    } catch (err) {
      console.log("err: ",err);
    }
  }

  // Paypal 결제성공시 처리
  const transactionSuccess = (data) => {
    // 업데이트할 포인트 계산: (사용가능한 포인트 + 상품구매로 취득한 포인트)
    const grantPoint = AvailablePoints + AcquisitionPoints;
    
    // Paypal 결제정보 및 history 저장, 상품판매 카운트 업데이트
    dispatch(onSuccessBuy({
      paymentData: data, // Paypal에서 결제 성공시 전해주는 데이타
      cartDetail: props.user.cartDetail, // 카트에 있던 상품 상세정보(카트의 정보가 아닌 상품의 상세정보)
      pointToUse: UsePoint,
      productPoint: AcquisitionPoints, // 포인트를 사용하지 않을경우 구매상품의 포인트 합계를 포인트 이력 테이블에 등록
      totalPoint: grantPoint // 사용자 테이블에 등록될 포인트
    }))
    .then(response => {
      if(response.payload.success) {
        setShowTotal(false);
        setShowSuccess(true);
        
        // 쿠폰 이력정보 등록
        if (Coupon.code) {
          const regResult = regCouponHistory();
          regResult.then(result => {
            if (!result) console.log("Failed to register coupon history");
          });
        }

        // Order정보 등록
        // sod: 입력할 날짜의 변형 (Paypal 결제인 경우 Payment의 createdAt를 sod로 사용)
        let tmpDate = new Date(response.payload.payment.createdAt);
        let uniqueDate = tmpDate.getFullYear() + "-" + (tmpDate.getMonth() + 1) + "-" + tmpDate.getDate() + "-" + tmpDate.getHours() + "-" + tmpDate.getMinutes();
        const date = new Date(tmpDate.getTime() - (tmpDate.getTimezoneOffset() * 60000)).toISOString();
        const sod = date;
        // 주소는 페이팔에 등록된 주소를 조합애서 설정한다
        const address = data.address.country_code + ' ' + data.address.postal_code + ' ' + data.address.state + ' ' + data.address.city + ' ' + data.address.line1;
        const body = {
          type: "Paypal",
          userId: props.user.userData._id,
          name: props.user.userData.name,
          lastName: props.user.userData.lastName,
          tel: props.user.userData.tel,
          email: data.email,
          address: address,
          country: data.address.country_code,
          zip: data.address.postal_code,
          sod: sod,
          // Paypal 결제인 경우 userId를 대입해서 결제 성공시 사용자의 카트정보를 삭제할수 있게 한다
          uniqueField: 'paypal_' + props.user.userData._id + '_' + uniqueDate,
          amount: FinalTotal,
          staffName: UNIDENTIFIED,
          paymentStatus: DEPOSITED,
          deliveryStatus: UNIDENTIFIED,
          receiver: props.user.userData.name + ' ' + props.user.userData.lastName,
          receiverTel: props.user.userData.tel
        }
        
        // Paypal은 tmpOrder에 등록하지 않고 직접 Order에 등록한다
        axios.post(`${ORDER_SERVER}/register`, body)
        .then(response => {
          if (response.data.success) {
            console.log('Order information registration success');
          } else {
            alert("Please contact the administrator");
            history.push("/");
          }
        });
      }
    })
  }

  // AliPay 결제
  const handleAliPay = () => {
    // 업데이트할 포인트 계산: (기존포인트 - 사용자가 입력한 포인트) + 획득가능 포인트(총 금액의 10%)
    const grantPoint = AvailablePoints + AcquisitionPoints;

    // AliPay TmpPayment(결제정보) 임시저장, Cart정보 삭제
    dispatch(onSuccessBuyTmp({
      paymentData: paymentData,
      cartDetail: props.user.cartDetail
    }))
    .then(response => {
      if(response.payload.success) {
        // 쿠폰 이력정보 등록
        if (Coupon.code) {
          regCouponHistory();
        }

        // AliPay 결제 확인페이지 이동
        const tmpPaymentId = response.payload.payment._id;
        goPaymentConfirm(tmpPaymentId, grantPoint, 'alipay');
      }
    })
  } 

  // WeChat 결제
  const handleWeChat = () => {
    // 업데이트할 포인트 계산: (기존포인트 - 사용자가 입력한 포인트) + 획득가능 포인트(총 금액의 10%)
    const grantPoint = AvailablePoints + AcquisitionPoints;

    // WeChat TmpPayment(결제정보) 임시저장, Cart정보 삭제
    dispatch(onSuccessBuyTmp({
      paymentData: paymentData, // 결제 성공시 일부 업데이트 함  
      cartDetail: props.user.cartDetail
    }))
    .then(response => {
      if(response.payload.success) {
        // 쿠폰 이력테이블에 등록
        if (Coupon.code) {
          regCouponHistory();
        }

        // WeChat 결제 확인페이지 이동
        const tmpPaymentId = response.payload.payment._id;
        goPaymentConfirm(tmpPaymentId, grantPoint, 'wechat');
      }
    })
  }

  // ECSystem 확인페이지에 이동(UPC 확인페이지에 넘길 정보 설정)
  const goPaymentConfirm = (tmpPaymentId, grantPoint, paymentType) => {
    let dateInfo = new Date();
    // Cart페이지 에서 결제할때는 sod에 포인트를 대입한다
    // Paypal, LiveStream은 날짜가 대입된다
    const sod = UsePoint + '_' + AcquisitionPoints + '_' + grantPoint;
    let uniqueDate = dateInfo.getFullYear() + "-" + (dateInfo.getMonth() + 1) + "-" + dateInfo.getDate() + " " + dateInfo.getHours() + ":" + dateInfo.getMinutes();
    const loginUserId = props.user.userData._id;
    // 알리페이의 리다이렉트 페이지에 로그인 아이디를 전송하기 위해서
    // 확인 페이지에서 uniqueField에 로그인 아이디를 추가한다 
    const uniqueField = 'cart_' + tmpPaymentId + '_' + uniqueDate;
    const staffName = EC_SYSTEM;
    const sid = SID;
    const siam1 = FinalTotal;

    if (paymentType === 'alipay') {
      history.push(`/payment/alipay/confirm/${loginUserId}/${sid}/${sod}/${siam1}/${uniqueField}/${staffName}/`);
    } else if (paymentType === 'wechat') {
      history.push(`/payment/wechat/confirm/${loginUserId}/${sid}/${sod}/${siam1}/${uniqueField}/${staffName}/`);
    } else {
      alert("Please contact the administrator");
    }
  }

  // 포인트 입력창
  const handlePoint = (e) => {
    if (e.target.value !== "") {
      
      if (isNaN(e.target.value)) {
        alert("Points can only be entered in numbers");
        setUsePoint(0);
        setInputPoint("");
        return false;
      }

      let point = parseInt(e.target.value);

      // 보유포인트가 100 포인트 이하인 경우
      if (MyPoint < 100) {
        alert("Points can be used from 100 points");
        setUsePoint(0);
        setInputPoint("");
        return false;
      }
      // 입력한 포인트가 음수인 경우
      if (point < 0) {
        alert("Please check the available points");
        setUsePoint(0);
        setInputPoint("");
        return false;
      }
      // 입력한 포인트가 보유 포인트보다 많은경우
      if (point > MyPoint) {
        alert("Please check the available points");
        setUsePoint(0);
        setInputPoint("");
        return false;
      }

      setInputPoint(String(point));
      setUsePoint(point);
      
    } else {
      setUsePoint(0);
      setInputPoint("");
    }
  }

  // 포인트 확인 버튼
  const handleConfirmPoint = () => {
    // 숫자가 아닌경우
    if (isNaN(UsePoint)) {
      alert("Points can only be entered in numbers");
      setUsePoint(0);
      setInputPoint("");
      setPointConfirm(0);
      return false;
    }
    // 확인버튼을 클릭했다면
    if (PointConfirm === 1) {
      alert("Points can be applied only once.");
      return false;
    } else {
      // 확인버튼을 클릭 안한 상태로 변경
      setPointConfirm(0);
    }
    // 보유포인트가 100 포인트 이하인 경우
    if (MyPoint < 100) {
      alert("Points can be used from 100 points");
      setUsePoint(0);
      setInputPoint("");
      setPointConfirm(0);
      return false;
    }
    // 입력한 포인트가 100보다 작은경우(음수 포함)
    if (UsePoint < 100) {
      alert("Points can be used from 100 points");
      setUsePoint(0);
      setInputPoint("");
      setPointConfirm(0);
      return false;
    }
    // 입력한 포인트가 보유한 포인트보다 클 경우
    if (UsePoint > MyPoint) {
      alert("Please check the available points.");
      setUsePoint(0);
      setInputPoint("");
      setPointConfirm(0);
      return false;
    }

    // 총금액을 변경한다
    if (FinalTotal <= UsePoint) {
      setFinalTotal(0)
    } else {
      setFinalTotal(FinalTotal - UsePoint);
    }
    // 사용가능한 포인트 계산(보유 포인트 - 사용할 포인트)
    setAvailablePoints(MyPoint - UsePoint);
    // 취득 포인트(구매상품의 포인트 + 세일 포인트 + 쿠폰 포인트)
    setAcquisitionPoints(percent((FinalTotal - UsePoint), PointRate) + saleAcquisitionPoints.current + couponAcquisitionPoints.current);
    // 할인금액
    setDiscount(Number(Discount) + Number(UsePoint));
  }

  // 포인트 크리어 버튼
  const handleClearPoint = () => {
    // 포인트를 반영하지 않은 총 금액으로 돌려준다 
    const total = parseInt(FinalTotal + UsePoint);
    // 포인트를 반영하지 않은 총 할인금액으로 돌려준다
    const discount = parseInt(Discount - UsePoint);
    // 할인금액을 변경
    setDiscount(discount)
    // 총 금액을 변경
    setFinalTotal(total);
    // 포인트 확인버튼 변경(포인트 사용하지 않은 상태로 변경)
    setPointConfirm(0);
    // 사용가능한 포인트를 보유포인트로 돌린다
    setAvailablePoints(MyPoint);
    // 사용자가 입력한 포인트를 0으로 변경
    setUsePoint(0);
    setInputPoint("");
    
    // 세일이 있고 포인트 부여인 경우 상품 취득포인트에 더해준다
    if (saleTotalDiscountAmount.current > 0) {
      // 세일이 있는경우 화면에 세일된 가격을 표시한다
      showSaleTotalRef.current = true;
    } else {
      showSaleTotalRef.current = false;
    }

    // 포인트 구하기(구매상품 포인트 + 세일 포인트 + 쿠폰 포인트)
    const totalPoint = percent(total, PointRate) + saleAcquisitionPoints.current + couponAcquisitionPoints.current;
    setAcquisitionPoints(totalPoint);
  }

  // 쿠폰 입력창
  const handleCoupon = (e) => {
    setCouponCode(e.target.value);
  }

  // 쿠폰 이력정보 등록
  const regCouponHistory = async() => {
    try {
      // 쿠폰 이력정보 셋팅
      let body = {
        code: Coupon.code,
        type: Coupon.type,
        amount: Coupon.amount,
        validFrom: Coupon.validFrom,
        validTo: Coupon.validTo,
        item: Coupon.item,
        active: Coupon.active,
        useWithSale: Coupon.useWithSale,
        count: Coupon.count,
        userId: Coupon.userId,
        productId: Coupon.productId,
        sendMail: Coupon.checkBox,
        couponUserId: props.user.userData._id
      };
      // 쿠폰이력 등록
      const result = await axios.post(`${COUPON_SERVER}/history/register`, body);
      if (result.data.success) {
        console.log('Coupon information has been registered in the coupon history');
        return true;
      }
    } catch (err) {
      console.log('registerCouponHistory err: ', err);
      return false;
    }
  }

  // 쿠폰 확인 버튼
  const handleConfirmCoupon = async() => {
    // 쿠폰은 일회만 사용이 가능(처음 입력한 쿠폰으로 계산된 금액이 있는지 확인)
    if (Coupon.code) {
      alert("Coupon can only be used once");
      return false;
    }

    if (CouponCode === "") {
      alert("Please enter coupon");
      return false;
    }

    // 사용할수 있는 쿠폰인지 쿠폰정보 가져오기
    const couponResult = await axios.get(`${COUPON_SERVER}/coupons_by_cd?cd=${CouponCode}`);
    if (couponResult.data.success) {
      // 등록되어 있는 쿠폰인 경우
      if (couponResult.data.couponInfo.length > 0) {
        const couponInfo = couponResult.data.couponInfo[0];

        // 생일자 쿠폰인 경우 유효기간을 기존 validTo, validFrom이 아닌 
        // 해당 로직에서 사용자 생일월의 1일부터 다음달 말일로 설정한다
        // 유효기간 종료일
        
        // 생일자 쿠폰인 경우
        let strValidTo = couponInfo.validTo.substring(0, 10);
        let today = new Date();
        if (strValidTo === "9999-12-31") {
          // 사용자 생일정보
          let strBirth = props.user.userData.birthday;
          const numMonth = Number(strBirth.substring(4,6));
          const numDate = Number(strBirth.substring(6));
          // 년도를 금년도로 사용자 생일 설정
          let dtBirth = new Date(today.getFullYear(), numMonth -1, numDate);
          // 유효기간 종료월의 마지막 일자 구하기
          let lastDate = new Date(dtBirth.getFullYear(), dtBirth.getMonth() + 2, 0).getDate();
          // 유효기간 시작일
          let expStartDate = new Date(dtBirth.getFullYear(), dtBirth.getMonth(), 1, 0, 0, 0 );
          // 유효기간 종료일(한달후의 날짜 계산용)
          let expEndDate = new Date(dtBirth.getFullYear(), dtBirth.getMonth() + 1, lastDate, 23, 59, 59 );

          if (today < expStartDate) {
            alert("This is not the period during which the birthday coupon can be used");
            setCoupon({});
            setCouponCode("");
            setCouponAmount(0);
            return false;
          }

          if (today > expEndDate) {
            alert("This is not the period during which the birthday coupon can be used");
            setCoupon({});
            setCouponCode("");
            setCouponAmount(0);
            return false;
          }
        } else {
          // 생일자 쿠폰이 아닌경우 유효기간 확인
          // 시간대는 설정이 안되어 있어서 데이트 형으로 바꾸면 같은 시간대로(09:00) 되기때문에 비교가 가능하다
          // currentDate: Mon Sep 12 2022 09:00:00 GMT+0900
          // validTo: Sat Aug 20 2022 09:00:00 GMT+0900
          let tmpCur = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString();
          let curDate = new Date(tmpCur.substring(0, 10));
          // 유효기간 종료일
          const dtValidTo = new Date(couponInfo.validTo);
          if(dtValidTo < curDate) {
            alert("This coupon has expired");
            setCoupon({});
            setCouponCode("");
            setCouponAmount(0);
            return false;
          }
        }

        // 세일정보와 사용이 가능한 쿠폰인지
        const useWithSale = Number(couponInfo.useWithSale);
        // 세일정보가 있는데 세일만 사용이 가능한 쿠폰인 경우
        if (saleTotalDiscountAmount.current > 0 && useWithSale === UseWithSale[2].key) {
          alert("This coupon cannot be used with sales");
          setCoupon({});
          setCouponCode("");
          setCouponAmount(0);
          return false;
        }

        // 쿠폰 사용횟수를 다 사용했는지("": 무제한)
        const count = couponInfo.count;
        // 쿠폰 사용횟수가 무제한이 아닌경우
        if (count !== "") {
          // 사용자가 해당 쿠폰을 사용한 횟수를 쿠폰 이력에서 확인
          const body = {
            code: couponInfo.code,
            couponUserId: props.user.userData._id,
            type: couponInfo.type
          }
          const historyInfos = await axios.post(`${COUPON_SERVER}/history/list`, body);
          
          if (historyInfos.data.success) {
            // 쿠폰을 사용한적이 있는경우
            if (historyInfos.data.couponInfo.length > 0) {
              // 쿠폰 사용횟수와 동일한 경우(쿠폰 사용횟수보다 클수는 없지만 일단 크거나 같은 조건으로 함)
              if (Number(count) <= historyInfos.data.couponInfo.length) {
                alert("The coupon redemption limit has been exceeded")
                setCoupon({});
                setCouponCode("");
                setCouponAmount(0);
                return false;
              }
            }
          } else {
            alert("Failed to search coupon history information\nPlease contact your administrator")
            setCoupon({});
            setCouponCode("");
            setCouponAmount(0);
            return false;
          }
        }
        // 특정사용자만 사용이 가능한 쿠폰인지 확인 
        const couponUserId = couponInfo.userId;
        if (couponUserId !== "") {
          // 로그인 사용자가 지정된 쿠폰 사용자 인지
          if (couponUserId !== props.user.userData._id) {
            alert("This coupon can only be used by designated users");
            setCoupon({});
            setCouponCode("");
            setCouponAmount(0);
            return false;
          }
        }

        // 0: 쿠폰코드 입력하면 세일은 사용못함
        // 여기서는 쿠폰코드를 입력해서 확인 버튼을 누른거니까 적용된 세일금액은 원래대로 돌린다
        if (useWithSale === UseWithSale[0].key) {
          // 쿠폰을 사용할지 문의
          if (window.confirm("This coupon cannot be used with sales\nWould you like to use a coupon?")) {
            // 가져온 쿠폰정보 보관
            setCoupon(couponInfo);
            // 쿠폰계산
            calcByCouponItem(couponInfo);
          }
        } else {
          // 가져온 쿠폰정보 보관
          setCoupon(couponInfo);
          // 쿠폰계산
          calcByCouponItem(couponInfo);
        }
      } else {
        // 쿠폰이 등록되어 있지 않은경우
        alert("This is an unregistered coupon");
        setCoupon({});
        setCouponCode("");
        setCouponAmount(0);
      }
    } else {
      // 쿠폰정보 가져오기에 실패한 경우
      alert("Failed to get coupon information");
      setCoupon({});
      setCouponCode("");
      setCouponAmount(0);
    } 
  }

  // 카테고리 또는 상품이 지정된 경우 해당 상품금액을 계산한다.
  const calcByCouponItem = async (couponInfo) => {
    // 쿠폰 적용 카테고리 (0: "All", 1: "Cosmetic", 2: "Drug", 3: "Food/Supplement", 4: "Home appliances", 5: "Goods", 6: "Etc")
    const category = Number(couponInfo.item);
    const productId = couponInfo.productId;
    let price = 0;

    // 카테고리가 ALL이 아닌경우
    if (category !== MAIN_CATEGORY[0].key) {
      // 쿠폰 대상상품이 정해진 경우
      if (productId !== "") {
        // 대상상품의 금액을 가져온다
        CartDetail.map(item => {
          if (productId === item._id) {
            price += parseInt(item.price,10) * item.quantity;
          }
        })
      } else {
        // 카트에서 해당 카테고리의 모든 상품의 금액을 찾아서 누적한다
        CartDetail.map(item => {
          if (category === item.continents) {
            price += parseInt(item.price,10) * item.quantity;
          }
        })
      }

      // 대상상품이 있는경우
      if (price > 0) {
        // 쿠폰타입(계산방법)에 의한 계산
        calcByCouponType(price, couponInfo);
      } else {
        // 세일이 있으면 세일가격을 다시 보여준다
        if (saleTotalDiscountAmount.current > 0) {
          showSaleTotalRef.current = true;
        } else {
          showSaleTotalRef.current = false;
        }
        // 상품가격이 0은 세일대상의 상품이 없는것이기에 작업종료 
        alert("There are no categories or products for which coupons can be used");
        setCoupon({});
        setCouponCode("");
        setCouponAmount(0);
        return false;
      }
    // 카테고리가 All인 경우
    } else if (category === MAIN_CATEGORY[0].key) {
      // 카트안의 전체상품의 값을 계산
      CartDetail.map(item => {
        price += parseInt(item.price,10) * item.quantity;
      })

      // 카트의 전체상품가격
      if (price > 0) {
        // 쿠폰타입(계산방법)에 의한 계산
        calcByCouponType(price, couponInfo);
      } else {
        // 세일이 있으면 세일가격을 다시 보여준다
        if (saleTotalDiscountAmount.current > 0) {
          showSaleTotalRef.current = true;
        } else {
          showSaleTotalRef.current = false;
        }
        // 상품가격이 0은 세일대상의 상품이 없는것이기에 작업종료 
        alert("There are no categories or products for which coupons can be used");
        setCoupon({});
        setCouponCode("");
        setCouponAmount(0);
        return false;
      }
    }
  }

  // 쿠폰 타입에 의한 계산
  const calcByCouponType = (targetProductPrice, couponInfo) => {
    const type = couponInfo.type;
    const amount = Number(couponInfo.amount);
    const useWithSale = Number(couponInfo.useWithSale);

    // 카테고리안의 모든상품의 금액을 구한다
    let allProductPrice = 0;
    CartDetail.map(item => {
      allProductPrice += parseInt(item.price,10) * item.quantity;
    })

    // 세일과 함께 사용하는 조건에 따라 세일금액, 포인트, 화면표시여부를 설정한다
    let saleAmount = 0;
    let salePoint = 0;
    if (useWithSale === UseWithSale[0].key) {
      // 쿠폰만 사용할수 있는경우
      saleAmount = 0;
      salePoint = 0;
      showSaleTotalRef.current = false;
    } else {
      // 세일금액이 있는경우
      if (saleTotalDiscountAmount.current > 0) {
        saleAmount = saleTotalDiscountAmount.current;
        // 세일금액 표시 설정
        showSaleTotalRef.current = true;
      } else {
        saleAmount = 0;
        showSaleTotalRef.current = false;
      }
      // 세일 포인트
      salePoint = saleAcquisitionPoints.current;
    }

    // 사용자가 입력한 포인트를 대입
    let usePoint = 0;
    if (PointConfirm > 0 && UsePoint > 0) {
      usePoint = UsePoint;
    } else {
      usePoint = 0;
    }

    // Gross Percentage
    if (type === CouponType[0].key) {
      // 쿠폰 할인금액 계산
      let calcPercentage = parseInt((targetProductPrice * amount) / 100);
      setCouponAmount(calcPercentage);
      couponTotalDiscountAmount.current = calcPercentage;
      couponAcquisitionPoints.current = 0;

      // 총 금액 계산
      const total = parseInt(allProductPrice - saleAmount - usePoint - calcPercentage);
      setFinalTotal(total);

      // 포인트 및 할인금액 계산
      if (total > 0) {
        setAcquisitionPoints(percent(total, PointRate) + salePoint);
        setDiscount(usePoint + saleAmount + calcPercentage);
      } else {
        // 세일의 포인트가 있을수도 있으니 세일포인트를 대입한다
        setAcquisitionPoints(salePoint);
        setDiscount(allProductPrice);
      }
    // Granting points
    // 다음 계산에서 사용할수 있는 포인트를 부여하는것이기에 계산금액에는 영향이 없다.
    } else if (type === CouponType[1].key) {
      // 포인트 부여이기에 쿠폰 할인금액은 0을 설정
      setCouponAmount(0);
      couponTotalDiscountAmount.current = 0;
      couponAcquisitionPoints.current = amount;

      // 총 금액 계산
      const total = parseInt(allProductPrice - saleAmount - usePoint);
      setFinalTotal(total);

      // 취득 가능한 포인트 및 할인금액 계산
      if (total > 0) {
        setAcquisitionPoints(percent(total, PointRate) + salePoint + amount);
        setDiscount(usePoint + saleAmount);
      } else {
        setAcquisitionPoints(salePoint + amount);
        setDiscount(allProductPrice);
      }
    // Discount amount
    } else if (type === CouponType[2].key) {
      // 세일과 포인트가 반영된 총 합계
      let total = parseInt(allProductPrice - saleAmount - usePoint);
      couponTotalDiscountAmount.current = total;
      couponAcquisitionPoints.current = 0;

      // 쿠폰금액(amount)이 상품금액(price)보다 크면 쿠폰의 나머지 금액은 무시한다
      if (total <= amount) {
        setFinalTotal(0);
        setAcquisitionPoints(salePoint);
        setCouponAmount(allProductPrice); // 쿠폰 할인금액
        setDiscount(allProductPrice);
      } else {
        total = parseInt(total - amount);
        setFinalTotal(total);
        setAcquisitionPoints(percent(total, PointRate) + salePoint);
        setCouponAmount(amount);

        const discount = usePoint + saleAmount + amount
        setDiscount(discount);
      }
    }
  }

  // 입력한 쿠폰 삭제
  const handleClearCoupon = () => {
    // 총금액에 적용한 쿠폰금액이 있다면 쿠폰금액을 더해서 원래로 돌려준
    if(Coupon.code) {
      const useWithSale = Number(Coupon.useWithSale);
      
      let saleAmount = 0;
      
      // 세일의 할인금액이 있으면 세일금액을 표시
      if (saleTotalDiscountAmount.current > 0) {
        showSaleTotalRef.current = true;
      } else {
        showSaleTotalRef.current = false;
      }
      // 쿠폰만 사용할수 있는경우는
      if (useWithSale === UseWithSale[0].key) {
        // 쿠폰을 계산할때 총 금액에 세일금액을 반영하지 않아서 
        // 세일금액을 뺀 총 금액을(FinalTotal) 계산해야 한다
        saleAmount = saleTotalDiscountAmount.current;
      }
      // 쿠폰과 세일을 같이 사용할수 있는경우
      if (useWithSale === UseWithSale[1].key) {
        // 쿠폰을 계산할때 총 금액에 세일금액이 반영되어 있어서 
        // 총 금액에(FinalTotal) 세일금액을 빼지 않아도 된다
        saleAmount = 0;
      }

      // 쿠폰을 계산하기 전의 총 금액을 계산한다(세일금액을 반영한 총 금액)
      const total = (FinalTotal + CouponAmount) - saleAmount;
      setFinalTotal(total);

      // 할인금액이 0일수도 있어서 조건을 둔다
      let discount = 0;
      if (Discount > 0) {
        // 쿠폰금액은 적용하지 않고 세일만 적용된 원래 금액으로
        discount = parseInt((Discount - CouponAmount) + saleAmount);
      } else {
        discount = saleAmount;
      }
      setDiscount(discount);
      setCouponCode("");
      setCouponAmount(0);
      setCoupon({});

      const totalPoint = percent(total, PointRate) + saleAcquisitionPoints.current;
      setAcquisitionPoints(totalPoint);

      couponTotalDiscountAmount.current = 0;
      couponAcquisitionPoints.current = 0;
    }
  }

  // 퍼센트로 값 구하기(전체값 * 퍼센트 / 100)
  const percent = (total, rate) => {
    return parseInt((parseInt(total) * parseInt(rate)) / 100);
  }

  return (
    <div style={{width: '85%', margin: '3rem auto'}}>
      <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '38px' }}>
        <h1>{t('Cart.title')}</h1>
      </div>
      <div>
        <UserCardBlock products={props.user.cartDetail} removeItem={removeFromCart}/> 
        <hr />
      </div>
      {ShowTotal ? 
        <div style={{marginTop: '3rem'}}>
          {/* 사용가능한 포인트(기존 포인트 - 사용할 포인트) */}
          <span><b>{t('Cart.point')}</b></span>&nbsp;&nbsp;({t('Cart.availablePoints')}:&nbsp;{Number(AvailablePoints).toLocaleString()})<br />
          {/* 사용자가 입력한 포인트 */}
          <Input id="point" type='text' value={InputPoint} placeholder="points" onChange={handlePoint}  style={{width: '130px'}}/>&nbsp;
          <Button style={{margin: '0 0 0 0'}} onClick={handleConfirmPoint} >Confirm</Button>&nbsp;
          <Button onClick={handleClearPoint} >Clear</Button>
          <br />
          <br />
          
          {/* 사용가능한 쿠폰 */}
          <span><b>{t('Cart.coupon')}</b></span><br />
          <Input id="coupon" type='text' value={CouponCode} placeholder="coupons" onChange={handleCoupon}  style={{width: '130px'}}/>&nbsp;
          <Button style={{margin: '0 0 0 0'}} onClick={handleConfirmCoupon} >Confirm</Button>&nbsp;
          <Button onClick={handleClearCoupon} >Clear</Button>
          <br />
          <br />
          {/* 총 금액에서 계산된 포인트 */}
          <span style={{color:"gray"}}>{t('Cart.acquisitionPoints')}: {AcquisitionPoints.toLocaleString()}</span><br />
          <span style={{color:"gray"}}>{t('Cart.totalAmountSelectedProducts')}: {Total.toLocaleString()}</span><br />
          <span style={{color:"red"}}>{t('Cart.discountAmount')}: {Discount > 0 ? "-" + Discount.toLocaleString(): Discount}</span><br />
          <b>{t('Cart.totalPaymentAmount')}: {FinalTotal.toLocaleString()}</b>&nbsp;&nbsp;
          
          <span style={{textDecoration:"line-through"}}>{showSaleTotalRef.current ? Total.toLocaleString() : undefined}</span>
          <br />
          <br />
        </div>
        : ShowSuccess ? 
            <Result
              status="success"
              title={t('Paypal.successAlert')}
            />
            : 
            <>
              <br />
              <Empty description={false} />
            </>
      }

      {ShowTotal && 
        <Paypal 
          total={FinalTotal} // Paypal 컴포넌트에 프롭스로 가격을 내려준다
          onSuccess={transactionSuccess} // 결제성공시 Paypal결제 정보를 대입받아 실행시킬 메소드를 Paypal 컴포넌트에 프롭스로 보낸다
        />
      }
      
      {ShowTotal && 
        <div>
          <br />
          <Button type="primary" size="large" onClick={handleWeChat}>
            <b><Icon type="wechat" />WeChat</b>
          </Button>
          <Button type="primary" size="large" onClick={handleAliPay}>
            <b><Icon type="alipay" /> AliPay</b>
          </Button>
        </div>
      }

      <br />
      <br />
      <div style={{ display: 'flex', justifyContent: 'center' }} >
        <Button size="large" onClick={handleList}>
          Landing Page
        </Button>
      </div>
    </div>
  )
}

export default CartPage;