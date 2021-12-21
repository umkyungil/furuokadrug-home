const express = require('express');
const router = express.Router();
const { auth } = require("../middleware/auth");
const nodemailer = require("nodemailer");

//=================================
//             Sendmail
//=================================

router.post("/", auth, (req, res) => {    

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 587,
        host: 'smtp.gmail.com',
        secure: false,
        requireTLS: true,
        auth: {
          user: 'umkyungil@gmail.com',  // gmail 계정 아이디를 입력
          pass: 'cqozfmnjfeermpyj'      // gmail 계정의 비밀번호를 입력
        }
    }
    );

    let mailOptions = {
        from: 'umkyungil@gmail.com',    // 발송 메일 주소 (위에서 작성한 gmail 계정 아이디)
        to: req.body.to ,               // 수신 메일 주소
        subject: req.body.subject,      // 제목
        text: req.body.message
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
            return res.json({ success: false}, error);
        }
        else {
            console.log('Email sent: ' + info.response);
            return res.json({ success: true});
        }
    });
});

module.exports = router;
