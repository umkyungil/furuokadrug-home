const express = require('express');
const router = express.Router();
const { auth } = require("../middleware/auth");
const nodemailer = require("nodemailer");
const AWS = require('aws-sdk');
const { Mail } = require("../models/Mail");
const { ADMIN_EMAIL, PRE_REGISTER_URL, CHANGE_PASSWORD_URL } = require('../config/config');
const sesConfig = require("../config/sesConfig");
const { User } = require('../models/User');

//=================================
//          Sendmail
//=================================

// 메일정보 등록
const registerMailHistory = async (body) => {
    try {
        const mail = new Mail(body);
        await mail.save((err, doc) => {
            if (err) {
                console.log("Failed to send mail: ", err);
                return false;
            }
            return true;
        });    
    } catch (err) {
        console.log("Failed to send mail: ", err);
        return false;
    }
}

// UserList, CustomerList: 관리자가 고객에게 DM으로 메일전송
router.post("/notice", auth, async (req, res) => {
    // AWS SES 접근 보안키
    process.env.AWS_ACCESS_KEY_ID = sesConfig.accessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = sesConfig.secretAccessKey;
    const ses = new AWS.SES({
        apiVersion: "2010-12-01",
        region: "ap-northeast-1", 
    });
    const transporter = nodemailer.createTransport({ SES: ses, AWS });

    try {
        // 메일 전송
        let mailOptions = {
            from: ADMIN_EMAIL,
            to: req.body.to ,
            subject: req.body.subject,
            text: req.body.message
        };

        const mailResult = await transporter.sendMail(mailOptions);

        // 메일정보 등록
        const body = {
            type: req.body.type,
            from: req.body.from,
            to: req.body.to,
            subject: req.body.subject,
            message: req.body.message,
        }

        const result = registerMailHistory(body);
        if(!result) {
            return res.status(400).json({ success: false }, err);
        } else {
            return res.status(200).json({ success: true })
        }
    } catch (err) {
        console.log(err);
        if (err.statusCode === 400) {
            // 사용자 논리삭제
            //...
            //...
        }
        return res.status(500).json({ success: false, message: err.message });
    }
});

// LiveStreaming: 라이브스트리밍에서 사용자가 룸인 했을때 관리자에게 보내는 메일
router.post("/live", auth, async (req, res) => {
    // AWS SES 접근 보안키
    process.env.AWS_ACCESS_KEY_ID = sesConfig.accessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = sesConfig.secretAccessKey;
    const ses = new AWS.SES({
        apiVersion: "2010-12-01",
        region: "ap-northeast-1", 
    });
    const transporter = nodemailer.createTransport({ SES: ses, AWS });

    // 관리자에 보낼 메일내용 설정
    let message = "管理者 様\n"
    message += "\nライブストリーミングの依頼がありました。\nルーム情報は以下のとおりです\n";
    message += "\n------ ルーム情報 --------------------------------------";
    message += "\n【お名前】" + req.body.fullName
    message += "\n【ルームNo】"  + req.body.room 
    message += "\n【ルームイン時刻】"  + req.body.roomInTime
    message += "\n-----------------------------------------------------------\n";
    message += "このメールはライブストリーミングフォームから送信されました。\n";

    try {
        // 관리자에 메일 전송
        let mailOptions = {
            from: ADMIN_EMAIL,
            to: ADMIN_EMAIL,
            subject: "ライブストリーミングの依頼がありました",
            text: message
        };
        const adminMailResult = await transporter.sendMail(mailOptions);

        // 관리자 메일정보 등록
        const body = {
            type: "Live",
            from: ADMIN_EMAIL,
            to: ADMIN_EMAIL,
            subject: "ライブストリーミングの依頼がありました",
            message: message,
        }
        
        const result = registerMailHistory(body);
        if(!result) {
            return res.status(400).json({ success: false }, err);
        } else {
            return res.status(200).json({ success: true })
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Contact Us: 고객으로 부터 문의메일 수신
router.post("/inquiry", async (req, res) => {
    // AWS SES 접근 보안키
    process.env.AWS_ACCESS_KEY_ID = sesConfig.accessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = sesConfig.secretAccessKey;
    const ses = new AWS.SES({
        apiVersion: "2010-12-01",
        region: "ap-northeast-1", 
    });
    const transporter = nodemailer.createTransport({ SES: ses, AWS })

    // 관리자에 보낼 메일내용 설정
    let adminMessage = "管理者 様\n\n"
    adminMessage += "お問い合わせがありました。\n問い合わせ内容は以下のとおりです。\n";
    adminMessage += "\n------ お問い合わせ内容 -------------------------------------";
    adminMessage += "\n【お名前】" + req.body.name
    adminMessage += "\n【E-Mail】" + req.body.email
    adminMessage += "\n【お問い合わせ内容】" + req.body.message
    adminMessage += "\n-----------------------------------------------------------\n";
    adminMessage += "このメールは問い合わせフォームから送信されました。\n";

    // 사용자 자동송신 메일내용 설정
    let userMessage = req.body.name + " 様\n\n"
    userMessage += "この度は「FURUOKADRUGシステム」へお問い合わせいただき誠にありがとうございます。\n\n以下の内容のお問い合わせを受け付けました。\n";
    userMessage += "3営業日以内に担当者より折り返しご連絡させていただきます。\n";
    userMessage += "尚、お問い合わせ内容によっては、ご返事までにお時間をいただく場合もございます。\nあらかじめご了承ください。\n";
    userMessage += "\n------ ご入力内容 -------------------------------------------";
    userMessage += "\n【お名前】" + req.body.name
    userMessage += "\n【E-Mail】" + req.body.email
    userMessage += "\n【お問い合わせ内容】" + req.body.message
    userMessage += "\n-----------------------------------------------------------\n";
    userMessage += "\nこのメールは「FURUOKADRUGシステム」からお問い合わせいただいた方へ自動送信しております。\n"
    userMessage += "お心当たりのない方は、恐れ入りますが下記へその旨をご連絡いただけますと幸いです。\n";
    userMessage += "-----------------------------------------------------------\n";
    userMessage += "株式会社ヒロソフィー\n";
    userMessage += "〒108-0014\n";
    userMessage += "東京都港区芝4-6-4 ヒロソフィー三田ビル\n";
    userMessage += "TEL: 0120-074-833\n";
    userMessage += "Mail: " + ADMIN_EMAIL;
    userMessage += "\nURL: http://www.hirosophy.co.jp";

    try {
        // 관리자 메일 전송
        let adminOptions = {
            from: ADMIN_EMAIL,
            to: ADMIN_EMAIL, // PROD, DEV에 따라 주소가 변경된(config.js)
            subject: 'お問い合わせがありました',
            text: adminMessage
        };
        const adminMailResult = await transporter.sendMail(adminOptions);
        
        // 사용자 메일 전송
        let userOptions = {
            from: ADMIN_EMAIL,
            to: req.body.email,
            subject: 'お問い合わせありがとうございます',
            text: userMessage
        };
        const userMailResult = await transporter.sendMail(userOptions);

        // 관리자 메일정보 등록
        const adminBody = {
            type: 'Inquiry',
            from: ADMIN_EMAIL,
            to: ADMIN_EMAIL,
            subject: 'お問い合わせがありました',
            message: adminMessage
        }
        const adminResult = registerMailHistory(adminBody);
        if(!adminResult) return res.status(400).json({ success: false }, err);

        // 사용자 메일정보 등록
        const userBody = {
            type: 'Inquiry',
            from: ADMIN_EMAIL,
            to: req.body.email,
            subject: 'お問い合わせありがとうございます',
            message: userMessage
        }
        const userResult = registerMailHistory(userBody);
        if(!userResult) return res.status(400).json({ success: false }, err);

        return res.status(200).json({ success: true });
    } catch (err) {
        console.log("err.code: ", err.code);

        return res.status(500).json({ success: false, message: err.message });
    }
});

// Virtual Reservation (고객이 예약메일을 관리자에게 송신)
router.post("/reserve", async (req, res) => {
    // AWS SES 접근 보안키
    process.env.AWS_ACCESS_KEY_ID = sesConfig.accessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = sesConfig.secretAccessKey;
    const ses = new AWS.SES({
        apiVersion: "2010-12-01",
        region: "ap-northeast-1", 
    });
    const transporter = nodemailer.createTransport({ SES: ses, AWS })
    
    // 관리자에 보낼 메일내용 설정
    let adminMessage = "管理者 様\n"
    adminMessage += "\n仮想予約の依頼がありました。\n予約の詳細は以下の通りです。\n";
    adminMessage += "\n------ ご予約内容 --------------------------------------";
    adminMessage += "\n【お名前】" + req.body.name
    adminMessage += "\n【電話番号】" + req.body.telephoneNumber 
    adminMessage += "\n【WeChat ID】" + req.body.weChatID
    adminMessage += "\n【予約日】" + req.body.reservationDate
    adminMessage += "\n【興味があるアイテム】" + req.body.interestedItem
    adminMessage += "\n【E-mail】" + req.body.email
    adminMessage += "\n-----------------------------------------------------------\n";
    adminMessage += "このメールは仮想予約フォームから送信されました。\n";

    // 사용자 자동송신 메일내용 설정
    let userMessage = req.body.name + " 様\n\n"
    userMessage += "この度はご予約いただき誠にありがとうございます。\n下記の内容で予約を承りました。\n";
    userMessage += "\n------ ご入力内容 --------------------------------------";
    userMessage += "\n【お名前】" + req.body.name
    userMessage += "\n【電話番号】" + req.body.telephoneNumber 
    userMessage += "\n【WeChat ID】" + req.body.weChatID
    userMessage += "\n【予約日】" + req.body.reservationDate
    userMessage += "\n【興味があるアイテム】" + req.body.interestedItem
    userMessage += "\n【E-mail】" + req.body.email
    userMessage += "\n-----------------------------------------------------------\n";
    userMessage += "\n[キャンセルについて]\n"
    userMessage += "キャンセルは予約日の3日前までにご連絡をお願いいたします。\n"
    userMessage += "当日" + req.body.name + " 様にお会いできますことを心よりお待ちしております。\n\n"
    userMessage += "このメールは「FURUOKADRUGシステム」からご予約をいただいた方へ自動送信しております。\n"
    userMessage += "お心当たりのない方は、恐れ入りますが下記へその旨をご連絡いただけますと幸いです。\n";
    userMessage += "-----------------------------------------------------------\n";
    userMessage += "株式会社ヒロソフィー\n";
    userMessage += "〒108-0014\n";
    userMessage += "東京都港区芝4-6-4 ヒロソフィー三田ビル\n";
    userMessage += "TEL: 0120-074-833\n";
    userMessage += "Mail: " + ADMIN_EMAIL;
    userMessage += "\nURL: http://www.hirosophy.co.jp";
    
    try {
        // 관리자 메일전송
        let adminOptions = {
            from: req.body.email, // 발송 메일 주소 (설정을 해도 위에서 작성한 gmail 계정 아이디로 보내진다) 
            to: ADMIN_EMAIL, // PROD, DEV에 따라 주소가 변경된(config.js)
            subject: 'ご予約がありました',
            text: adminMessage
        };
        const adminMailResult = await transporter.sendMail(adminOptions);

        // 사용자 메일전송
        let userOptions = {
            from: ADMIN_EMAIL,
            to: req.body.email,
            subject: 'ご予約ありがとうございます',
            text: userMessage
        };
        const userMailResult = await transporter.sendMail(userOptions);

        // 관리자 메일정보 등록
        const adminBody = {
            type: 'Reserve',
            from: req.body.email,
            to: ADMIN_EMAIL,
            subject: 'ご予約がありました',
            message: adminMessage,
        }
        const adminResult = registerMailHistory(adminBody);
        if(!adminResult) return res.status(400).json({ success: false }, err);

        // 사용자 메일정보 등록
        const userBody = {
            type: 'Reserve',
            from: ADMIN_EMAIL,
            to: req.body.email,
            subject: 'ご予約ありがとうございます',
            message: userMessage,
        }
        const userResult = registerMailHistory(userBody);
        if(!userResult) return res.status(400).json({ success: false }, err);

        return res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

router.post("/passwordChange", async (req, res) => {
    // AWS SES 접근 보안키
    process.env.AWS_ACCESS_KEY_ID = sesConfig.accessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = sesConfig.secretAccessKey;
    const ses = new AWS.SES({
        apiVersion: "2010-12-01",
        region: "ap-northeast-1", 
    });
    const transporter = nodemailer.createTransport({ SES: ses, AWS });

    // 메일내용 설정
    let userMessage = req.body.name + " " + req.body.lastName + " 様\n\n";
    userMessage += "ログインのパスワードリセットの申請を受け付けました。\n\n";
    userMessage += "パスワードの再設定をご希望の場合は、以下URLをクリックし\n";
    userMessage += "新しいパスワードをご登録ください。\n";
    userMessage += CHANGE_PASSWORD_URL + `${req.body.userId}\n\n`;
    userMessage += "※当メール送信後、1時間を超過しますと、セキュリティ保持のため有効期限切れとなります。\n";
    userMessage += "　その場合は再度、最初からお手続きをお願い致します。\n";
    userMessage += "※当メールは送信専用メールアドレスから配信されています。\n";
    userMessage += "　このままご返信いただいてもお答えできませんのでご了承ください。\n";
    userMessage += "※当メールに心当たりの無い場合は、誠に恐れ入りますが\n";
    userMessage += "　破棄して頂けますよう、よろしくお願い致します。";

    try {
         // 사용자 메일전송
        let userOptions = {
            from: ADMIN_EMAIL,
            to: req.body.email,
            subject: 'パスワードリセットのお知らせ',
            text: userMessage
        };
        const userMailResult = await transporter.sendMail(userOptions);

        // 메일전송 실패
        if (!userMailResult.envelope) {
            //임시사용자 삭제 
            const result = await User.remove({ _id: req.body._id });
            return res.status(400).json({ success: false, message: userMailResult.code });
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// 비밀번호변경 확인메일 송신
router.post("/passwordConfirm", async (req, res) => {
    // AWS SES 접근 보안키
    process.env.AWS_ACCESS_KEY_ID = sesConfig.accessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = sesConfig.secretAccessKey;
    const ses = new AWS.SES({
        apiVersion: "2010-12-01",
        region: "ap-northeast-1", 
    });
    const transporter = nodemailer.createTransport({ SES: ses, AWS });

    // 메일내용 설정
    let userMessage = req.body.name + " " + req.body.lastName + " 様\n\n"
    userMessage += "パスワード変更完了いたしました。\n\n";
    userMessage += "※当メールは送信専用メールアドレスから配信されています。\n";
    userMessage += "　このままご返信いただいてもお答えできませんのでご了承ください。\n";
    userMessage += "※当メールに心当たりの無い場合は、誠に恐れ入りますが\n";
    userMessage += "　破棄して頂けますよう、よろしくお願い致します。";

    try {
        // 사용자 메일전송
        let userOptions = {
            from: ADMIN_EMAIL,
            to: req.body.email,
            subject: 'パスワード変更完了のお知らせ',
            text: userMessage
        };
        const userMailResult = await transporter.sendMail(userOptions);

        // 관리자 메일정보 등록
        const userBody = {
            type: 'Password',
            from: ADMIN_EMAIL,
            to: req.body.email,
            subject: 'パスワード変更完了のお知らせ',
            message: userMessage
        }
        const userResult = registerMailHistory(userBody);
        if(!userResult) return res.status(400).json({ success: false }, err);

        return res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// User Preregistration (사용자 임시가입)
router.post("/preregister", async (req, res) => {
    // AWS SES 접근 보안키
    process.env.AWS_ACCESS_KEY_ID = sesConfig.accessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = sesConfig.secretAccessKey;
    const ses = new AWS.SES({
        apiVersion: "2010-12-01",
        region: "ap-northeast-1", 
    });
    const transporter = nodemailer.createTransport({ SES: ses, AWS })

    // 메일내용 설정
    let userMessage = req.body.name + " " + req.body.lastName + " 様\n\n";
    userMessage += "この度は、「FURUOKADRUG」にお申し込み頂きまして誠にありがとうございます。\n\n";
    userMessage += "ご本人様確認のため、下記URLへ「1時間以内」にアクセスし\n";
    userMessage += "アカウントの本登録を完了させて下さい。\n";
    userMessage += PRE_REGISTER_URL + `${req.body._id}\n\n`;
    userMessage += "※当メール送信後、1時間を超過しますと、セキュリティ保持のため有効期限切れとなります。\n";
    userMessage += "　その場合は再度、最初からお手続きをお願い致します。\n";
    userMessage += "※当メールは送信専用メールアドレスから配信されています。\n";
    userMessage += "　このままご返信いただいてもお答えできませんのでご了承ください。\n";
    userMessage += "※当メールに心当たりの無い場合は、誠に恐れ入りますが\n";
    userMessage += "　破棄して頂けますよう、よろしくお願い致します。";

    try {
         // 사용자 메일전송
        let userOptions = {
            from: ADMIN_EMAIL,
            to: req.body.email,
            subject: '仮登録完了メール',
            text: userMessage
        };
        const userMailResult = await transporter.sendMail(userOptions);

        // 메일전송 실패
        if (!userMailResult.envelope) {
            //임시사용자 삭제 
            const result = await User.remove({ _id: req.body._id });
            return res.status(400).json({ success: false, message: userMailResult.code });
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// User Registration (회원가입감사 메일송신)
router.post("/register", async (req, res) => {
    // AWS SES 접근 보안키
    process.env.AWS_ACCESS_KEY_ID = sesConfig.accessKeyId;
    process.env.AWS_SECRET_ACCESS_KEY = sesConfig.secretAccessKey;
    const ses = new AWS.SES({
        apiVersion: "2010-12-01",
        region: "ap-northeast-1", 
    });
    const transporter = nodemailer.createTransport({ SES: ses, AWS })

    // 메일내용 설정
    let userMessage = req.body.name + " " + req.body.lastName + " 様\n\n"
    userMessage += "この度は「FURUOKADRUG」へのご登録、誠にありがとうございます。\n";
    userMessage += "本日より、FURUOKADRUGシステムのサービスがご利用いただけます。\n";
    userMessage += "引き続きFURUOKADRUGをよろしくお願いいたします。\n\n";
    userMessage += "ご不明な点、お問い合わせは下記ユーザーサポートページをご確認くださいませ。\n"
    userMessage += "URL: https://furuokadrug.herokuapp.com/ \n"

    try {
        // 사용자 메일전송
        let userOptions = {
            from: ADMIN_EMAIL,
            to: req.body.email,
            subject: '会員登録完了のお知らせ',
            text: userMessage
        };
        const userMailResult = await transporter.sendMail(userOptions);

        // 관리자 메일정보 등록
        const userBody = {
            type: 'Register',
            from: ADMIN_EMAIL,
            to: req.body.email,
            subject: '会員登録完了のお知らせ',
            message: userMessage
        }
        const userResult = registerMailHistory(userBody);
        if(!userResult) return res.status(400).json({ success: false }, err);

        return res.status(200).json({ success: true });
    } catch (err) {
        console.log(err);

        if (err.statusCode === 400) {
            // 사용자 논리삭제
            //...
            //...
        }
        return res.status(500).json({ success: false, message: err.message });
    }
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