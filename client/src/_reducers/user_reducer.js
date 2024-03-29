import {
    REGISTER_USER, 
    ANY_REGISTER_USER, 
    PREREGISTER_USER, 
    PREREGISTER_CONFIRM_USER, 
    UPDATE_USER, 
    DELETE_USER, 
    AUTH_USER, 
    LOGIN_USER, 
    ADD_TO_CART, 
    GET_CART_ITEMS, 
    REMOVE_CART_ITEM, 
    ON_SUCCESS_BUY, 
    ON_SUCCESS_BUY_TMP, 
    PASSWORD_CONFIRM
} from '../_actions/types';

export default function(state={},action){
    switch(action.type){
        case REGISTER_USER:
            return {...state, register: action.payload }
        case ANY_REGISTER_USER:
            return {...state, register: action.payload }
        case PREREGISTER_USER:
            return {...state, register: action.payload }
        case PREREGISTER_CONFIRM_USER:
            return {...state, register: action.payload }
        case DELETE_USER:
            return {...state, delete: action.payload }
        case UPDATE_USER:
            return {...state, update: action.payload }
        case PASSWORD_CONFIRM:
            return {...state, update: action.payload }
        case LOGIN_USER:
            return { ...state, loginSuccess: action.payload }
        case AUTH_USER:
            return {...state, userData: action.payload }
        case ADD_TO_CART:
            return {
                ...state, 
                userData: {
                    ...state.userData,
                    cart: action.payload
                }
            }
        case GET_CART_ITEMS:
            return {...state, cartDetail: action.payload }
        case REMOVE_CART_ITEM:
            return {...state, 
                cartDetail: action.payload.productInfo,
                userData: {
                    ...state.userData,
                    cart: action.payload.cart
                }
            }
        case ON_SUCCESS_BUY:
            return {...state, 
                cartDetail: action.payload.cartDetail,
                userData: {
                    ...state.userData, 
                    cart: action.payload.cart
                }
            }
        case ON_SUCCESS_BUY_TMP:
            return {...state, 
                cartDetail: action.payload.cartDetail,
                userData: {
                    ...state.userData, 
                    cart: action.payload.cart
                }
            }
        default:
            return state;
    }
}