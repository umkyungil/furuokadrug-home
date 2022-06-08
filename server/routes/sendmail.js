const express = require('express');
const router = express.Router();
const { auth } = require("../middleware/auth");
const nodemailer = require("nodemailer");
const nodeConfig = require("../config/mailConfig");
const { Mail } = require("../models/Mail");
const moment = require("moment");
const { ADMIN_EMAIL } = require('../config/config');

//=================================
//          Sendmail
//=================================

const transporter = nodemailer.createTransport({
    service: nodeConfig.service,
    port: nodeConfig.port,
    host: nodeConfig.host,
    secure: nodeConfig.secure,
    requireTLS: nodeConfig.requireTLS,
    auth: {
      user: nodeConfig.user, // gmail 계정 아이디를 입력
      pass: nodeConfig.pass  // gmail 계정의 비밀번호를 입력
    }
});

// 메일정보 등록
const registerMailHistory = async (body) => {
    try {
        const mail = new Mail(body);
        await mail.save((err, doc) => {
            if (err) {
                console.log("direct email error: ", err);
                return false;
            }
            console.log("direct email success");
            return true;
        });    
    } catch (err) {
        console.log(err);
        return false;
    }
}

// UserList, CustomerList: 관리자가 고객에게 DM으로 메일전송
router.post("/notice", auth, (req, res) => {
    let mailOptions = {
        from: req.body.from, // 발송 메일 주소 (설정을 해도 위에서 작성한 gmail 계정 아이디로 보내진다) 
        to: req.body.to ,
        subject: req.body.subject,
        text: req.body.message
    };

    transporter.sendMail(mailOptions, function(err, info){
        try {
            if (err) {
                console.log("direct email error: ", err);
                return res.json({ success: false}, err);
            } else {
                // 메일 전송 성공시 메일정보 등록
                const body = {
                    type: req.body.type,
                    subject: req.body.subject,
                    to: req.body.to,
                    from: req.body.from,
                    message: req.body.message,
                }
                // 메일정보 등록
                const result = registerMailHistory(body);
                if(!result) return res.json({ success: false }, err);
                return res.status(200).json({ success: true })
            }
        } catch(err) {
            console.log(err);
            return res.status(500).json({ success: false, message: err.message });
        }
    });
});

// LiveStreaming: 라이브스트리밍에서 사용자가 룸인 했을때 관리자에게 보내는 메일
router.post("/live", auth, (req, res) => {
    // 관리자에 보낼 메일내용 설정
    let message = "管理者 様\n"
    message += "\n下記の顧客からライブストリーミングの依頼がございました。\nご対応をお願いいたします。\n";
    message += "------------------------------------------------------------\n";
    message += "\n【顧客名         】    " + req.body.fullName
    message += "\n【ルームNo      】    "  + req.body.room 
    message += "\n【ルームイン時刻 】    "  + req.body.roomInTime

    let mailOptions = {
        from: req.body.from, // 발송 메일 주소 (설정을 해도 위에서 작성한 gmail 계정 아이디로 보내진다) 
        to: ADMIN_EMAIL,
        subject: "ライブストリーミング顧客対応の依頼",
        text: message
    };

    transporter.sendMail(mailOptions, function(err, info){
        try {
            if (err) {
                console.log("live email error: ", err);
                return res.json({ success: false}, err);
            } else {
                // 메일 전송 성공시 메일정보 등록
                const body = {
                    type: "Live",
                    subject: "ライブストリーミング顧客対応の依頼",
                    to: ADMIN_EMAIL,
                    from: req.body.from,
                    message: message,
                }
                // 메일정보 등록
                const result = registerMailHistory(body);
                if(!result) return res.json({ success: false }, err);
                return res.status(200).json({ success: true })
            }
        } catch(err) {
            console.log(err);
            return res.status(500).json({ success: false, message: err.message });
        }
    });
});

// Contact Us: 고객으로 부터 문의메일 수신
router.post("/inquiry", (req, res) => {
    let mailOptions = {
        from: req.body.email, // 발송 메일 주소 (설정을 해도 위에서 작성한 gmail 계정 아이디로 보내진다) 
        to: ADMIN_EMAIL, // PROD, DEV에 따라 주소가 변경된(config.js)
        subject: 'お問い合わせ',
        text: req.body.message // 문의 내용
    };

    transporter.sendMail(mailOptions, function(err, info){
        try {
            if (err) {
                console.log("inquiry email error: ", err);
                return res.json({ success: false}, err);
            } else {
                // 메일정보 설정
                const body = {
                    type: 'Inquiry',
                    subject: 'お問い合わせ',
                    to: ADMIN_EMAIL, // PROD, DEV에 따라 주소가 변경된다(config.js)
                    from: req.body.email,
                    message: req.body.message,
                }
                // 메일정보 등록
                const result = registerMailHistory(body);
                if(!result) return res.json({ success: false }, err);
                return res.status(200).json({ success: true })
            }
        } catch (err) {
            console.log(err);
            return res.status(500).json({ success: false, message: err.message });
        }
    });
});

// Virtual Reservation (고객이 예약메일을 관리자에게 송신)
router.post("/reserve", (req, res) => {
    // 관리자에 보낼 메일내용 설정
    let message = "管理者 様\n"
    message += "\n下記の顧客から仮想予約の依頼がございました。\nご対応をお願いいたします。\n";
    message += "------------------------------------------------------------\n";
    message += "\n【顧客名　　　　　　】    " + req.body.name
    message += "\n【電話番号　　　　　】    " + req.body.telephoneNumber 
    message += "\n【WeChat ID　　　　】    " + req.body.weChatID
    message += "\n【予約日　　　　　　】    " + req.body.reservationDate
    message += "\n【興味があるアイテム】    " + req.body.interestedItem
    // 메일 설정
    let mailOptions = {
        from: req.body.email, // 발송 메일 주소 (설정을 해도 위에서 작성한 gmail 계정 아이디로 보내진다) 
        to: ADMIN_EMAIL, // PROD, DEV에 따라 주소가 변경된(config.js)
        subject: '仮想予約のお問い合わせ', // 제목
        text: message
    };
    // 메일 전송
    transporter.sendMail(mailOptions, function(err, info){
        try {
            if (err) {
                console.log("reservation email error: ", err);
                return res.json({ success: false}, err);
            } else {
                // 메일정보 설정
                const body = {
                    type: 'Reserve',
                    subject: '仮想予約のお問い合わせ',
                    to: ADMIN_EMAIL, // PROD, DEV에 따라 주소가 변경된다(config.js)
                    from: req.body.email,
                    message: message,
                }
                // 메일정보 등록
                const result = registerMailHistory(body);
                if(!result) return res.json({ success: false }, err);
                return res.status(200).json({ success: true })
            }
        } catch(err) {
            console.log(err);
            return res.status(500).json({ success: false, message: err.message });
        }
    });
});

// User Registration (회원가입시 가입감사 메일송신)
router.post("/register", (req, res) => {
    // 메일 설정
    let mailOptions = {
        from: ADMIN_EMAIL, // PROD, DEV에 따라 주소가 변경된(config.js), (설정을 해도 위에서 작성한 gmail 계정 아이디로 보내진다) 
        to: req.body.email, // 발송 메일 주소
        subject: '会員登録完了のお知らせ',
        text: 
            `
            ${req.body.name}　様\n\n
            この度は「FURUOKADRUG」へのご登録、誠にありがとうございます。\n
            本日より、FURUOKADRUGシステムのサービスがご利用いただけます。\n\n            
            引き続きFURUOKADRUGをよろしくお願いいたします。\n
            ご不明な点、お問い合わせは下記ユーザーサポートページをご確認くださいませ。\n\n
            URL: https://furuokadrug.herokuapp.com/
            `
    };
    // 메일 전송
    transporter.sendMail(mailOptions, function(err, info){
        try {
            if (err) {
                console.log("register email error: ", err);
                return res.json({ success: false}, err);
            } else {
                // 메일정보 설정
                const body = {
                    type: 'Register',
                    subject: '会員登録完了のお知らせ',
                    to: req.body.email, 
                    from: ADMIN_EMAIL, // PROD, DEV에 따라 주소가 변경된다 (설정을 해도 위에서 작성한 gmail 계정 아이디로 보내진다) 
                    message: mailOptions.text,
                }
                // 메일정보 등록    
                const result = registerMailHistory(body);
                if(!result) return res.json({ success: false }, err);
                return res.status(200).json({ success: true })
            }
        } catch(err) {
            console.log(err);
            return res.status(500).json({ success: false, message: err.message });
        }
    });
});

// 메일이력 조회
router.post("/list", (req, res) => {
    try {
        let term = req.body.searchTerm;

        // 검색조건 type과 날짜 값이 들어오지 않은 경우는 term이 없는 경우이기에 별도 조건을 둘 필요가 없다.
        if (term) {
            if (term[0] !== "") {
                // type, 날짜값이 들어왔을때
                if (term[1]) {
                    const fromDate = new Date(term[1]).toISOString();
                    const toDate = new Date(term[2]).toISOString();

                    Mail.find
                    ({ 
                        "type":{ '$regex':term[0], $options: 'i' }, 
                        "createdAt":{ $gte: fromDate, $lte: toDate }
                    })
                    .sort({ "createdAt": -1 })
                    .skip(req.body.skip)
                    .exec((err, mailInfo) => {
                        if (err) return res.status(400).json({success: false, err});
                        return res.status(200).json({ success: true, mailInfo})
                    });
                // type만 값이 들어왔을때
                } else {
                    Mail.find({ "type": {'$regex': term[0], $options: 'i' }})
                    .sort({ "createdAt": -1 })
                    .skip(req.body.skip)
                    .exec((err, mailInfo) => {
                        if (err) return res.status(400).json({success: false, err});
                        return res.status(200).json({ success: true, mailInfo})
                    });
                }
            } else {
                // 날짜값만 들어왔을때
                if (term[1]) {
                    const fromDate = new Date(term[1]).toISOString();
                    const toDate = new Date(term[2]).toISOString();

                    Mail.find({ "createdAt":{$gte: fromDate, $lte: toDate }})
                    .sort({ "createdAt": -1 })
                    .skip(req.body.skip)
                    .exec((err, mailInfo) => {
                        if (err) return res.status(400).json({success: false, err});
                        return res.status(200).json({ success: true, mailInfo})
                    });
                // 아무런값도 안들어왔을때
                } else {
                    Mail.find()
                    .sort({ "createdAt": -1 })
                    .exec((err, mailInfo) => {
                        if (err) return res.status(400).json({success: false, err});
                        return res.status(200).json({ success: true, mailInfo})
                    });
                }
            }
        // 조건이 undefined일 경우(초기페이지)
        } else {
            Mail.find()
            .sort({ "createdAt": -1 })
            .exec((err, mailInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, mailInfo})
            });
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// 메일정보 상세조회
router.get('/mails_by_id', (req, res) => {
    let mailId = req.query.id;
    Mail.find({ _id: mailId })
        .exec((err, mailInfo) => {
            if (err) return res.status(400).send(err)
            return res.status(200).send({success: true, mailInfo});
        })
})

module.exports = router;