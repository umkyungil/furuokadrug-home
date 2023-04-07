import { combineReducers } from 'redux';
import user from './user_reducer';
import customer from './customer_reducer';

// reducer는 어떻게 상태가 변하는지 보여주고 변한 마지막 값을 돌려주는 일을 한다
// 여러 상태 즉 여러개의 reducer가 있을수 있는데 combineReducers로 하나로 합쳐준다
const rootReducer = combineReducers({
    user,
    customer,
});

export default rootReducer;