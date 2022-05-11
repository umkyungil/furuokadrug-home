import React, {useEffect, useState} from 'react';
import { useDispatch } from 'react-redux';
import { getCartItems, removeCartItem, onSuccessBuy } from '../../../_actions/user_actions';
import UserCardBlock from './Sections/UserCardBlock';
import { Empty, Button, Result } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import Paypal from '../../utils/Paypal'
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import { SID } from '../../Const';

function CartPage(props) {
  const dispatch = useDispatch();
  const [Total, setTotal] = useState(0);
  const [ShowTotal, setShowTotal] = useState(false);
  const [ShowSuccess, setShowSuccess] = useState(false);
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
    dispatch(onSuccessBuy({
      paymentData: data, // Paypal에서 전해주는 데이타
      cartDetail: props.user.cartDetail
    }))
    .then(response => {
      if(response.payload.success) {
        setShowTotal(false);
        setShowSuccess(true);
      }
    })
  }

  // 다국적언어 설정
	const {t, i18n} = useTranslation();

  const listHandler = () => {
    history.push("/");
  }

  // UPC SOD작성
  const makeSOD = () => {
    let dateInfo = new Date();
    const sod = new Date(dateInfo.getTime() - (dateInfo.getTimezoneOffset() * 60000)).toISOString();
    return sod;
  }

  // 알리페이 결제
  const alipayHandler = () => {
    const loginUserId = props.user.userData._id;
    // sod 작성    
    const sod = makeSOD(); 
    // uniqueField 작성
    const uniqueTime = sod.replace('T',' ').substring(0, 19);
    const classNum = "000000000000"
    const userName = props.user.userData.name;
    const tmp = 'Alipay' + '_' + uniqueTime + '_' + classNum + '_' + userName;
    const uniqueField = encodeURIComponent(tmp);
    
    const staffName = encodeURIComponent('Furuokadrug');
    const sid = SID
    const siam1 = Total

    let url = '/payment/alipay/confirm/'
    url = url + loginUserId + '/' + sid + '/' + sod + '/' + siam1 + '/' + uniqueField + '/' + staffName;
    window.open(url);
  }

  // 위쳇 결제
  const wechatHandler = () => {
    const loginUserId = props.user.userData._id;
    // sod 작성    
    const sod = makeSOD(); 
    // uniqueField 작성
    const uniqueTime = sod.replace('T',' ').substring(0, 19);
    const classNum = "000000000000"
    const userName = props.user.userData.name;
    const tmp = 'Alipay' + '_' + uniqueTime + '_' + classNum + '_' + userName;
    const uniqueField = encodeURIComponent(tmp);
    
    const staffName = encodeURIComponent('Furuokadrug');
    const sid = SID
    const siam1 = Total

    let url = '/payment/wechat/confirm/'
    url = url + loginUserId + '/' + sid + '/' + sod + '/' + siam1 + '/' + uniqueField + '/' + staffName;
    window.open(url);
  }

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
        : ShowSuccess ? 
            <Result
              status="success"
              title={t('Paypal.success')}        
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
      <div style = {{size: 'large',color: 'blue',shape: 'rect',label: 'checkout'}} >
        <Button size="large" onClick={wechatHandler}>
          Wechat
        </Button> 
        <Button type="primary" icon={<DownloadOutlined />} size="large" onClick={alipayHandler}>
          Alipay
        </Button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }} >
        <Button size="large" onClick={listHandler}>
          Product List
        </Button>
      </div>
      

    </div>
  )
}

export default CartPage