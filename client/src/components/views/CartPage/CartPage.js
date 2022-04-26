import React, {useEffect, useState} from 'react';
import { useDispatch } from 'react-redux';
import { getCartItems, removeCartItem, onSuccessBuy } from '../../../_actions/user_actions';
import UserCardBlock from './Sections/UserCardBlock';
import { Empty } from 'antd';
import Paypal from '../../utils/Paypal'
import { useTranslation } from 'react-i18next';

function CartPage(props) {
  const dispatch = useDispatch();
  const [Total, setTotal] = useState(0);
  const [ShowTotal, setShowTotal] = useState(false);

  useEffect(() => {
    let cartItems=[]
    
    // 리덕스 USer state안에 cart 안에 상품이 들어있는지 확인
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

  const transactionSuccess = (data) => {
    dispatch(onSuccessBuy({
      paymentData: data,
      cartDetail: props.user.cartDetail
    }))
    .then(response => {
      if(response.payload.success) {
        setShowTotal(false)
      }
    })
  }

   // 다국적언어 설정
	const {t, i18n} = useTranslation();

  return (
    <div style={{width: '85%', margin: '3rem auto'}}>
      <h1>{t('Cart.title')}</h1>
      <div>
        <UserCardBlock products={props.user.cartDetail} removeItem={removeFromCart}/>
      </div>
      {ShowTotal ? 
        <div style={{marginTop: '3rem'}}>
          <h2>{t('Cart.amount')}: ¥{Number(Total).toLocaleString()}</h2>
        </div>
        :
        <>
          <br />
          <Empty description={false} />
        </>
      }

      {ShowTotal && 
        <Paypal 
          total={Total}
          onSuccess={transactionSuccess}
        />
      }      
    </div>
  )
}

export default CartPage