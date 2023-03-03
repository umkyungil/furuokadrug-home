import React from 'react';

function Footer() {
    return (
        <div className="footer" style={{
            height: '80px', display: 'flex',
            flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', fontSize:'1rem',
        }}>
            <p> Copyright © HIROSOPHY All Right Reserved.</p>
        </div>
    )
}

export default Footer;
