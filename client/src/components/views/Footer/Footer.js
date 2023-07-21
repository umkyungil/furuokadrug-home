import React from 'react';
import { MAIN_CATEGORY } from '../../utils/Const';
import { useHistory } from 'react-router-dom';
import './Footer.css';

const footerMain = {
    color: '#fff',
    width: '100%',
    height: 'auto',
    padding: '10px',
    flexDirection: 'column',
    textAlign: 'center',
    backgroundColor: '#1a1e65',
    // Adding media query..
    // '@media (max-width: 768px)': {
    //     color: 'red',
    // },
}

const footerMenu = {
    margin: '0 auto',
    display: 'inline',
    listStyle: 'none',
    textDecoration: 'none',
}

function Footer() {
    const _history = useHistory();

    // 상품리스트로 이동(카테고리 검색)
    const handleSearchCategory = (category) => {
        _history.push(`/product/list/category/${category}`);
    }

    return (
        <div style={footerMain}>
            <ul style={footerMenu}>
                <hr width="70%" color="#666" border-width="1px"></hr>
                
                <li onClick={() => {handleSearchCategory(MAIN_CATEGORY[2].key)}} >PHARMACEUTICALS</li>
                <li onClick={() => {handleSearchCategory(MAIN_CATEGORY[1].key)}} >COSMETICS</li>
                <li onClick={() => {handleSearchCategory(MAIN_CATEGORY[4].key)}} >DAILY NECESSARIES</li>
                <li onClick={() => {handleSearchCategory(MAIN_CATEGORY[3].key)}} >FOOD</li>
                <li onClick={() => {handleSearchCategory(MAIN_CATEGORY[5].key)}} >BABY</li>
                <li onClick={() => {handleSearchCategory(MAIN_CATEGORY[6].key)}} >PET</li>

                <hr width="70%" color="#fff"></hr>

                <li>ABOUTSTORE</li>
                <li>Q&A</li>
                <li>PRIVACY POLICY</li>
                <li>TERMS</li>
                <li>COMPANY</li>
                
                <hr width="70%" align="center" color="#666"></hr>
            </ul>
            <p> Copyright © HIROSOPHY All Right Reserved.</p>
        </div>
    )
}

export default Footer;