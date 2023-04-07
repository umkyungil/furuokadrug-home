// import React from 'react';

// function Footer() {
//     return (
//         <div className="footer" style={{
//             height: '80px', display: 'flex',
//             flexDirection: 'column', alignItems: 'center',
//             justifyContent: 'center', fontSize:'1rem',
//         }}>
//             <p> Copyright © HIROSOPHY All Right Reserved.</p>
//         </div>
//     )
// }

// export default Footer;
import React from 'react';
// import './Footer.css';

function Footer() {
    return (
        <div className="footer" style={{
            color: '#fff',
            display: 'block',
            width: '100%',
            height: 'auto',
            margin: '0 auto',
            display: 'inline-block',
            padding: '10px',
            flexDirection: 'column',
            textAlign: 'center',
            // justifyContent: 'center',
            fontSize: '1rem',
            backgroundColor: '#1a1e65',
        }}>
            <ul className="footermenu" style={{
                color: '#fff',
                width: '100%',
                margin: '0 auto',
                color: '#fff',
                display: 'inline',
                listStyle: 'none',
                // fontcolor: '#fff',
                fontweight: 'bold',
            }}>

                <hr width="70%" color="#666" border-width="1px"></hr>
                <li><a href="#">PHARMACEUTICALS</a></li>
                <li><a href="#">COSMETICS</a></li>
                <li><a href="#">DAILY NECESSARIES</a></li>
                <li><a href="#">FOOD</a></li>
                <li><a href="#">SALE</a></li>
                <hr width="70%" color="#fff"></hr>
                <li><a href="#">ABOUTSTORE</a></li>
                <li><a href="#">Q&A</a></li>
                <li><a href="#">PRIVACY POLICY</a></li>
                <li><a href="#">TERMS</a></li>
                <li><a href="#">COMPANY</a></li>
                <hr width="70%" align="center" color="#666"></hr>
            </ul>
            <p> Copyright © HIROSOPHY All Right Reserved.</p>

        </div>
    )
}

export default Footer;
