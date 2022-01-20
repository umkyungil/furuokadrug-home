//import { PROD_URL_5000 } from './components/Config.js';

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/api',
        createProxyMiddleware({
            target: 'http://localhost:5000',
            // target: `https://furuokadrug.herokuapp.com/`,
            changeOrigin: true,
        })
    );
};