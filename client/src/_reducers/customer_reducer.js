import { REGISTER_CUSTOMER } from '../_actions/types';

export default function(state={},action){
    switch(action.type){
        case REGISTER_CUSTOMER:
            return {...state, register: action.payload }
        default:
            return state;
    }
}