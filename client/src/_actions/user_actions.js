import axios from 'axios';
import { LOGIN_USER, REGISTER_USER, AUTH_USER, LOGOUT_USER, ADD_TO_CART, GET_CART_ITEMS } from './types';
import { USER_SERVER, PRODUCT_SERVER } from '../components/Config.js';

// CORS 대책
axios.defaults.withCredentials = true;

export function registerUser(dataToSubmit){
    const request = axios.post(`${USER_SERVER}/register`,dataToSubmit)
        .then(response => response.data);
    // 리턴을 하면 리듀서로 넘어간다
    return {
        type: REGISTER_USER,
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
        .then(response => response.data);
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
        .then(response => response.data);
    return {
        type: ADD_TO_CART,
        payload: request
    }
}

// 상세페이지의 카트
export function getCartItems(cartItems, userCart) {
    // 상품을 한개이상 가지고 와야 하기때문에 type=array
    const request = axios.get(`${PRODUCT_SERVER}/products_by_id=${cartItems}&type=array`)
        .then(response => {
            // CartItem들에 해당하는 정보들을 Product Collection에서 가져온후에
            // Quantity 정보를 넣어준다
        });
    return {
        type: GET_CART_ITEMS,
        payload: request
    }
}