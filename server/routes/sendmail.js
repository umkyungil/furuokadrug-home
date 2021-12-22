const express = require('express');
const router = express.Router();
const { auth } = require("../middleware/auth");
const nodemailer = require("nodemailer");
const nodeConfig = require("../config/mail-info");

//=================================
//          Sendmail
//=================================

// Customer : 관리자가 고객에세 보내는 메일
router.post("/notice", auth, (req, res) => {
    let transporter = nodemailer.createTransport({
        service: nodeConfig.service,
        port: nodeConfig.port,
        host: nodeConfig.host,
        secure: nodeConfig.secure,
        requireTLS: nodeConfig.requireTLS,
        auth: {
          user: nodeConfig.user,        // gmail 계정 아이디를 입력
          pass: nodeConfig.pass         // gmail 계정의 비밀번호를 입력
        }
    });

    let mailOptions = {
        from: 'info@furuokadrug.com',   // 발송 메일 주소 (위에서 작성한 gmail 계정 아이디)
        to: req.body.to ,               // 수신 메일 주소
        subject: req.body.subject,      // 제목
        text: req.body.message
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log('err: ', error);
            return res.json({ success: false}, error);
        }
        else {
            console.log('Email sent: ' + info.response);
            return res.json({ success: true});
        }
    });
});

// Contact Us : 고객으로 부터 문의메일 수신
router.post("/inquiry", auth, (req, res) => {
    let transporter = nodemailer.createTransport({
        service: nodeConfig.service,
        port: nodeConfig.port,
        host: nodeConfig.host,
        secure: nodeConfig.secure,
        requireTLS: nodeConfig.requireTLS,
        auth: {
          user: nodeConfig.user,    // gmail 계정 아이디를 입력
          pass: nodeConfig.pass     // gmail 계정의 비밀번호를 입력
        }
    });

    let mailOptions = {
        from: req.body.email,               // 발송 메일 주소 (위에서 작성한 gmail 계정 아이디)
        to: 'umkyungil@hirosophy.co.jp',    //'info@furuokadrug.com',                // 수신 메일 주소
        subject: 'Contact Us',              // 제목
        text: req.body.message
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
            return res.json({ success: false}, error);
        } else {
            console.log('Email sent: ' + info.response);
            return res.json({ success: true});
        }
    });
});

// Virtual Reservation (고객으로 부터 예약메일 수신)
router.post("/reservation", auth, (req, res) => {
    let transporter = nodemailer.createTransport({
        service: nodeConfig.service,
        port: nodeConfig.port,
        host: nodeConfig.host,
        secure: nodeConfig.secure,
        requireTLS: nodeConfig.requireTLS,
        auth: {
          user: nodeConfig.user,    // gmail 계정 아이디를 입력
          pass: nodeConfig.pass     // gmail 계정의 비밀번호를 입력
        }
    }
    );

    let mailOptions = {
        from: 'umkyungil@hirosophy.co.jp',//req.body.email,       // 발송 메일 주소 (위에서 작성한 gmail 계정 아이디)
        to: 'umkyungil@hirosophy.co.jp',//'info@furuokadrug.com', // 수신 메일 주소
        subject: 'Virtual Reservation',  // 제목
        text: `
                Name : ${req.body.name} \n
                Telephone number : ${req.body.telephoneNumber} \n
                Wechat ID : ${req.body.wechatID} \n
                Reservation Date : ${req.body.reservationDate} \n                
                Interested Item : ${req.body.interestedItem}
            `
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
            return res.json({ success: false}, error);
        }
        else {
            return res.json({ success: true});
        }
    });
});

module.exports = router;
