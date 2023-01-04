import axios from 'axios';
import { 
    LOGIN_USER, 
    REGISTER_USER, 
    ANY_REGISTER_USER,
    PREREGISTER_USER, 
    PREREGISTER_CONFIRM_USER, 
    UPDATE_USER, 
    DELETE_USER, 
    AUTH_USER, 
    LOGOUT_USER, 
    ADD_TO_CART, 
    ANY_ADD_TO_CART,
    GET_CART_ITEMS, 
    REMOVE_CART_ITEM, 
    ON_SUCCESS_BUY,
    ON_SUCCESS_BUY_TMP,
    PASSWORD_CONFIRM
 } from './types';
import { USER_SERVER, PRODUCT_SERVER } from '../components/Config.js';

// CORS 대책
axios.defaults.withCredentials = true;

// 사용자 등록
export function registerUser(dataToSubmit){
    const request = axios.post(`${USER_SERVER}/register`,dataToSubmit)
        .then(response => response.data);
    // 리턴을 하면 리듀서로 넘어간다
    return {
        type: REGISTER_USER,
        payload: request
    }
}

// 불특정 사용자 등록
export function anyRegisterUser(dataToSubmit){
    const request = axios.post(`${USER_SERVER}/anyRegister`,dataToSubmit)
        .then(response => response.data);
    // 리턴을 하면 리듀서로 넘어간다
    return {
        type: ANY_REGISTER_USER,
        payload: request
    }
}

// 임시사용자 등록 
export function preregisterUser(dataToSubmit){
    const request = axios.post(`${USER_SERVER}/preregister`,dataToSubmit)
        .then(response => response.data);
    
    return {
        type: PREREGISTER_USER,
        payload: request
    }
}

// 임시사용자 확인등록
export function preregisterConfirmUser(dataToSubmit){
    const request = axios.post(`${USER_SERVER}/preregisterConfirm`,dataToSubmit)
        .then(response => response.data);
    
    return {
        type: PREREGISTER_CONFIRM_USER,
        payload: request
    }
}

// 비밀번호 변경
export function passwordConfirm(dataToSubmit){
    const request = axios.post(`${USER_SERVER}/passwordConfirm`,dataToSubmit)
        .then(response => response.data);
    
    return {
        type: PASSWORD_CONFIRM,
        payload: request
    }
}

// 사용자 삭제
export function deleteUser(id){
    const body = {userId : id}

    const request = axios.post(`${USER_SERVER}/delete`, body)
        .then( response => {
            console.log("response.data: ",response.data);
            return response.data
        });
    return {
        type: DELETE_USER,
        payload: request
    }
}

// 사용자 수정
export function updateUser(dataToSubmit){
    const request = axios.post(`${USER_SERVER}/update`, dataToSubmit)
        .then(response => response.data);    
    return {
        type: UPDATE_USER,
        payload: request
    }
}

export function loginUser(dataToSubmit){
    const request = axios.post(`${USER_SERVER}/login`,dataToSubmit)
        .then(response => response.data);
    return {
        type: LOGIN_USER,
        payload: request
    }
}

export function auth(){
    const request = axios.get(`${USER_SERVER}/auth`)
        .then(response => {
            return response.data
        });
    return {
        type: AUTH_USER,
        payload: request
    }
}

export function logoutUser(){
    const request = axios.get(`${USER_SERVER}/logout`)
        .then(response => response.data);
    return {
        type: LOGOUT_USER,
        payload: request
    }
}

// 상세페이지에서 카트에 상품담기
export function addToCart(id){
    let body = {productId : id}
    const request = axios.post(`${USER_SERVER}/addToCart`, body)
        .then(response => {
            return response.data
            
        });
    return {
        type: ADD_TO_CART,
        payload: request
    }
}

// 카트에 표시할 상품정보 취득
export function getCartItems(cartItems, userCart) {
    // 상품을 한개이상 가지고 와야 하기때문에 type=array
    const request = axios.get(`${PRODUCT_SERVER}/products_by_id?id=${cartItems}&type=array`)
        .then(response => {
            // CartItem들에 해당하는 상품정보들을 가져온후에
            // 사용자정보에 있는 상품아이디와 동일한 상품정보에  
            // 사용자 정보의 수량정보를 넣어준다
            userCart.forEach(cartItem => {
                response.data.forEach((productDetail, index) => {
                    if(cartItem.id === productDetail._id) {
                        response.data[index].quantity = cartItem.quantity
                    }
                })
            })
            return response.data;
        });
    return {
        type: GET_CART_ITEMS,
        payload: request
    }
}

// 카트 상품삭제
export function removeCartItem(productId) {
    const request = axios.get(`${USER_SERVER}/removeFromCart?id=${productId}`)
        .then(response => {
            // productInfo, cart정보를 조합해서 CartDetail을 만든다            
            response.data.cart.forEach(item => {
                response.data.productInfo.forEach((product, index) => {
                    if (item.id === product._id) {
                        response.data.productInfo[index].quantity = item.quantity;
                    }
                })
            })
            return response.data;
        });
    return {
        type: REMOVE_CART_ITEM,
        payload: request
    }
}

// Paypal결재정보 저장(객체를 파라메터로 받는다)
export function onSuccessBuy(data) {
    const request = axios.post(`${USER_SERVER}/successBuy`, data)
        .then(response => response.data);
    return {
        type: ON_SUCCESS_BUY,
        payload: request
    }
}

// Paypal결재정보 저장(객체를 파라메터로 받는다)
export function onSuccessBuyTmp(data) {
    const request = axios.post(`${USER_SERVER}/successBuyTmp`, data)
        .then(response => response.data);
    return {
        type: ON_SUCCESS_BUY_TMP,
        payload: request
    }
}