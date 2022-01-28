import axios from 'axios';
import { REGISTER_CUSTOMER, DELETE_CUSTOMER, UPDATE_CUSTOMER } from './types';
import { CUSTOMER_SERVER } from '../components/Config.js';
// CORS 대책
axios.defaults.withCredentials = true;

export function registerCustomer(dataToSubmit){
    const request = axios.post(`${CUSTOMER_SERVER}/register`,dataToSubmit)
        .then(response => response.data);
    
    return {
        type: REGISTER_CUSTOMER,
        payload: request
    }
}

export function deleteCustomer(id){
    let body = {customerId : id}

    const request = axios.post(`${CUSTOMER_SERVER}/delete`, body)
        .then(response => response.data);

    return {
        type: DELETE_CUSTOMER,
        payload: request
    }
}

export function updateCustomer(dataToSubmit){
    const request = axios.post(`${CUSTOMER_SERVER}/update`, dataToSubmit)
        .then(response => response.data);
    
    return {
        type: UPDATE_CUSTOMER,
        payload: request
    }
}