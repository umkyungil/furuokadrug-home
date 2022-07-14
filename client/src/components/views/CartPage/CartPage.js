import React, {useEffect, useState} from 'react';
import { useDispatch } from 'react-redux';
import { getCartItems, removeCartItem, onSuccessBuy, onSuccessBuyTmp } from '../../../_actions/user_actions';
import UserCardBlock from './Sections/UserCardBlock';
import { Empty, Button, Result, Icon, Input } from 'antd';
import Paypal from '../../utils/Paypal'
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { SID } from '../../Config';
import { ORDER_SERVER, USER_SERVER } from '../../Config.js';
import axios from 'axios';
import swal from 'sweetalert'
import { set } from 'mongoose';
// CORS 대책
axios.defaults.withCredentials = true;

function CartPage(props) {
  const dispatch = useDispatch();
  const [FinalTotal, setFinalTotal] = useState(0); // 포인트가 계산된 상품 총 금액
  const [Total, setTotal] = useState(0); // 카트의 상품 총 금액
  
  const [FinalTotalPoint, setFinalTotalPoint] = useState(0); // 저장될 포인트
  const [FinalProductTotalPoint, setFinalProductTotalPoint] = useState(0); // 포인트를 사용하지 않을때 누적되는 포인트
  const [ProductTotalPoint, setProductTotalPoint] = useState(0); // 포인트를 사용하지 않을때 누적되는 포인트
  const [UsePoint, setUsePoint] = useState(0); // 사용하는 포인트
  const [MyPoint, setMyPoint] = useState(0); // 기존 저장된어 있는 내 포인트
  const [ShowTotal, setShowTotal] = useState(false);
  const [ShowSuccess, setShowSuccess] = useState(false);
  const history = useHistory();

  useEffect(() => {
    let cartItems=[]
    
    // 리덕스 User state안에 cart 안에 상품이 들어있는지 확인
    if (props.user.userData && props.user.userData.cart) {
      if (props.user.userData.cart.length > 0) {
        
        setMyPoint(props.user.userData.myPoint);
        setFinalTotalPoint(props.user.userData.myPoint);

        // 상품의 ID를 가지고온다
        props.user.userData.cart.forEach(item => {
          cartItems.push(item.id);
        });

        // 1번째 파라메터는 사용자의 카트정보의 상품의 ID
        // 2번째 파라메터는 사용자의 카트정보
        dispatch(getCartItems(cartItems, props.user.userData.cart))
        .then(response => {
          calculateTotal(response.payload);
        })
      } 
    }
  }, [props.user.userData])

    // 다국적언어 설정
	const {t, i18n} = useTranslation();

  // 랜딩페이지 이동
  const listHandler = () => {
    history.push("/");
  }

  // 카트에 들어있는 상품금액 및 누적될 포인트 계산
  let calculateTotal = (cartDetail) => {
    let total = 0;
    let totalPoint = 0;
    cartDetail.map(item => {
      total += parseInt(item.price,10) * item.quantity;
      totalPoint += parseInt(item.point,10) * item.quantity;
    })

    setTotal(total);
    setFinalTotal(total);
    setProductTotalPoint(totalPoint); // 카트상품의 총 포인트
    setFinalProductTotalPoint(totalPoint); // 포인트를 사용할 경우 0을 셋팅한다
    setShowTotal(true);
  }

  // 카트삭제
  let removeFromCart = (productId) => {
    dispatch(removeCartItem(productId))
    .then(response => {
      // 삭제후 카트에 상품이 없는경우
      if (response.payload.productInfo.length <= 0) {
        setShowTotal(false);
      }
    })
  }

  // Paypal 결제성공시 처리
  const transactionSuccess = (data) => {
    // 업데이트할 포인트 계산
    let grantPoint = 0;
    if (UsePoint) {
      // 포인트를 사용한 경우 [기존포인트 - 사용한 포인트]를 누적한다
      grantPoint = FinalTotalPoint;
    } else {
      // 포인트를 사용하지 않을경우 기존 [포인트 + 상품의 총 포인트]를 누적한다
      grantPoint = FinalTotalPoint + FinalProductTotalPoint;
    }
    // Paypal 결제정보 및 history 저장, 상품판매 카운트 업데이트
    dispatch(onSuccessBuy({
      paymentData: data, // Paypal에서 결제 성공시 전해주는 데이타
      cartDetail: props.user.cartDetail, // 카트에 있던 상품 상세정보(카트의 정보가 아닌 상품의 상세정보)
      totalPoint: grantPoint
    }))
    .then(response => {
      if(response.payload.success) {
        setShowTotal(false);
        setShowSuccess(true);

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
          uniqueField: 'paypal' + '_' + props.user.userData._id + '_' + uniqueDate,
          amount: FinalTotal,
          staffName: '未確認',
          paymentStatus: '入金済み',
          deliveryStatus: '未確認',
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

  // Alipay 결제
  const alipayHandler = () => {
    // 결제정보 설정
    const data = {
      address: {
        city: '未設定',
        country_code: "未設定",
        line1: '未設定',
        postal_code: '未設定',
        recipient_name: '未設定',  
        state: '未設定',
      },
      cancelled: '未設定',
      email: '未設定',
      paid: '未設定',
      payerID: '未設定',
      paymentID: '未設定',
      paymentToken: '未設定',
      returnUrl: '未設定',
    };

    // 업데이트할 포인트 계산
    let grantPoint = 0;
    if (UsePoint) {
      // 포인트를 사용한 경우 [기존포인트 - 사용한 포인트]를 누적한다
      grantPoint = FinalTotalPoint;
    } else {
      // 포인트를 사용하지 않을경우 기존 [포인트 + 상품의 총 포인트]를 누적한다
      grantPoint = FinalTotalPoint + FinalProductTotalPoint;
    }

    // Alipay TmpPayment(결제정보) 임시저장, Cart정보 삭제
    dispatch(onSuccessBuyTmp({
      paymentData: data,
      cartDetail: props.user.cartDetail
    }))
    .then(response => {
      if(response.payload.success) {
        const tmpPaymentId = response.payload.payment._id;
        let dateInfo = new Date();
        const sod = grantPoint; // 카트결제시 sod에 포인트대입
        let uniqueDate = dateInfo.getFullYear() + "-" + (dateInfo.getMonth() + 1) + "-" + dateInfo.getDate() + "-" + dateInfo.getHours() + "-" + dateInfo.getMinutes();
        const loginUserId = props.user.userData._id;
        const uniqueField = 'cart' + '_' + tmpPaymentId + '_' + uniqueDate;
        const staffName = 'ECSystem';
        const sid = SID;
        const siam1 = FinalTotal;

        let url = '/payment/alipay/confirm/'
        url = url + loginUserId + '/' + sid + '/' + sod + '/' + siam1 + '/' + uniqueField + '/' + staffName;
        window.open(url);

        // 주문정보 화면으로 이동하기 때문에 카트창은 닫는다
        window.close();
      }
    })
  } 

  // WeChat 결제
  const weChatHandler = () => {
    // 결제정보 설정
    const data = {
      address: {
        city: '未設定',
        country_code: "未設定",
        line1: '未設定',
        postal_code: '未設定',
        recipient_name: '未設定',  
        state: '未設定',
      },
      cancelled: '未設定',
      email: '未設定',
      paid: '未設定',
      payerID: '未設定',
      paymentID: '未設定',
      paymentToken: '未設定',
      returnUrl: '未設定',
    };

    // 업데이트할 포인트 계산
    let grantPoint = 0;
    if (UsePoint) {
      // 포인트를 사용한 경우 [기존포인트 - 사용한 포인트]를 누적한다
      grantPoint = FinalTotalPoint;
    } else {
      // 포인트를 사용하지 않을경우 기존 [포인트 + 상품의 총 포인트]를 누적한다
      grantPoint = FinalTotalPoint + FinalProductTotalPoint;
    }

    // WeChat TmpPayment(결제정보) 임시저장, Cart정보 삭제
    dispatch(onSuccessBuyTmp({
      paymentData: data, // 결제 성공시 일부 업데이트 함  
      cartDetail: props.user.cartDetail
    }))
    .then(response => {
      if(response.payload.success) {
        const tmpPaymentId = response.payload.payment._id;
        let dateInfo = new Date();
        const sod = grantPoint; // 카트결제시 sod에 포인트대입
        let uniqueDate = dateInfo.getFullYear() + "-" + (dateInfo.getMonth() + 1) + "-" + dateInfo.getDate() + "-" + dateInfo.getHours() + "-" + dateInfo.getMinutes();
        const loginUserId = props.user.userData._id;
        const uniqueField = 'cart' + '_' + tmpPaymentId + '_' + uniqueDate;
        const staffName = 'ECSystem';
        const sid = SID;
        const siam1 = FinalTotal;

        let url = '/payment/wechat/confirm/'
        url = url + loginUserId + '/' + sid + '/' + sod + '/' + siam1 + '/' + uniqueField + '/' + staffName;
        window.open(url);

        // 주문정보 화면으로 이동하기 때문에 카트창은 닫는다
        window.close();
      }
    })
  }
  
  const pointButtonHandler = () => {
    setUsePoint(MyPoint);
    // 총금액을 변경한다
    setFinalTotal(Total - MyPoint)
    // 포인트를 변경한다
    setFinalTotalPoint(0)
    // 포인트를 사용해서 물건을 구매할 경우 구매상품의 포인트는 누적을 안한다.
    setFinalProductTotalPoint(0);
  }

  const pointInputHandler = (e) => {
    let point = 0;

    if (e.target.value) point = e.target.value;
    
    if (point < 0) {
      alert("check the point");
      setFinalTotal(Total);
      setFinalTotalPoint(MyPoint);
      setUsePoint(0);
      return false;
    }
    if (point > MyPoint) {
      alert("check the point");
      setFinalTotal(Total);
      setFinalTotalPoint(MyPoint);
      setUsePoint(0);;
      return false;
    }
    
    // 사용할 포인트 저장
    setUsePoint(point);
    // 총금액을 변경한다
    setFinalTotal(Total - point)
    // 포인트 계산
    setFinalTotalPoint(MyPoint - point)
    // 포인트를 사용해서 물건을 구매할 경우 구매상품의 포인트는 누적을 안한다.
    if (point > 0) {
      setFinalProductTotalPoint(0);
    } else {
      setFinalProductTotalPoint(ProductTotalPoint);
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
          <span style={{color:"gray"}}>{t('Cart.availablePoints')}:&nbsp;{Number(FinalTotalPoint).toLocaleString()}</span>&nbsp;&nbsp;&nbsp;&nbsp;
          <span style={{color:"gray"}}>{t('Cart.TotalPointsSelectedProducts')}:&nbsp;{Number(FinalProductTotalPoint).toLocaleString()}</span><br />
          <Input id="point" type='number' value={UsePoint} placeholder="Enter the points to use" onChange={pointInputHandler}  style={{width: '180px'}}/>&nbsp;
          <Button type="dashed" onClick={pointButtonHandler}>full use</Button><br /><br />

          {/* <span style={{color:"gray"}}>{t('Cart.availableCoupons')}</span><br />
          <Input id="coupon" placeholder="Enter the coupons to use" onChange={pointInputHandler} value={UsePoint} style={{width: '260px'}}/><br /><br /> */}

          <span style={{color:"gray"}}>{t('Cart.TotalAmountSelectedProducts')}: {Number(Total).toLocaleString()}</span>&nbsp;&nbsp;&nbsp;&nbsp;
          <span style={{color:"red"}}>{t('Cart.discountAmount')}: {Number(UsePoint).toLocaleString()}</span>
          <h2>{t('Cart.totalPaymentAmount')}: {Number(FinalTotal).toLocaleString()}</h2>
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
          total={Total} // Paypal 컴포넌트에 프롭스로 가격을 내려준다
          onSuccess={transactionSuccess} // 결제성공시 Paypal결제 정보를 대입받아 실행시킬 메소드를 Paypal 컴포넌트에 프롭스로 보낸다
        />
      }
      
      {ShowTotal && 
        <div>
          <br />
          <Button type="primary" size="large" onClick={weChatHandler}>
            <b><Icon type="wechat" />WeChat</b>
          </Button> &nbsp;&nbsp;
          <Button type="primary" size="large" onClick={alipayHandler}>
            <b><Icon type="alipay" /> Alipay</b>
          </Button>
        </div>
      }
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
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