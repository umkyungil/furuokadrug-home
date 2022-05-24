const express = require('express');
const router = express.Router();
const { auth } = require("../middleware/auth");
const nodemailer = require("nodemailer");
const nodeConfig = require("../config/mailConfig");
const { Mail } = require("../models/Mail");
const moment = require("moment");

//=================================
//          Sendmail
//=================================

// Customer : 관리자가 고객에세 보내는 메일(사용자 리스트 화면)
router.post("/notice", auth, (req, res) => {
    let transporter = nodemailer.createTransport({
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

    let mailOptions = {
        from: req.body.from, // 발송 메일 주소 (설정을 해도 위에서 작성한 gmail 계정 아이디로 보내진다) 
        to: req.body.to , // 수신 메일 주소
        subject: req.body.subject, // 제목
        text: req.body.message
    };

    transporter.sendMail(mailOptions, function(err, info){
        try {
            if (err) {
                console.log("notice email error: ", err);
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

                const mail = new Mail(body);
                mail.save((err, doc) => {
                    if (err) {
                        console.log("notice email error: ", err);
                        return res.json({ success: false }, err);
                    }
                    console.log("notice email success");
                    return res.json({ success: true });
                });
            }
        } catch(err) {
            console.log("notice email error: ", err);
            return res.json({ success: false }, err);
        }
    });
});

// Contact Us : 고객으로 부터 문의메일 수신
router.post("/inquiry", (req, res) => {
    let transporter = nodemailer.createTransport({
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

    let mailOptions = {
        from: req.body.email, // 발송 메일 주소 (설정을 해도 위에서 작성한 gmail 계정 아이디로 보내진다) 
        to: 'umkyungil@hirosophy.co.jp', //'info@furuokadrug.com', 수신 메일 주소
        subject: req.body.subject, // 제목
        text: req.body.message
    };

    transporter.sendMail(mailOptions, function(err, info){
        try {
            if (err) {
                console.log("inquiry email error: ", err);
                return res.json({ success: false}, err);
            } else {
                // 메일 전송 성공시 메일정보 등록
                // 문의메일은 로그인하지 않아도 전송이 가능하므로 userId취득이 불가능하다
                const body = {
                    type: req.body.type,
                    subject: req.body.subject,
                    to: 'umkyungil@hirosophy.co.jp',
                    from: req.body.email,
                    message: req.body.message,
                }

                const mail = new Mail(body);
                mail.save((err, doc) => {
                    if (err) {
                        console.log("inquiry email error: ", err);
                        return res.json({ success: false }, err);
                    }
                    console.log("inquiry email success");
                    return res.json({ success: true });
                });
            }
        } catch (err) {
            console.log("inquiry email error: ", err);
            return res.json({ success: false }, err);
        }
    });
});

// Virtual Reservation (고객으로 부터 예약메일 수신)
router.post("/reservation", (req, res) => {
    let transporter = nodemailer.createTransport({
        service: nodeConfig.service,
        port: nodeConfig.port,
        host: nodeConfig.host,
        secure: nodeConfig.secure,
        requireTLS: nodeConfig.requireTLS,
        auth: {
          user: nodeConfig.user, // gmail 계정 아이디를 입력
          pass: nodeConfig.pass  // gmail 계정의 비밀번호를 입력
        }
    }
    );
    // 메일 설정
    let mailOptions = {
        from: req.body.email, // 발송 메일 주소 (설정을 해도 위에서 작성한 gmail 계정 아이디로 보내진다) 
        to: 'umkyungil@hirosophy.co.jp', //'info@furuokadrug.com', 수신 메일 주소
        subject: req.body.subject, // 제목
        text: 
            `Name : ${req.body.name} \n
            Telephone number : ${req.body.telephoneNumber} \n
            Wechat ID : ${req.body.wechatID} \n
            Reservation Date : ${req.body.reservationDate} \n                
            Interested Item : ${req.body.interestedItem}`
    };
    // 메일 전송
    transporter.sendMail(mailOptions, function(err, info){
        try {
            if (err) {
                console.log("reservation email error: ", err);
                return res.json({ success: false}, err);
            } else {
                // 메일 전송 성공시 메일정보 등록
                // 예약메일은 로그인하지 않아도 전송이 가능하므로 userId취득이 불가능하다
                const contents = 'name: ' + req.body.name + ', wechatID: ' + req.body.wechatID + 
                    ', tel: ' + req.body.telephoneNumber + ', reservation date: ' + req.body.reservationDate + 
                    ', interested item: ' + req.body.interestedItem
                const body = {
                    type: req.body.type,
                    subject: req.body.subject,
                    to: 'umkyungil@hirosophy.co.jp',
                    from: req.body.email,
                    message: contents,
                }

                const mail = new Mail(body);
                mail.save((err, doc) => {
                    if (err) {
                        console.log("reservation email error: ", err);
                        return res.json({ success: false }, err);
                    }
                    console.log("reservation email success");
                    return res.json({ success: true });
                });                
            }
        } catch(err) {
            console.log("reservation email error: ", err);
            return res.json({ success: false }, err);
        }
    });

    
});

// 메일이력 조회
router.post("/list", (req, res) => {
    let term = req.body.searchTerm;

    if (term) {
        // type과 날짜 값이 들어오지 않은 경우는 term이 없는 경우이기에 별도 조건을 둘 필요가 없다.
        // type만 값이 들어왔을때
        if (term[0] !== "" && term[1] === "") {
            Mail.find({ "type": { '$regex': term, $options: 'i' }})
            .skip(req.body.skip)
            .exec((err, mailInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, mailInfo})
            });
        }
        // 날짜만 값이 들어왔을때
        if (term[0] === "" && term[1] !== "") {
            Mail.find({"createdAt":{$gte: moment(term[1]).toDate()}, $lte: moment(term[2]).toDate()})
            .skip(req.body.skip)
            .exec((err, mailInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, mailInfo})
            });
        }
        // Type과 날짜 값이 들어왔을때
        if (term[0] !== "" && term[1] !== "") {
            Mail.find(
                {"type":{'$regex':term[0], $options: 'i'}, 
                "createdAt":{$gte: moment(term[1]).toDate()}, $lte: moment(term[1]).toDate()}
            )
            .skip(req.body.skip)
            .exec((err, mailInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, mailInfo})
            });
        }
    } else {
        Mail.find().exec((err, mailInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, mailInfo})
        });
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
