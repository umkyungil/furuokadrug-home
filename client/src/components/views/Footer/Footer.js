import React from 'react'
import {Icon} from 'antd';

function Footer() {
    return (
        <div style={{
            height: '80px', display: 'flex',
            flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', fontSize:'1rem'
        }}>
           {/* <p> Copyright © HIROSOPHY All Right Reserved. <Icon type="smile" /></p> */}
            <p> Copyright © HIROSOPHY All Right Reserved.</p>
        </div>
    )
}

export default Footer
