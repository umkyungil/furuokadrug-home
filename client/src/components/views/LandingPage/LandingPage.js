import React from 'react'
import { FaCode } from "react-icons/fa";

function LandingPage() {
    return (
        <>
            <div className="app">
                <FaCode style={{ fontSize: '4rem' }} /><br />
                <span style={{ fontSize: '2rem' }}>Hirosophy Website</span>
            </div>
            <div style={{ float: 'right' }}>Thank you for visiting the Hirosophy website.</div>
        </>
    )
}

export default LandingPage
