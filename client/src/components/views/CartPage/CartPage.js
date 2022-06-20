import React, {useEffect, useState} from 'react';
import { useDispatch } from 'react-redux';
import { getCartItems, removeCartItem, onSuccessBuy } from '../../../_actions/user_actions';
import UserCardBlock from './Sections/UserCardBlock';
import { Empty, Button, Result, Alert, Icon } from 'antd';
import Paypal from '../../utils/Paypal'
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { SID } from '../../Config';
import { ORDER_SERVER } from '../../Config.js';
import axios from 'axios';

function CartPage(props) {
  const dispatch = useDispatch();
  const [Total, setTotal] = useState(0);
  const [ShowTotal, setShowTotal] = useState(false);
  const [ShowSuccess, setShowSuccess] = useState(false);
  const [ErrorAlert, setErrorAlert] = useState(false);
  const history = useHistory();

  useEffect(() => {
    let cartItems=[]
    
    // 리덕스 User state안에 cart 안에 상품이 들어있는지 확인
    if (props.user.userData && props.user.userData.cart) {
      if (props.user.userData.cart.length > 0) {
        // 상품의 ID를 가지고온다
        props.user.userData.cart.forEach(item => {
          cartItems.push(item.id)
        });

        // 1번째 파라메터는 사용자의 카트정보의 상품의 ID
        // 2번째 파라메터는 사용자의 카트정보
        dispatch(getCartItems(cartItems, props.user.userData.cart))
        .then(response => {calculateTotal(response.payload)})
      } 
    }
  }, [props.user.userData])

  // 카트에 들어있는 상품 금액 계산
  let calculateTotal = (cartDetail) => {
    let total = 0;
    cartDetail.map(item => {
      total += parseInt(item.price,10) * item.quantity
    })

    setTotal(total);
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
    // Paypal 결제정보 및 history 저장, 상품판매 카운트 업데이트
    dispatch(onSuccessBuy({
      paymentData: data, // Paypal에서 결제 성공시 전해주는 데이타
      cartDetail: props.user.cartDetail // 카트에 있던 상품상세정보(카트의 정보가 아닌 상품의 상세정보)
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
          // 이메일은 유니크하기 때문에 주문정보 페이지에서 삭제를 가능하도록 추가한다.
          uniqueField: 'paypal' + '_' + props.user.userData._id + '_' + uniqueDate,
          amount: Total,
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
            setErrorAlert(true);
            console.log('Failed to register order information');
          }
        });        
      }
    })
  }

  // Paypal 결제실패시 처리
  // Payment, User의 카트정보 삭제 처리와 history정보 등록 처리는 안하고,  Order에만 실패결과를 등록한다.
  const transactionError = () => {
    // Order정보 등록
    let tmpDate = new Date();
    let uniqueDate = tmpDate.getFullYear() + "-" + (tmpDate.getMonth() + 1) + "-" + tmpDate.getDate() + "-" + tmpDate.getHours() + "-" + tmpDate.getMinutes();
    const date = new Date(tmpDate.getTime() - (tmpDate.getTimezoneOffset() * 60000)).toISOString();
    const sod = date;
    const body = {
      type: "Paypal",
      userId: props.user.userData._id,
      name: props.user.userData.name,
      lastName: props.user.userData.lastName,
      tel: props.user.userData.tel,
      email: props.user.userData.email,
      // 배송지는 결제처리가 실패했기 때문에 미설정으로 한다
      address: '未設定',
      sod: sod,
      uniqueField: 'paypal' + '_' + props.user.userData._id + '_' + uniqueDate, 
      amount: Total,
      staffName: '未確認',
      paymentStatus: '入金失敗',
      deliveryStatus: '未確認',
      receiver: '未設定',
      receiverTel: '未設定'
    }
    
    axios.post(`${ORDER_SERVER}/register`, body)
    .then(response => {
      if (response.data.success) {
        console.log('Order information registration success');
      } else {
        setErrorAlert(true);
        console.log('Failed to register order information');
      }
    });
  }

  // 다국적언어 설정
	const {t, i18n} = useTranslation();
  // 랜딩페이지 이동
  const listHandler = () => {
    history.push("/");
  }
  // 알리페이 결제
  const alipayHandler = () => {
    let dateInfo = new Date();
    const sod = new Date(dateInfo.getTime() - (dateInfo.getTimezoneOffset() * 60000)).toISOString();
    let uniqueDate = dateInfo.getFullYear() + "-" + (dateInfo.getMonth() + 1) + "-" + dateInfo.getDate() + "-" + dateInfo.getHours() + "-" + dateInfo.getMinutes();
    const loginUserId = props.user.userData._id;
    const uniqueField = 'cart' + '_' + loginUserId + '_' + uniqueDate;
    const staffName = 'ECSystem';
    const sid = SID
    const siam1 = Total

    let url = '/payment/alipay/confirm/'
    url = url + loginUserId + '/' + sid + '/' + sod + '/' + siam1 + '/' + uniqueField + '/' + staffName;
    window.open(url);

    // 주문정보 화면으로 이동하기 때문에 카트창은 닫는다
    window.close();
  }

  // 위쳇 결제
  const wechatHandler = () => {
    let dateInfo = new Date();
    const sod = new Date(dateInfo.getTime() - (dateInfo.getTimezoneOffset() * 60000)).toISOString();
    let uniqueDate = dateInfo.getFullYear() + "-" + (dateInfo.getMonth() + 1) + "-" + dateInfo.getDate() + "-" + dateInfo.getHours() + "-" + dateInfo.getMinutes();
    const loginUserId = props.user.userData._id;
    const uniqueField = 'cart' + '_' + loginUserId + '_' + uniqueDate;
    const staffName = 'ECSystem';
    const sid = SID
    const siam1 = Total

    let url = '/payment/wechat/confirm/'
    url = url + loginUserId + '/' + sid + '/' + sod + '/' + siam1 + '/' + uniqueField + '/' + staffName;
    window.open(url);

    // 주문정보 화면으로 이동하기 때문에 카트창은 닫는다
    window.close();
  }

  // 경고메세지
	const errorHandleClose = () => {
    setErrorAlert(false);
    history.push("/");
  };

  return (
    <div style={{width: '85%', margin: '3rem auto'}}>
      {/* Alert */}
      <div>
        {ErrorAlert ? (
          <Alert message={t('Paypal.errorAlert')}  type="error" showIcon closable afterClose={errorHandleClose}/>
        ) : null}
      </div>      
      <br />

      <h1>{t('Cart.title')}</h1>
      <div>
        <UserCardBlock products={props.user.cartDetail} removeItem={removeFromCart}/>
      </div>      

      {ShowTotal ? 
        <div style={{marginTop: '3rem'}}>
          <h2>{t('Cart.amount')}: {Number(Total).toLocaleString()}</h2>
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
          onError={transactionError}
        />
      }
      {ShowTotal && 
        <div>
          <Button type="primary" size="large" onClick={wechatHandler}>
            <b><Icon type="wechat" />Wechat</b>で支払う
          </Button> &nbsp;&nbsp;
          <Button type="primary" size="large" onClick={alipayHandler}>
            <b><Icon type="alipay" /> Alipay</b>で支払う
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