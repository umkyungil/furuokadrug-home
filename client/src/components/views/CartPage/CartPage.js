import React, {useEffect} from 'react';
import { useDispatch } from 'react-redux';
import { getCartItems } from '../../../_actions/user_actions';

function CartPage(props) {
  const dispatch = useDispatch();

  useEffect(() => {
    let cartItems=[]

    // props는 리덕스에 있는 값이다.
    // 리덕스 USer state안에 cart 안에 상품이 들어있는지 확인
    if (props.user.userData && props.user.userData.cart) {
      if (props.user.userData.cart.length > 0) {
        // 상품의 ID를 가지고온다
        props.user.userData.cart.forEach(item => {
          cartItems.push(item.id)
        });

        // 상품의 ID로 상품정보를 가지고 온다
        // 2번째 파라메터는 상품의 갯수가 들어있다
        dispatch(getCartItems(cartItems, props.user.userData.cart))
      } 
    }
    // 


  }, [])

  return (
    <div>
      CartPage
    </div>
  )
}

export default CartPage