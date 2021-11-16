import { combineReducers } from 'redux';
import user from './user_reducer';
import customer from './customer_reducer';

const rootReducer = combineReducers({
    user,
    customer,
});

export default rootReducer;