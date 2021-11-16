import axios from 'axios';
import { REGISTER_CUSTOMER } from './types';
import { CUSTOMER_SERVER } from '../components/Config.js';

export function registerCustomer(dataToSubmit){
    const request = axios.post(`${CUSTOMER_SERVER}/register`,dataToSubmit)
        .then(response => response.data);
    
    return {
        type: REGISTER_CUSTOMER,
        payload: request
    }
}