import 'react-app-polyfill/ie9';
import 'react-app-polyfill/ie11';
import 'core-js';

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import { BrowserRouter } from "react-router-dom";

import Reducer from './_reducers'; // ./_reducers.index.js를 자동으로 알아서 지정해 준다 
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import promiseMiddleware from 'redux-promise'; // redux는 원래 객체만 받을수 있는데 promise도 받게 해주는 미들웨어
import ReduxThunk from 'redux-thunk'; // redux에서 function도 받게 해주는 미들웨어
import './i18next'; // multi language
import { CookiesProvider } from "react-cookie";

// 원래는 createStore로 store를 생성하는데 store가 객체만이 아닌 function과 promise를 받을수 있게 아래와 같이 설정
const createStoreWithMiddleware = applyMiddleware(promiseMiddleware, ReduxThunk)(createStore);

ReactDOM.render(
    // redux에서 제공하는 provider로 감싸주면 redux와 어플리케이션이 연결된다.
    // Reducer: 통합된 reducer
    // window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()는 브라우저의 확장툴과 연결하기 위한 옵션
    <Provider
        store={createStoreWithMiddleware(
            Reducer,
            window.__REDUX_DEVTOOLS_EXTENSION__ &&
            window.__REDUX_DEVTOOLS_EXTENSION__()
        )}
    >
        <CookiesProvider>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </CookiesProvider>
    </Provider>
    , document.getElementById('root'));
    
serviceWorker.unregister();