import {
    REGISTER_USER,
    UPDATE_USER,
    DELETE_USER,
    AUTH_USER,
    LOGIN_USER,
    LOGOUT_USER,
    ADD_TO_CART,
    GET_CART_ITEMS
} from '../_actions/types';

export default function(state={},action){
    switch(action.type){
        case REGISTER_USER:
            return {...state, register: action.payload }
        case DELETE_USER:
            return {...state, delete: action.payload }
        case UPDATE_USER:
            return {...state, update: action.payload }
        case LOGIN_USER:
            return { ...state, loginSuccess: action.payload }
        case AUTH_USER:
            return {...state, userData: action.payload }
        case LOGOUT_USER:
            return {...state }
        case ADD_TO_CART:
            return {
                ...state, 
                userData: {
                    ...state.userData,
                    cart: action.payload
                }
            }
        case GET_CART_ITEMS:
            return {...state }
        default:
            return state;
    }
}