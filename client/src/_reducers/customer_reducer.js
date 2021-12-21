import { REGISTER_CUSTOMER, DELETE_CUSTOMER, UPDATE_CUSTOMER } from '../_actions/types';

export default function(state={}, action){
    switch(action.type){
        case REGISTER_CUSTOMER:
            return {...state, register: action.payload }
        case DELETE_CUSTOMER:
            return {...state, delete: action.payload }
        case UPDATE_CUSTOMER:
            return {...state, update: action.payload }
        default:
            return state;
    }
}