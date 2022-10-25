import React, {useEffect, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import UserCardBlock from './Sections/UserCardBlock';
import Paypal from '../../utils/Paypal'
import axios from 'axios';
import swal from 'sweetalert'
import { Empty, Button, Result, Icon, Input } from 'antd';
import { getCartItems, removeCartItem, onSuccessBuy, onSuccessBuyTmp } from '../../../_actions/user_actions';
import { ORDER_SERVER, COUPON_SERVER, POINT_SERVER, SALE_SERVER, SID } from '../../Config.js';
import { NotSet, Unidentified, Deposited, ECSystem, MainCategory, UseWithSale, CouponType, SaleType } from '../../utils/Const';
// CORS 대책
axios.defaults.withCredentials = true;

function CartPage(props) {
  const [CartDetail, setCartDetail] = useState([]);
  const [FinalTotal, setFinalTotal] = useState(0); // 포인트가 계산된 상품 총 금액
  const [Total, setTotal] = useState(0); // 카트의 상품 총 금액
  const [Discount, setDiscount] = useState(0); // 할인금액
  const [AvailablePoints, setAvailablePoints] = useState(0); // 보유하고 있는 포인트 - 사용자가 입력한 포인트
  const [AcquisitionPoints, setAcquisitionPoints] = useState(0); // 구매시 취득가능한 포인트(총금액의 10%)
  const [UsePoint, setUsePoint] = useState(0); // 사용자가 입력한 포인트
  const [PointConfirm, setPointConfirm] = useState(0); // 포인트 확인 버튼을 눌렀는지 확인
  const [MyPoint, setMyPoint] = useState(0); // 보유 포인트
  const [Coupon, setCoupon] = useState({}); // 사용자가 입력한 쿠폰코드로 검색한 쿠폰정보
  const [CouponCode, setCouponCode] = useState(""); // 사용자가 입력한 쿠폰
  const [CouponAmount, setCouponAmount] = useState(0); // 쿠폰타입에 의해 계산된 할인금액
  const [ShowTotal, setShowTotal] = useState(false);
  const [ShowSuccess, setShowSuccess] = useState(false);
  
  const dispatch = useDispatch();
  const history = useHistory();
  const showSaleTotalRef = useRef(false); // 세일금액 표시(화면이 리로드되도 저장됨)
  const saleTotalDiscountAmount = useRef(0);
  const saleAcquisitionPoints = useRef(0);

  // 결제정보 설정
  const paymentData = {
    address: {
      city: NotSet,
      country_code: NotSet,
      line1: NotSet,
      postal_code: NotSet,
      recipient_name: NotSet,  
      state: NotSet,
    },
    cancelled: NotSet,
    email: NotSet,
    paid: NotSet,
    payerID: NotSet,
    paymentID: NotSet,
    paymentToken: NotSet,
    returnUrl: NotSet,
  };

  useEffect(() => {
    let cartItems=[]
    
    // 리덕스 User state안에 cart 안에 상품이 들어있는지 확인
    if (props.user.userData && props.user.userData.cart) {
      if (props.user.userData.cart.length > 0) {
        // 사용자의 사용가능 포인트 재 계산
        const myPoint = getCalcPoint(props.user.userData._id);
        myPoint.then(totalPoint => {
          // 현재 보유포인트
          setMyPoint(totalPoint);
          setAvailablePoints(totalPoint);
        });

        // 상품의 ID를 가지고온다
        props.user.userData.cart.forEach(item => {
          cartItems.push(item.id);
        });

        // 1번째 파라메터는 사용자의 카트정보의 상품의 ID
        // 2번째 파라메터는 사용자의 카트정보
        dispatch(getCartItems(cartItems, props.user.userData.cart))
        .then(response => {
          calculateTotal(response.payload);

          // 카트에 들어있는 상품금액 및 누적될 포인트 계산
          const cartDetail = response.payload;
          let total = 0;
          cartDetail.map(item => {
            total += parseInt(item.price,10) * item.quantity;
          })

          setCartDetail(cartDetail); // 카트의 모든 상품정보
          setTotal(total); // 카트의 상품 누적금액
          setFinalTotal(total);
          setAcquisitionPoints(parseInt(total/100)); // 취득할 포인트는 총금액에서 100으로 나누어서 계산된 포인트를 대입한다
          setDiscount(0);
          setShowTotal(true);

          // 세일정보가 있을경우 총 합계, 취득 포인트, 할인금액등을 계산한다
          const mySale = getSale();
          mySale.then(saleInfos => {
            if (saleInfos) {
              showSaleTotalRef.current = true;
              calcBySaleItem(saleInfos, cartDetail)

            } else {
              showSaleTotalRef.current = false;
            }
          })
        })
      } 
    }
  }, [props.user.userData])

  // 현재날짜가 포함되어 있는 모든 세일정보 가져오기
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
    }
  }

  // 카테고리 또는 상품이 지정된 경우 세일금액을 계산한다.
  const calcBySaleItem = async (saleInfos, cartDetail) => {
    // 상품아이디의 세일정보를 저장(카테고리 ALL인 경우는 상품을 지정할수 없다)
    let saleProduct = [];
    for (let i=0; i<saleInfos.length; i++) {
      // 카테고리와 관계없이 상품아이디 세일정보가 있는경우
      if (!saleInfos[i].except && saleInfos[i].productId !== "") {
        saleProduct.push(saleInfos[i]);
      }
    }
    // 카테고리가 ALL이 아닌 세일정보를 저장
    let saleCategory = [];
    for (let i=0; i<saleInfos.length; i++) {
      // 카테고리 세일정보가 ALL이 아니고 상품아이디가 지정되지 않은경우 
      if (!saleInfos[i].except && saleInfos[i].item !== 0 && saleInfos[i].productId === "") {
        saleCategory.push(saleInfos[i]);
      } 
    }
    // 카테고리가 ALL인 세일정보를 저장
    let allCategory = [];
    for (let i=0; i<saleInfos.length; i++) {
      // 카테고리 세일정보가 ALL이고 상품아이디가 지정되지 않은경우 
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
    // 세일대상 제외인 상품아이디 세일정보를 저장
    let exceptProduct = [];
    for (let i=0; i<saleInfos.length; i++) {
      // 카테고리가 세일대상 제외이고 상품아이디가 지정되지 않은경우 
      if (saleInfos[i].except && saleInfos[i].item !== 0 && saleInfos[i].productId !== "") {
        exceptProduct.push(saleInfos[i]);
      } 
    }

    //=================================
    //            세일계산
    //=================================
    let totalDiscountAmount = 0;
    let totalAcquisitionPoints = 0;
    let tmpCartDetail = [];

    // cartDetail copy
    const copyCartDetail = [...cartDetail];

    // 세일대상 제외 상품을 삭제
    tmpCartDetail =[...copyCartDetail];
    for (let i=0; i<exceptProduct.length; i++) {
      for (let j=0; j<tmpCartDetail.length; j++) {
        if (exceptProduct[i].productId === tmpCartDetail[j]._id) {
          copyCartDetail.splice(j, 1);
        }
      }
    }
    // 세일대상 제외 카테고리의 상품을 삭제
    tmpCartDetail =[...copyCartDetail];
    for (let i=0; i<exceptCategory.length; i++) {
      for (let j=0; j<tmpCartDetail.length; j++) {
        if (exceptCategory[i].item === tmpCartDetail[j].continents) {
          copyCartDetail.splice(j, 1);
        }
      }
    }
    
    // 상품세일이 있으면 적용
    tmpCartDetail =[...copyCartDetail];
    for (let i=0; i<saleProduct.length; i++) {
      let price = 0;
      let count = 0;
      
      // for문 이지만 상품하나의 전체 값이 계산된다
      for (let j=0; j<tmpCartDetail.length; j++) {
        // 상품세일의 대상 상품이 카트에 있다면 해당상품의 합계를 구한다
        if (saleProduct[i].productId === tmpCartDetail[j]._id) {
          price += parseInt(tmpCartDetail[j].price,10) * tmpCartDetail[j].quantity;
          count = tmpCartDetail[j].quantity;
          // 해당상품을 카트에서 삭제한다
          copyCartDetail.splice(j, 1);
        }
      }

      // 상품세일에 최소금액이 있는경우
      if (saleProduct[i].minAmount !== "") {
        const minProductAmount = Number(saleProduct[i].minAmount);
        // 해당 상품의 합계금액이 최소금액보다 작은경우 세일계산을 하지 않는다
        if (price < minProductAmount) {
          price = 0;
        }
      }
      
      // price > 0은 상품세일의 대상 상품이 카트에 있어서 세일을 적용한경우
      if (price > 0) {
        // 상품세일에 의한 할인금액 또는 포인트를  구한다
        const saleProductAmount  = calcBySaleType(price, saleProduct[i]);

        if (saleProduct[i].type === SaleType[1].key) {
          // 상품갯수당 포인트를 부여한다
          const point = saleProductAmount * count;
          totalAcquisitionPoints += point;
        } else {
          totalDiscountAmount += saleProductAmount
        }
      }
    }

    // 카테고리 ALL 이외의 세일이 있으면 적용
    tmpCartDetail = [...copyCartDetail];
    for (let i=0; i<saleCategory.length; i++) {
      let price = 0;
      let count = 0;
      
      for (let j=0; j<tmpCartDetail.length; j++) {
        // 카테고리 세일의 대상 상품이 카트에 있다면 해당상품의 합계를 구한다
        if (saleCategory[i].item === tmpCartDetail[j].continents ) {
          price += parseInt(tmpCartDetail[j].price,10) * tmpCartDetail[j].quantity;
          count = tmpCartDetail[j].quantity;
          // 해당상품을 카트에서 삭제한다
          copyCartDetail.splice(j, 1);
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
          totalAcquisitionPoints += point;
        } else {
          totalDiscountAmount += saleCategoryAmount;
        }
      }
    }
    
    // 카테고리 ALL인 세일정보가 있는 경우
    tmpCartDetail = [...copyCartDetail];
    // 카테고리 ALL은 하나만 존재한다
    for (let i=0; i<allCategory.length; i++) {
      let price = 0;
      let count = 0;
      
      for (let j=0; j<tmpCartDetail.length; j++) {
        price += parseInt(tmpCartDetail[j].price,10) * tmpCartDetail[j].quantity;
        count = tmpCartDetail[j].quantity;
        copyCartDetail.splice(j, 1);
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
        
        if (allCategory[i].type === SaleType[1].key) {
          // 상품갯수당 포인트를 부여한다
          const point = allCategoryAmount * count;
          totalAcquisitionPoints += point;
        } else {
          totalDiscountAmount += allCategoryAmount;
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
      // 구매상품의 총 금액에 해당하는 포인트는 없지만 포인트 부여로 취득한 포인트가 있을수 있다
      setAcquisitionPoints(totalAcquisitionPoints);
      saleAcquisitionPoints.current = totalAcquisitionPoints;
      // 세일 총 금액은 구매 총금액을 대입한다
      saleTotalDiscountAmount.current = allProductPrice;
      setDiscount(allProductPrice);
    } else {
      // 세일은 포인트나 쿠폰을 계산하기 전 이니까 총금액을 카트의 총금액에서 할인금액을 빼도 된다
      let total = parseInt(allProductPrice - totalDiscountAmount);
      setFinalTotal(total);
      // 포인트 부여로 취득한 포인트와 구매상품의 총 금액에서 취득한 포인트를 추가한다
      const point = parseInt(total / 100);
      totalAcquisitionPoints += point;
      setAcquisitionPoints(totalAcquisitionPoints);
      saleAcquisitionPoints.current = totalAcquisitionPoints;

      saleTotalDiscountAmount.current = totalDiscountAmount;
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
      // 전체금액이 아닌 해당상품의 총 금액에서 할인율을 적용한다
      discountAmount = parseInt((targetProductPrice * amount) / 100);
    // 1: Granting points(포인트 부여)
    } else if (type === SaleType[1].key) {
      // 포인트를 돌려준다
      discountAmount = amount;
    // 2: Discount amount(할인금액)
    } else if (type === SaleType[2].key) {
      discountAmount = amount
    }

    return discountAmount;
  }

  // 다국적언어 설정
	const {t, i18n} = useTranslation();

  // 랜딩페이지 이동
  const listHandler = () => {
    history.push("/");
  }

  // 카트에 들어있는 상품금액 및 누적될 포인트 계산
  let calculateTotal = (cartDetail) => {
    let total = 0;
    cartDetail.map(item => {
      total += parseInt(item.price,10) * item.quantity;
    })

    setCartDetail(cartDetail); // 카트의 모든 상품정보
    setTotal(total); // 카트의 상품 누적금액
    setFinalTotal(total);
    setAcquisitionPoints(parseInt(total/100)); // 취득할 포인트는 총금액에서 100으로 나누어서 계산된 포인트를 대입한다
    setDiscount(0);
    setShowTotal(true);
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
      const result = await axios.get(`${POINT_SERVER}/users_by_id?id=${userId}`);
        
      if (result.data.success) {
        let pointInfos = result.data.pointInfos;

        for (let i=0; i<pointInfos.length; i++) {
          totalPoint += pointInfos[i].remainingPoints;
        }
      } else {
        alert("Failed to get point information")
      }

      return totalPoint;
    } catch (err) {
      console.log("getCalcPoint err: ",err);
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
          sod: sod,
          // Paypal 결제인 경우 userId를 대입해서 결제 성공시 사용자의 카트정보를 삭제할수 있게 한다
          uniqueField: 'paypal_' + props.user.userData._id + '_' + uniqueDate,
          amount: FinalTotal,
          staffName: Unidentified,
          paymentStatus: Deposited,
          deliveryStatus: Unidentified,
          receiver: props.user.userData.name + ' ' + props.user.userData.lastName,
          receiverTel: props.user.userData.tel
        }
        
        axios.post(`${ORDER_SERVER}/register`, body)
        .then(response => {
          if (response.data.success) {
            console.log('Order information registration success');
          } else {
            swal({
              title: "An error occurred in registering payment information",
              text: "Please contact the administrator.",
              icon: "error",
              button: "OK",
            }).then((value) => {
              history.push("/");
            });
          }
        });
      }
    })
  }

  // AliPay 결제
  const aliPayHandler = () => {
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
        let url = '/payment/alipay/confirm/'
        goPaymentConfirm(tmpPaymentId, grantPoint, url);
      }
    })
  } 

  // WeChat 결제
  const weChatHandler = () => {
    // 업데이트할 포인트 계산: (기존포인트 - 사용자가 입력한 포인트) + 획득가능 포인트(총 금액의 10%)
    const grantPoint = AvailablePoints + AcquisitionPoints;

    // WeChat TmpPayment(결제정보) 임시저장, Cart정보 삭제
    dispatch(onSuccessBuyTmp({
      paymentData: paymentData, // 결제 성공시 일부 업데이트 함  
      cartDetail: props.user.cartDetail
    }))
    .then(response => {
      if(response.payload.success) {

        // 쿠폰 이력정보 등록
        if (Coupon.code) {
          regCouponHistory();
        }

        // WeChat 결제 확인페이지 이동
        const tmpPaymentId = response.payload.payment._id;
        let url = '/payment/wechat/confirm/'
        goPaymentConfirm(tmpPaymentId, grantPoint, url);
        
        // let dateInfo = new Date();
        // const sod = 'cart' + '_' + UsePoint + '_' + AcquisitionPoints + '_' + grantPoint; // 카트결제시 sod에 포인트 대입
        // let uniqueDate = dateInfo.getFullYear() + "-" + (dateInfo.getMonth() + 1) + "-" + dateInfo.getDate() + "-" + dateInfo.getHours() + "-" + dateInfo.getMinutes();
        // const loginUserId = props.user.userData._id;
        // const uniqueField = 'cart' + '_' + tmpPaymentId + '_' + uniqueDate;
        // const staffName = ECSystem;
        // const sid = SID;
        // const siam1 = FinalTotal;
        
        // url = url + loginUserId + '/' + sid + '/' + sod + '/' + siam1 + '/' + uniqueField + '/' + staffName;
        // window.open(url);

        // // 주문정보 화면으로 이동하기 때문에 카트창은 닫는다
        // window.close();
      }
    })
  }

  // ECSystem 확인페이지에 이동(UPC 확인페이지에 넘길 정보 설정)
  const goPaymentConfirm = (tmpPaymentId, grantPoint, upcUrl) => {
    let dateInfo = new Date();
    const sod = 'cart_' + UsePoint + '_' + AcquisitionPoints + '_' + grantPoint; // Cart페이지 에서 결제할때는 sod에 포인트를 대입한다
    let uniqueDate = dateInfo.getFullYear() + "-" + (dateInfo.getMonth() + 1) + "-" + 
      dateInfo.getDate() + "-" + dateInfo.getHours() + "-" + dateInfo.getMinutes();
    const loginUserId = props.user.userData._id;
    const uniqueField = 'cart_' + tmpPaymentId + '_' + uniqueDate;
    const staffName = ECSystem;
    const sid = SID;
    const siam1 = FinalTotal;

    const url = upcUrl + loginUserId + '/' + sid + '/' + sod + '/' + siam1 + '/' + uniqueField + '/' + staffName;
    window.open(url);
    // 자신의 페이지는 닫는다
    window.close();
  }

  // 포인트 입력창
  const pointInputHandler = (e) => {
    let point = e.target.value;

    // 보유포인트가 100 포인트 이하인 경우
    if (MyPoint < 100) {
      alert("Points can be used from 100 points");
      setUsePoint(0);
      return false;
    }
    // 입력한 포인트가 음수인 경우
    if (point < 0) {
      alert("Please check the available points");
      setUsePoint(0);
      return false;
    }
    // 입력한 포인트가 보유 포인트보다 많은경우
    if (point > MyPoint) {
      alert("Please check the available points");
      setUsePoint(0);
      return false;
    }

    setUsePoint(point);
  }

  // 포인트 확인 버튼
  const pointConfirmHandler = () => {
    // 확인 버튼을 눌렀었는지 확인
    if (PointConfirm !== 0) {
      alert("Points can be applied only once.");
      return false;
    } else {
      setPointConfirm(1);
    }

    // 보유포인트가 100 포인트 이하인 경우
    if (MyPoint < 100) {
      alert("Points can be used from 100 points");
      setUsePoint(0);
      setPointConfirm(0);
      return false;
    }
    // 입력한 포인트가 100보다 작은경우(음수 포함)
    if (UsePoint < 100) {
      alert("Points can be used from 100 points");
      setUsePoint(0);
      setPointConfirm(0);
      return false;
    }
    // 입력한 포인트가 보유한 포인트보다 클 경우
    if (UsePoint > MyPoint) {
      alert("Please check the available points.");
      setUsePoint(0);
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
    // 취득할 포인트는 (총금액 - 사용할 포인트) / 100 의 값을 대입
    setAcquisitionPoints(parseInt((FinalTotal - UsePoint) / 100));
    // 할인금액
    setDiscount(Number(Discount) + Number(UsePoint));
  }

  // 포인트 크리어 버튼
  const clearPointHandler = () => {
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
    
    // 세일이 있고 포인트 부여인 경우 상품 취득포인트에 더해준다
    if (saleTotalDiscountAmount.current > 0) {
      // 세일이 있는경우 화면에 세일된 가격을 표시한다
      showSaleTotalRef.current = true;
    } else {
      showSaleTotalRef.current = false;
    }
    // 쿠폰이 있는경우, 쿠폰의 지불방법이 포인트 부여인 경우 상품 취득포인트에 더해준다
    let couponPoint = 0;
    if (Coupon.code) {
      if (Coupon.type === CouponType[1].key) {
        couponPoint = Coupon.amount
      }
    }
    const totalPoint = parseInt(total / 100) + saleAcquisitionPoints.current + couponPoint;
    setAcquisitionPoints(totalPoint);
  }

  // 쿠폰 입력창
  const couponHandler = (e) => {
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
  const couponConfirmHandler = async() => {
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

        // 유효기간 확인
        // 시간대는 설정이 안되어 있어서 데이트 형으로 바꾸면 같은 시간대로(09:00) 되기때문에 비교가 가능하다
        // currentDate: Mon Sep 12 2022 09:00:00 GMT+0900
        // validTo: Sat Aug 20 2022 09:00:00 GMT+0900
        const dt = new Date()
        let tmpCur = new Date(dt.getTime() - (dt.getTimezoneOffset() * 60000)).toISOString();
        let currentDate = new Date(tmpCur.substring(0, 10));
        // 유효기간 종료일
        const validTo = new Date(couponInfo.validTo);
        
        if(validTo < currentDate) {
          alert("This coupon has expired");
          setCoupon({});
          setCouponCode("");
          setCouponAmount(0);
          return false;
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
              if (historyInfos.data.couponInfo.length >= Number(count)) {
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

        // 쿠폰을 사용할지 문의
        if (window.confirm("Would you like to use a coupon?")) {
          // 가져온 쿠폰정보 보관
          setCoupon(couponInfo);
          
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

          // 세일정보가 있는경우
          if (showSaleTotalRef.current) {
            // 0: 쿠폰코드 입력하면 세일은 사용못함
            // 여기서는 쿠폰코드를 입력해서 확인 버튼을 누른거니까 적용된 세일금액은 원래대로 돌린다
            if (useWithSale === UseWithSale[0].key) {
              // 쿠폰을 사용할지 문의
              if (window.confirm("This coupon cannot be used with sales\nWould you like to use a coupon?")) {
                // 카테고리 또는 상품이 지정된 경우 해당 상품금액을 계산한다.
                calcByCouponItem(couponInfo);
                
              } else {
                // 세일은 카트페이지가 열릴때 적용했기 때문에 여기서는 아무 처리를 안해도되나 명시적으로 쿠폰 정보를 지운다
                setCoupon({});
                setCouponCode("");
                setCouponAmount(0);
              }
            } else if (useWithSale === UseWithSale[1].key) {
              // 세일은 카트페이지가 열릴때 적용했기 때문에 쿠폰만 계산한다
              calcByCouponItem(couponInfo);
            }
          } else {
            // 세일이 없고 쿠폰만 계산한다
            calcByCouponItem(couponInfo);
          }
        } else {
          // 쿠폰 Confirm에서 Cancel했을 경우
          setCoupon({});
          setCouponCode("");
          setCouponAmount(0);
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
    // 지정된 상품이 있는지 확인
    const productId = couponInfo.productId;
    
    // 카테고리가 ALL이 아닌경우
    let price = 0;
    if (category !== MainCategory[0].key) {
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
        if (saleTotalDiscountAmount.current > 0) showSaleTotalRef.current = true;
        // 상품가격이 0은 세일대상의 상품이 없는것이기에 작업종료 
        alert("Coupons that can only be used on specific products or categories");

        setCoupon({});
        setCouponCode("");
        setCouponAmount(0);
        return false;
      }
    // 카테고리가 All인 경우
    } else if (category === MainCategory[0].key) {
      // 쿠폰 대상상품이 정해진 경우
      if (productId !== "") {
        // 해당 상품을 카트에서 찾아서 금액을 대입 
        CartDetail.map(item => {
          if (productId === item._id) {
            price += parseInt(item.price,10) * item.quantity;
          }
        })

        // 해당상품이 있는경우
        if (price > 0) {
          // 쿠폰타입(계산방법)에 의한 계산
          calcByCouponType(price, couponInfo);
        } else {
          // 세일이 있으면 세일가격을 다시 보여준다
          if (saleTotalDiscountAmount.current > 0) showSaleTotalRef.current = true;
          // 상품가격이 0은 세일대상의 상품이 없는것이기에 작업종료 
          alert("Coupons that can only be used on specific products or categories");

          setCoupon({});
          setCouponCode("");
          setCouponAmount(0);
          return false;
        }
      } else {
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
          if (saleTotalDiscountAmount.current > 0) showSaleTotalRef.current = true;
          // 상품가격이 0은 세일대상의 상품이 없는것이기에 작업종료 
          alert("Coupons that can only be used on specific products or categories");

          showSaleTotalRef.current = false;
          return false;
        }
      }
    }
  }

  // 쿠폰 타입에 의한 계산
  // price: 세일금액을 적용하지 않은 전체금액 또는 특정상품 또는 특정 카테고리의 누적금액
  // useWithSale: 쿠폰이 세일과 같이 사용할수 없는경우 총 금액에서 세일금액을 가산해서 원래 총 금액으로 돌린다 
  const calcByCouponType = (targetProductPrice, couponInfo) => {
    // 쿠폰 타입("0": "Gross Percentage", "1": "Granting points", "2": "Discount amount")
    const type = couponInfo.type;
    const amount = Number(couponInfo.amount);
    const useWithSale = Number(couponInfo.useWithSale);

    // 카테고리 또는 특정상품과 관계없이 카테고리안의 모든상품의 금액을 구한다
    let allProductPrice = 0;
    CartDetail.map(item => {
      allProductPrice += parseInt(item.price,10) * item.quantity;
    })

    // 쿠폰만 사용할수 있는경우는 세일금액을 0으로 한다
    // 세일과 같이 사용할수 있는 경우는 총합계가 이미 세일이 반영된 금액이니깐 
    // 세일금액을 0으로 해서 총합계를 재 계산할때 쿠폰금액만 플러스 될수 있도록 한다
    let saleAmount = 0;
    if (useWithSale === UseWithSale[0].key) {
      saleAmount = 0;
    } else {
      saleAmount = saleTotalDiscountAmount.current;
    }

    if (saleTotalDiscountAmount.current > 0) {
      if (useWithSale === UseWithSale[0].key) {
        showSaleTotalRef.current = false;
      } else {
        showSaleTotalRef.current = true;
      }
    }

    // 세일에 포인트가 있으면 포인트를 대입한다
    const salePoint = saleAcquisitionPoints.current;

    let usePoint = 0;
    if (PointConfirm > 0 && UsePoint > 0) {
      usePoint = UsePoint;
    } else {
      usePoint = 0;
    }

    // 0: Gross Percentage(총 금액의 몇 퍼센트 할인)
    if (type === CouponType[0].key) {
      // 쿠폰 할인금액 계산
      let calcPercentage = parseInt((targetProductPrice * amount) / 100);
      setCouponAmount(calcPercentage);
      // 총 금액 계산
      const total = parseInt(allProductPrice - saleAmount - usePoint - calcPercentage);
      setFinalTotal(total);

      // 포인트 재 계산(총 금액의 10%)
      if (total > 0) {
        setAcquisitionPoints(parseInt(total / 100) + salePoint);
      } else {
        // 총금액이 0이면 취득포인트도 0으로 셋팅
        setAcquisitionPoints(0)
      }

      // 할인금액
      let discount = usePoint + saleAmount + calcPercentage  
      if (total > 0) {
        setDiscount(discount);
      } else {
        setDiscount(allProductPrice);
      }

    // 1: Granting points(포인트 부여)
    // 다음 계산에서 사용할수 있는 포인트를 부여하는것이기에 계산금액에는 영향이 없다.
    } else if (type === CouponType[1].key) {
      // 포인트 부여이기에 쿠폰 할인금액은 0을 설정
      setCouponAmount(0);
      // 총 금액 계산
      const total = parseInt(allProductPrice - saleAmount - usePoint);
      setFinalTotal(total);

      // 취득 가능한 포인트에 가산
      if (total > 0) {
        const point = parseInt(total / 100) + salePoint + amount;
        setAcquisitionPoints(point);
      } else {
        setAcquisitionPoints(0);
      }

      // 할인금액
      let discount = usePoint + saleAmount;
      if (total > 0) {
        setDiscount(discount);
      } else {
        setDiscount(allProductPrice);
      }

    // 2: Discount amount(할인 금액)
    } else if (type === CouponType[2].key) {
      let total = parseInt(allProductPrice - saleAmount - usePoint);
      // 쿠폰금액(amount)이 상품금액(price)보다 크면 쿠폰의 나머지 금액은 무시한다
      if (total <= amount) {
        setFinalTotal(0);
        setAcquisitionPoints(0);
        setCouponAmount(allProductPrice); // 쿠폰 할인금액
        setDiscount(allProductPrice);
      } else {
        total = parseInt(total - amount);
        setFinalTotal(total);
        setAcquisitionPoints(parseInt(total / 100));
        setCouponAmount(amount);

        const discount = usePoint + saleAmount + amount
        setDiscount(discount);
      }
    }
  }

  // 입력한 쿠폰 삭제
  const clearCouponHandler = () => {
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

      const totalPoint = parseInt(total / 100) + saleAcquisitionPoints.current;
      setAcquisitionPoints(totalPoint);
    }
  }

  return (
    <div style={{width: '85%', margin: '3rem auto'}}>
      <h1>{t('Cart.title')}</h1>
      <div>
        <UserCardBlock products={props.user.cartDetail} removeItem={removeFromCart}/> 
        <hr />
      </div>
      {ShowTotal ? 
        <div style={{marginTop: '3rem'}}>
          {/* 사용가능한 포인트(기존 포인트 - 사용할 포인트) */}
          <span><b>{t('Cart.point')}</b></span>&nbsp;&nbsp;({t('Cart.availablePoints')}:&nbsp;{Number(AvailablePoints).toLocaleString()})<br />
          {/* 사용자가 입력한 포인트 */}
          <Input id="point" type='number' value={UsePoint} placeholder="100 points or more can be used" onChange={pointInputHandler}  style={{width: '130px'}}/>&nbsp;
          <Button onClick={pointConfirmHandler} style={{width: '80px'}}>Confirm</Button>&nbsp;
          <Button onClick={clearPointHandler}>Clear</Button>
          <br />
          <br />
          {/* 사용가능한 쿠폰 */}
          <span><b>{t('Cart.coupon')}</b></span><br />
          <Input id="coupon" type='text' value={CouponCode} placeholder="Enter the coupons to use" onChange={couponHandler}  style={{width: '130px'}}/>&nbsp;
          <Button onClick={couponConfirmHandler} style={{width: '80px'}}>Confirm</Button>&nbsp;
          <Button onClick={clearCouponHandler}>Clear</Button>
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
          <Button type="primary" size="large" onClick={weChatHandler}>
            <b><Icon type="wechat" />WeChat</b>
          </Button> &nbsp;&nbsp;
          <Button type="primary" size="large" onClick={aliPayHandler}>
            <b><Icon type="alipay" /> AliPay</b>
          </Button>
        </div>
      }

      <br />
      <br />
      <div style={{ display: 'flex', justifyContent: 'center' }} >
        <Button size="large" onClick={listHandler}>
          Landing Page
        </Button>
      </div>
    </div>
  )
}

export default CartPage