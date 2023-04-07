const express = require('express');
const router = express.Router();
const { auth } = require("../middleware/auth");
const nodemailer = require("nodemailer");
const AWS_SDK = require('aws-sdk');
const { Mail } = require("../models/Mail");
const { ADMIN_EMAIL, PRE_REGISTER_URL, CHANGE_PASSWORD_URL, HIROSOPHY_URL, FURUOKADRUG_URL } = require('../config/url');
const { MAIN_CATEGORY, CouponType, SaleType, UseWithSale, AWS_SES } = require('../config/const');
const { User } = require('../models/User');
const { Product } = require('../models/Product');
const { AmazonWebService }  = require('../models/AmazonWebService');

//=================================
//          Sendmail
//=================================]

// AWS SES 접근 보안키 가져와서 메일전송
const sendMailProcess = async (mailOptions) => {
    const sesInfos = await AmazonWebService.findOne({ type: AWS_SES });
    const sesObject = new AWS_SDK.SES({
        accessKeyId: sesInfos.access,
        secretAccessKey: sesInfos.secret,
        region: sesInfos.region
    });

    const transporter = nodemailer.createTransport({ SES: sesObject, AWS_SDK });
    await transporter.sendMail(mailOptions);
}

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
    try {
        // 메일 전송
        let mailOptions = {
            from: ADMIN_EMAIL,
            to: req.body.to ,
            subject: req.body.subject,
            text: req.body.message
        };
        
        await sendMailProcess(mailOptions);

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
        return res.status(500).json({ success: false, message: err.message });
    }
});

// LiveStreaming: 라이브스트리밍에서 사용자가 룸인 했을때 관리자에게 보내는 메일
router.post("/live", auth, async (req, res) => {
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
        await sendMailProcess(mailOptions);

        // 메일정보 등록
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
    userMessage += "Mail: " + ADMIN_EMAIL + "\n";
    userMessage += `URL: ${HIROSOPHY_URL}`;

    try {
        // 관리자 메일 전송
        let adminOptions = {
            from: ADMIN_EMAIL,
            to: ADMIN_EMAIL, // PROD, DEV에 따라 주소가 변경된(config.js)
            subject: 'お問い合わせがありました',
            text: adminMessage
        };
        await sendMailProcess(adminOptions);
        
        // 사용자 메일 전송
        let userOptions = {
            from: ADMIN_EMAIL,
            to: req.body.email,
            subject: 'お問い合わせありがとうございます',
            text: userMessage
        };
        await sendMailProcess(userOptions);

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
    userMessage += "Mail: " + ADMIN_EMAIL + "\n";
    userMessage += `URL: ${HIROSOPHY_URL}`;
    
    try {
        // 관리자 메일전송
        let adminOptions = {
            from: req.body.email, // 발송 메일 주소 (설정을 해도 위에서 작성한 gmail 계정 아이디로 보내진다) 
            to: ADMIN_EMAIL, // PROD, DEV에 따라 주소가 변경된(config.js)
            subject: 'ご予約がありました',
            text: adminMessage
        };
        await sendMailProcess(adminOptions);

        // 사용자 메일전송
        let userOptions = {
            from: ADMIN_EMAIL,
            to: req.body.email,
            subject: 'ご予約ありがとうございます',
            text: userMessage
        };
        await sendMailProcess(userOptions);

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
    // 메일내용 설정
    let userMessage = req.body.lastName + " " + req.body.name + " 様\n\n";
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
        const userMailResult = await sendMailProcess(userOptions);

        // 메일전송 실패
        if (!userMailResult.envelope) {
            //임시사용자 삭제 
            await Sale.deleteOne({ _id: req.body._id });
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
    // 메일내용 설정
    let userMessage = req.body.lastName + " " + req.body.name + " 様\n\n"
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
        const userMailResult = await sendMailProcess(userOptions);

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
    // 메일내용 설정
    let japaneseMessage = req.body.lastName + " " + req.body.name + " 様\n\n";
    japaneseMessage += "この度は、「FURUOKADRUG」にお申し込み頂きまして誠にありがとうございます。\n\n";
    japaneseMessage += "ご本人様確認のため、下記URLへ「1時間以内」にアクセスし\n";
    japaneseMessage += "アカウントの本登録を完了させて下さい。\n";
    japaneseMessage += PRE_REGISTER_URL + `${req.body._id}\n\n`;
    japaneseMessage += "※当メール送信後、1時間を超過しますと、セキュリティ保持のため有効期限切れとなります。\n";
    japaneseMessage += "　その場合は再度、最初からお手続きをお願い致します。\n";
    japaneseMessage += "※当メールは送信専用メールアドレスから配信されています。\n";
    japaneseMessage += "　このままご返信いただいてもお答えできませんのでご了承ください。\n";
    japaneseMessage += "※当メールに心当たりの無い場合は、誠に恐れ入りますが\n";
    japaneseMessage += "　破棄して頂けますよう、よろしくお願い致します。";
    
    let chineseMessage = "亲爱的" + req.body.lastName + " " + req.body.name + "\n\n";
    chineseMessage += "非常感谢您在「FURUOKADRUG」注册账号。\n\n";
    chineseMessage += "为了确认您的身份, 请您在1小时内点击以下链接, 完成账号注册。\n";
    chineseMessage += PRE_REGISTER_URL + `${req.body._id}\n\n`;
    chineseMessage += "※为了确认您的身份, 请您在1小时内点击以下链接, 完成账号注册。\n";
    chineseMessage += "　如遇到这种情况, 请您重新操作注册流程。\n";
    chineseMessage += "※此邮件是专用邮件地址发送的。\n";
    chineseMessage += "　如果您给这个邮件地址回信, 我们也无法回复。\n";
    chineseMessage += "※如果您对这封邮件没有印象, 给您带来的不便我们深表歉意。\n";
    chineseMessage += "　请您删除这封邮件。";

    let englishMessage = "Hi " + req.body.lastName + " " + req.body.name + "\n\n";
    englishMessage += "Thank you very much for applying for「FURUOKADRUG」\n\n";
    englishMessage += "Please access the following URL within 1 hour to confirm your identity.\n";
    englishMessage += "Please complete the registration of your account.\n";
    englishMessage += PRE_REGISTER_URL + `${req.body._id}\n\n`;
    englishMessage += "※If 1 hour has passed since this email was sent, it will expire for security reasons.\n";
    englishMessage += "　In that case, please repeat the procedure from the beginning.\n";
    englishMessage += "※This email is sent from a send-only email address.\n";
    englishMessage += "　Please note that even if you reply as is, we will not be able to answer.\n";
    englishMessage += "※If you do not recognize this email, we apologize for the inconvenience.\n";
    englishMessage += "　I would appreciate it if you could discard it.";

    try {
        // 사용자 언어에 해당하는 메일 설정
        let userMessage = japaneseMessage;
        if (req.body.language === "en") {
            userMessage = englishMessage;
        } else if (req.body.language === "cn") {
            userMessage = chineseMessage;
        }

         // 사용자 메일전송
        let userOptions = {
            from: ADMIN_EMAIL,
            to: req.body.email,
            subject: '仮登録完了メール',
            text: userMessage
        };
        const userMailResult = await sendMailProcess(userOptions);

        // 메일전송 실패
        if (!userMailResult.envelope) {
            //임시사용자 삭제
            await User.deleteOne({ _id: req.body._id });
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
    // 메일내용 설정
    let userMessage = req.body.lastName + " " + req.body.name + " 様\n\n"
    userMessage += "この度は「FURUOKADRUG」へのご登録、誠にありがとうございます。\n";
    userMessage += "本日より、FURUOKADRUGシステムのサービスがご利用いただけます。\n";
    userMessage += "引き続きFURUOKADRUGをよろしくお願いいたします。\n\n";
    userMessage += "ご不明な点、お問い合わせは下記ユーザーサポートページをご確認くださいませ。\n"
    userMessage += `URL: ${FURUOKADRUG_URL}`

    try {
        // 사용자 메일전송
        let userOptions = {
            from: ADMIN_EMAIL,
            to: req.body.email,
            subject: '会員登録完了のお知らせ',
            text: userMessage
        };
        const userMailResult = await sendMailProcess(userOptions);

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
        console.log("User Registration: ", err);

        if (err.statusCode === 400) {
            // 사용자 논리삭제
            //...
            //...
        }
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Coupon Registration (쿠폰등록시 메일송신)
router.post("/coupon", async (req, res) => {
    try {
        // 메일내용 설정
        let japaneseMessage = "いつも「FURUOKADRUG」をご利用いただき、ありがとうございます。\n";
        japaneseMessage += "このメールを受け取られたお客様限定でキャンペーンをご案内させて頂いております。\n\n"
        japaneseMessage += "「" + req.body.validFrom + "」から「" + req.body.validTo + "」までの特別クーポンのご案内\n";
        japaneseMessage += "【クーポンの内容】\n";
        // 쿠폰종류 설정
        let tmpKey = "";
        CouponType.map(item => {
            if (item.key === req.body.type) {
                tmpKey = item.key; 
                japaneseMessage += " ・クーポン種類: " + item.value + "\n";
            }
        })
        // 쿠폰종류에 따른 할인율 단위
        japaneseMessage += " ・クーポン割引: " + req.body.amount
        if (tmpKey === "0") japaneseMessage += "%\n";
        if (tmpKey === "1") japaneseMessage += "(point)\n";
        if (tmpKey === "2") japaneseMessage += "(JPY)\n";
        // 카테고리
        MAIN_CATEGORY.map(item => {
            if (item.key === Number(req.body.item)) {
                japaneseMessage += " ・カテゴリ: " + item.value + "\n";
            }
        })
        // 상품정보 가져오기
        if (req.body.productId !== "") {
            const productInfo = await Product.find({ "_id": req.body.productId });
            japaneseMessage += " ・対象商品: " + productInfo[0].title + "\n";
        }
        // 세일과 함께 사용유무
        UseWithSale.map(item => {
            if (item.key === req.body.useWithSale) {
                japaneseMessage += " ・セール併用: " + item.value + "\n";
            }
        })
        // 쿠폰 사용회수
        if (req.body.count === "") {
            japaneseMessage += " ・使用次数: 無制限\n\n";
        } else {
            japaneseMessage += " ・使用次数: " + req.body.count + "\n\n";
        }
        japaneseMessage += "【クーポン有効期限】\n";
        japaneseMessage += req.body.validFrom + " ～ " + req.body.validTo + "\n\n";
        japaneseMessage += "【クーポンコード】\n";
        japaneseMessage += " ・コード: " + req.body.code + "\n\n";
        japaneseMessage += "期間限定のクーポンとなります。是非この機会にご利用ください。\n"

        // 관리자 메일 전송
        const adminName = "管理者様\n\n";

        // 쿠폰등록인 경우
        let adminMessage = "";
        if (req.body.mod === "reg") {
            adminMessage = "";
        } else if (req.body.mod === "modify") {
            // 세일수정인 경우
            let tmpActive = '';
            if (req.body.active === '1') {
                tmpActive = '「使用可」'
            } else {
                tmpActive = '「使用不可」'
            }
            adminMessage = "下記のセールを" + tmpActive + "に修正しました\n\n";
        }

        let adminOptions = {
            from: ADMIN_EMAIL,
            to: ADMIN_EMAIL,
            subject: '「FURUOKADRUG」特別のクーポン案内 ' + req.body.validTo + 'まで',
            text: adminName + adminMessage + japaneseMessage
        };
        await sendMailProcess(adminOptions);

        // 쿠폰 사용자가 지정되어 있는경우
        if (req.body.userId !== "") {
            // 사용자 정보 가져오기
            const userInfo = await User.find({ "_id": req.body.userId });
            // 사용자의 언어가 일본어인 경우
            if (userInfo[0].language === "jp") {
                const userName = userInfo[0].lastName + " " + userInfo[0].name + "様\n\n"
                // 사용자 메일 전송
                let userOptions = {
                    from: ADMIN_EMAIL,
                    to: userInfo[0].email,
                    subject: '「FURUOKADRUG」特別のクーポン案内 ' + req.body.validTo + 'まで',
                    text: userName + japaneseMessage
                };
                await sendMailProcess(userOptions);
            }
            // 사용자의 언어가 영인 경우
            if (userInfo[0].language === "en") {
                // 메일본문 설정
                let englishMessage = "Thank you for your continued use of「FURUOKADRUG」.\n";
                englishMessage += "We are pleased to announce a special campaign only for customers who have received this e-mail.\n\n"
                englishMessage += "Special Coupon Information from「" + req.body.validFrom + "」to「" + req.body.validTo + "」\n";
                englishMessage += "【Coupon details】\n";
                // 쿠폰종류 설정
                let tmpKey = "";
                CouponType.map(item => {
                    if (item.key === req.body.type) {
                        tmpKey = item.key; 
                        englishMessage += " ・Coupon Type: " + item.value + "\n";
                    }
                })
                // 쿠폰종류에 따른 할인율 단위
                englishMessage += " ・Coupon Discount: " + req.body.amount
                if (tmpKey === "0") englishMessage += "%\n";
                if (tmpKey === "1") englishMessage += "(point)\n";
                if (tmpKey === "2") englishMessage += "(JPY)\n";
                // 카테고리
                MAIN_CATEGORY.map(item => {
                    if (item.key === Number(req.body.item)) {
                        englishMessage += " ・Category: " + item.value + "\n";
                    }
                })
                // 상품정보 가져오기
                if (req.body.productId !== "") {
                    const productInfo = await Product.find({ "_id": req.body.productId });
                    englishMessage += " ・Product: " + productInfo[0].title + "\n";
                }
                // 세일과 함께 사용유무
                UseWithSale.map(item => {
                    if (item.key === req.body.useWithSale) {
                        englishMessage += " ・Use with sale: " + item.value + "\n";
                    }
                })
                // 쿠폰 사용회수
                if (req.body.count === "") {
                    englishMessage += " ・Number of use: Unlimited\n\n";
                } else {
                    englishMessage += " ・Number of use: " + req.body.count + "\n\n";
                }
                englishMessage += "【Coupon Expiration Date】\n";
                englishMessage += req.body.validFrom + " ～ " + req.body.validTo + "\n\n";
                englishMessage += "【Coupon code】\n";
                englishMessage += " ・Code: " + req.body.code + "\n\n";
                englishMessage += "This is a limited time offer. Please take advantage of this opportunity."

                // 사용자 메일전송
                const userName = "Hi " + userInfo[0].lastName + "." + userInfo[0].name + "\n\n"
                const englishOptions = {
                    from: ADMIN_EMAIL,
                    to: userInfo[0].email,
                    subject: 'Special Coupon Information of「FURUOKADRUG」until ' + req.body.validTo,
                    text: userName + englishMessage
                };

                await sendMailProcess(englishOptions);
            }
            // 사용자의 언어가 중국어인 경우
            if (userInfo[0].language === "cn") {
                // 메일본문 설정
                let chineseMessage = "感谢你一直以来使用 【古冈药妆】。\n";
                chineseMessage += "这是一封限定优惠活动的邮件，为只有收到这封邮件的客户专门提供的一个特别活动。\n\n"
                chineseMessage += "从 「" + req.body.validFrom + "」到「" + req.body.validTo + "」的特别优惠券信息\n";
                chineseMessage += "【优惠券内容】\n";
                // 쿠폰종류 설정
                let tmpKey = "";
                SaleType.map(item => {
                    if (item.key === req.body.type) {
                        tmpKey = item.key; 
                        chineseMessage += " ・优惠券类型: " + item.value + "\n";
                    }
                })
                // 쿠폰종류에 따른 할인율 단위
                chineseMessage += " ・优惠券折扣: " + req.body.amount
                if (tmpKey === "0") chineseMessage += "%\n";
                if (tmpKey === "1") chineseMessage += "(point)\n";
                if (tmpKey === "2") chineseMessage += "(JPY)\n";
                // 카테고리
                MAIN_CATEGORY.map(item => {
                    if (item.key === Number(req.body.item)) {
                        chineseMessage += " ・可用类别: " + item.value + "\n";
                    }
                })
                // 상품정보 가져오기
                if (req.body.productId !== "") {
                    const productInfo = await Product.find({ "_id": req.body.productId });
                    chineseMessage += " ・产品: " + productInfo[0].title + "\n";
                }
                // 세일과 함께 사용유무
                UseWithSale.map(item => {
                    if (item.key === req.body.useWithSale) {
                        chineseMessage += " ・与折扣一起使用: " + item.value + "\n";
                    }
                })
                // 쿠폰 사용회수
                if (req.body.count === "") {
                    chineseMessage += " ・使用次数: 无限\n\n";
                } else {
                    chineseMessage += " ・使用次数: " + req.body.count + "\n\n";
                }
                
                chineseMessage += "【优惠截止日期】\n";
                chineseMessage += req.body.validFrom + " ～ " + req.body.validTo + "\n\n";
                chineseMessage += "【优惠券代码】\n";
                chineseMessage += " ・代码: " + req.body.code + "\n\n";
                chineseMessage += "这是一个限时优惠。 请抓住这个机会。"

                // 사용자 메일전송
                const userName = "亲爱的" + userInfo[0].lastName + " " + userInfo[0].name + "\n\n"
                const chineseOptions = {
                    from: ADMIN_EMAIL,
                    to: userInfo[0].email,
                    subject: '【古冈药妆】特别优惠券活动至' + req.body.validTo + '为止',
                    text: userName + chineseMessage
                };

                await sendMailProcess(chineseOptions);
            }
        } else {
            // 논리삭제가 되지않은 모든 일반 사용자에게 메일 전송
            const userInfos = await User.find({ "password": {$exists: true}, "deletedAt": null , "role": 0 });
            for (let i=0; i<userInfos.length; i++) {
                // 사용자의 언어가 일본어인 경우
                if (userInfos[i].language === "jp") {
                    const userName = userInfos[i].lastName + " " + userInfos[i].name + "様\n\n"
                    // 사용자 메일전송
                    const japaneseOptions = {
                        from: ADMIN_EMAIL,
                        to: userInfos[i].email,
                        subject: '「FURUOKADRUG」特別のセール案内 ' + req.body.validTo + 'まで',
                        text: userName + japaneseMessage
                    };

                    await sendMailProcess(japaneseOptions);
                }
                // 사용자의 언어가 영어인 경우
                if (userInfos[i].language === "en") {
                    // 메일본문 설정
                    let englishMessage = "Thank you for your continued use of「FURUOKADRUG」.\n";
                    englishMessage += "We are pleased to announce a special campaign only for customers who have received this e-mail.\n\n"
                    englishMessage += "Special Coupon Information from「" + req.body.validFrom + "」to「" + req.body.validTo + "」\n";
                    englishMessage += "【Coupon details】\n";
                    // 쿠폰종류 설정
                    let tmpKey = "";
                    CouponType.map(item => {
                        if (item.key === req.body.type) {
                            tmpKey = item.key; 
                            englishMessage += " ・Coupon Type: " + item.value + "\n";
                        }
                    })
                    // 쿠폰종류에 따른 할인율 단위
                    englishMessage += " ・Coupon Discount: " + req.body.amount
                    if (tmpKey === "0") englishMessage += "%\n";
                    if (tmpKey === "1") englishMessage += "(point)\n";
                    if (tmpKey === "2") englishMessage += "(JPY)\n";
                    // 카테고리
                    MAIN_CATEGORY.map(item => {
                        if (item.key === Number(req.body.item)) {
                            englishMessage += " ・Category: " + item.value + "\n";
                        }
                    })
                    // 상품정보 가져오기
                    if (req.body.productId !== "") {
                        const productInfo = await Product.find({ "_id": req.body.productId });
                        englishMessage += " ・Product: " + productInfo[0].title + "\n";
                    }
                    // 세일과 함께 사용유무
                    UseWithSale.map(item => {
                        if (item.key === req.body.useWithSale) {
                            englishMessage += " ・Use with sale: " + item.value + "\n";
                        }
                    })
                    // 쿠폰 사용회수
                    if (req.body.count === "") {
                        englishMessage += " ・Number of uses: Unlimited\n\n";
                    } else {
                        englishMessage += " ・Number of uses: " + req.body.count + "\n\n";
                    }
                    englishMessage += "【Coupon Expiration Date】\n";
                    englishMessage += req.body.validFrom + " ～ " + req.body.validTo + "\n\n";
                    englishMessage += "【Coupon code】\n";
                    englishMessage += " ・Code: " + req.body.code + "\n\n";
                    englishMessage += "This is a limited time offer. Please take advantage of this opportunity."

                    // 사용자 메일전송
                    const userName = "Hi " + userInfos[i].lastName + "." + userInfos[i].name + "\n\n"
                    const englishOptions = {
                        from: ADMIN_EMAIL,
                        to: userInfos[i].email,
                        subject: 'Special Coupon Information of「FURUOKADRUG」until ' + req.body.validTo,
                        text: userName + englishMessage
                    };

                    await sendMailProcess(englishOptions);
                }
                // 사용자의 언어가 중국어인 경우
                if (userInfos[i].language === "cn") {
                    // 메일본문 설정
                    let chineseMessage = "感谢你一直以来使用 【古冈药妆】。\n";
                    chineseMessage += "这是一封限定优惠活动的邮件，为只有收到这封邮件的客户专门提供的一个特别活动。\n\n"
                    chineseMessage += "从 「" + req.body.validFrom + "」到「" + req.body.validTo + "」的特别优惠券信息\n";
                    chineseMessage += "【优惠券内容】\n";
                    // 쿠폰종류 설정
                    let tmpKey = "";
                    SaleType.map(item => {
                        if (item.key === req.body.type) {
                            tmpKey = item.key; 
                            chineseMessage += " ・优惠券类型: " + item.value + "\n";
                        }
                    })
                    // 쿠폰종류에 따른 할인율 단위
                    chineseMessage += " ・优惠券折扣: " + req.body.amount
                    if (tmpKey === "0") chineseMessage += "%\n";
                    if (tmpKey === "1") chineseMessage += "(point)\n";
                    if (tmpKey === "2") chineseMessage += "(JPY)\n";
                    // 카테고리
                    MAIN_CATEGORY.map(item => {
                        if (item.key === Number(req.body.item)) {
                            chineseMessage += " ・可用类别: " + item.value + "\n";
                        }
                    })
                    // 상품정보 가져오기
                    if (req.body.productId !== "") {
                        const productInfo = await Product.find({ "_id": req.body.productId });
                        chineseMessage += " ・产品: " + productInfo[0].title + "\n";
                    }
                    // 세일과 함께 사용유무
                    UseWithSale.map(item => {
                        if (item.key === req.body.useWithSale) {
                            chineseMessage += " ・与折扣一起使用: " + item.value + "\n";
                        }
                    })
                    // 쿠폰 사용회수
                    if (req.body.count === "") {
                        chineseMessage += " ・使用次数: 無制限\n\n";
                    } else {
                        chineseMessage += " ・使用次数: " + req.body.count + "\n\n";
                    }
                    chineseMessage += "【优惠截止日期】\n";
                    chineseMessage += req.body.validFrom + " ～ " + req.body.validTo + "\n\n";
                    chineseMessage += "【优惠券代码】\n";
                    chineseMessage += " ・代码: " + req.body.code + "\n\n";
                    chineseMessage += "这是一个限时优惠。 请抓住这个机会。"

                    // 사용자 메일전송
                    const userName = "亲爱的" + userInfos[i].lastName + " " + userInfos[i].name + "\n\n"
                    const chineseOptions = {
                        from: ADMIN_EMAIL,
                        to: userInfos[i].email,
                        subject: '【古冈药妆】特别优惠券活动至' + req.body.validTo + '为止',
                        text: userName + chineseMessage
                    };

                    await sendMailProcess(chineseOptions);
                }
            }
        }
    } catch (err) {
        console.log("Coupon send mail err:", err);
    }
});

// Coupon Birthday Registration (생일자 쿠폰등록시 메일송신)
router.post("/coupon/birth", async (req, res) => {
    try {
        // 메일내용 설정
        let japaneseMessage = "いつも「FURUOKADRUG」をご利用いただき、ありがとうございます。\n";
        japaneseMessage += "このメールを受け取られたお客様限定でキャンペーンをご案内させて頂いております。\n\n"
        japaneseMessage += "「" + req.body.validFrom + "」から「" + req.body.validTo + "」までの特別クーポンのご案内\n";
        japaneseMessage += "【クーポンの内容】\n";
        // 쿠폰종류 설정
        let tmpKey = "";
        CouponType.map(item => {
            if (item.key === req.body.type) {
                tmpKey = item.key; 
                japaneseMessage += " ・クーポン種類: " + item.value + "\n";
            }
        })
        // 쿠폰종류에 따른 할인율 단위
        japaneseMessage += " ・クーポン割引: " + req.body.amount
        if (tmpKey === "0") japaneseMessage += "%\n";
        if (tmpKey === "1") japaneseMessage += "(point)\n";
        if (tmpKey === "2") japaneseMessage += "(JPY)\n";
        // 카테고리
        MAIN_CATEGORY.map(item => {
            if (item.key === Number(req.body.item)) {
                japaneseMessage += " ・カテゴリ: " + item.value + "\n";
            }
        })
        // 상품정보 가져오기
        if (req.body.productId !== "") {
            const productInfo = await Product.find({ "_id": req.body.productId });
            japaneseMessage += " ・対象商品: " + productInfo[0].title + "\n";
        }
        // 세일과 함께 사용유무
        UseWithSale.map(item => {
            if (item.key === req.body.useWithSale) {
                japaneseMessage += " ・セール併用: " + item.value + "\n";
            }
        })
        // 쿠폰 사용회수
        if (req.body.count === "") {
            japaneseMessage += " ・使用次数: 無制限\n\n";
        } else {
            japaneseMessage += " ・使用次数: " + req.body.count + "\n\n";
        }
        japaneseMessage += "【クーポン有効期限】\n";
        japaneseMessage += req.body.validFrom + " ～ " + req.body.validTo + "\n\n";
        japaneseMessage += "【クーポンコード】\n";
        japaneseMessage += " ・コード: " + req.body.code + "\n\n";
        japaneseMessage += "期間限定のクーポンとなります。是非この機会にご利用ください。\n"

        // 관리자 메일 전송
        const adminName = "管理者様\n\n";

        // 쿠폰등록인 경우
        let adminMessage = "";
        if (req.body.mod === "reg") {
            adminMessage = "";
        } else if (req.body.mod === "modify") {
            // 세일수정인 경우
            let tmpActive = '';
            if (req.body.active === '1') {
                tmpActive = '「使用可」'
            } else {
                tmpActive = '「使用不可」'
            }
            adminMessage = "下記のセールを" + tmpActive + "に修正しました\n\n";
        }

        let adminOptions = {
            from: ADMIN_EMAIL,
            to: ADMIN_EMAIL,
            subject: '「FURUOKADRUG」特別のクーポン案内 ' + req.body.validTo + 'まで',
            text: adminName + adminMessage + japaneseMessage
        };
        await sendMailProcess(adminOptions);

        // 쿠폰 사용자가 지정되어 있는경우
        if (req.body.userId !== "") {
            // 사용자 정보 가져오기
            const userInfo = await User.find({ "_id": req.body.userId });
            // 사용자의 언어가 일본어인 경우
            if (userInfo[0].language === "jp") {
                const userName = userInfo[0].lastName + " " + userInfo[0].name + "様\n\n"
                // 사용자 메일 전송
                let userOptions = {
                    from: ADMIN_EMAIL,
                    to: userInfo[0].email,
                    subject: '「FURUOKADRUG」特別のクーポン案内 ' + req.body.validTo + 'まで',
                    text: userName + japaneseMessage
                };
                await sendMailProcess(userOptions);
            }
            // 사용자의 언어가 영인 경우
            if (userInfo[0].language === "en") {
                // 메일본문 설정
                let englishMessage = "Thank you for your continued use of「FURUOKADRUG」.\n";
                englishMessage += "We are pleased to announce a special campaign only for customers who have received this e-mail.\n\n"
                englishMessage += "Special Coupon Information from「" + req.body.validFrom + "」to「" + req.body.validTo + "」\n";
                englishMessage += "【Coupon details】\n";
                // 쿠폰종류 설정
                let tmpKey = "";
                CouponType.map(item => {
                    if (item.key === req.body.type) {
                        tmpKey = item.key; 
                        englishMessage += " ・Coupon Type: " + item.value + "\n";
                    }
                })
                // 쿠폰종류에 따른 할인율 단위
                englishMessage += " ・Coupon Discount: " + req.body.amount
                if (tmpKey === "0") englishMessage += "%\n";
                if (tmpKey === "1") englishMessage += "(point)\n";
                if (tmpKey === "2") englishMessage += "(JPY)\n";
                // 카테고리
                MAIN_CATEGORY.map(item => {
                    if (item.key === Number(req.body.item)) {
                        englishMessage += " ・Category: " + item.value + "\n";
                    }
                })
                // 상품정보 가져오기
                if (req.body.productId !== "") {
                    const productInfo = await Product.find({ "_id": req.body.productId });
                    englishMessage += " ・Product: " + productInfo[0].title + "\n";
                }
                // 세일과 함께 사용유무
                UseWithSale.map(item => {
                    if (item.key === req.body.useWithSale) {
                        englishMessage += " ・Use with sale: " + item.value + "\n";
                    }
                })
                // 쿠폰 사용회수
                if (req.body.count === "") {
                    englishMessage += " ・Number of use: Unlimited\n\n";
                } else {
                    englishMessage += " ・Number of use: " + req.body.count + "\n\n";
                }
                englishMessage += "【Coupon Expiration Date】\n";
                englishMessage += req.body.validFrom + " ～ " + req.body.validTo + "\n\n";
                englishMessage += "【Coupon code】\n";
                englishMessage += " ・Code: " + req.body.code + "\n\n";
                englishMessage += "This is a limited time offer. Please take advantage of this opportunity."

                // 사용자 메일전송
                const userName = "Hi " + userInfo[0].lastName + "." + userInfo[0].name + "\n\n"
                const englishOptions = {
                    from: ADMIN_EMAIL,
                    to: userInfo[0].email,
                    subject: 'Special Coupon Information of「FURUOKADRUG」until ' + req.body.validTo,
                    text: userName + englishMessage
                };

                await sendMailProcess(englishOptions);
            }
            // 사용자의 언어가 중국어인 경우
            if (userInfo[0].language === "cn") {
                // 메일본문 설정
                let chineseMessage = "感谢你一直以来使用 【古冈药妆】。\n";
                chineseMessage += "这是一封限定优惠活动的邮件，为只有收到这封邮件的客户专门提供的一个特别活动。\n\n"
                chineseMessage += "从 「" + req.body.validFrom + "」到「" + req.body.validTo + "」的特别优惠券信息\n";
                chineseMessage += "【优惠券内容】\n";
                // 쿠폰종류 설정
                let tmpKey = "";
                SaleType.map(item => {
                    if (item.key === req.body.type) {
                        tmpKey = item.key; 
                        chineseMessage += " ・优惠券类型: " + item.value + "\n";
                    }
                })
                // 쿠폰종류에 따른 할인율 단위
                chineseMessage += " ・优惠券折扣: " + req.body.amount
                if (tmpKey === "0") chineseMessage += "%\n";
                if (tmpKey === "1") chineseMessage += "(point)\n";
                if (tmpKey === "2") chineseMessage += "(JPY)\n";
                // 카테고리
                MAIN_CATEGORY.map(item => {
                    if (item.key === Number(req.body.item)) {
                        chineseMessage += " ・可用类别: " + item.value + "\n";
                    }
                })
                // 상품정보 가져오기
                if (req.body.productId !== "") {
                    const productInfo = await Product.find({ "_id": req.body.productId });
                    chineseMessage += " ・产品: " + productInfo[0].title + "\n";
                }
                // 세일과 함께 사용유무
                UseWithSale.map(item => {
                    if (item.key === req.body.useWithSale) {
                        chineseMessage += " ・与折扣一起使用: " + item.value + "\n";
                    }
                })
                // 쿠폰 사용회수
                if (req.body.count === "") {
                    chineseMessage += " ・使用次数: 无限\n\n";
                } else {
                    chineseMessage += " ・使用次数: " + req.body.count + "\n\n";
                }
                
                chineseMessage += "【优惠截止日期】\n";
                chineseMessage += req.body.validFrom + " ～ " + req.body.validTo + "\n\n";
                chineseMessage += "【优惠券代码】\n";
                chineseMessage += " ・代码: " + req.body.code + "\n\n";
                chineseMessage += "这是一个限时优惠。 请抓住这个机会。"

                // 사용자 메일전송
                const userName = "亲爱的" + userInfo[0].lastName + " " + userInfo[0].name + "\n\n"
                const chineseOptions = {
                    from: ADMIN_EMAIL,
                    to: userInfo[0].email,
                    subject: '【古冈药妆】特别优惠券活动至' + req.body.validTo + '为止',
                    text: userName + chineseMessage
                };

                await sendMailProcess(chineseOptions);
            }
        } else {
            // 논리삭제가 되지않은 모든 일반 사용자에게 메일 전송
            const userInfos = await User.find({ "password": {$exists: true}, "deletedAt": null , "role": 0 });
            for (let i=0; i<userInfos.length; i++) {
                // 사용자의 언어가 일본어인 경우
                if (userInfos[i].language === "jp") {
                    const userName = userInfos[i].lastName + " " + userInfos[i].name + "様\n\n"
                    // 사용자 메일전송
                    const japaneseOptions = {
                        from: ADMIN_EMAIL,
                        to: userInfos[i].email,
                        subject: '「FURUOKADRUG」特別のセール案内 ' + req.body.validTo + 'まで',
                        text: userName + japaneseMessage
                    };

                    await sendMailProcess(japaneseOptions);
                }
                // 사용자의 언어가 영어인 경우
                if (userInfos[i].language === "en") {
                    // 메일본문 설정
                    let englishMessage = "Thank you for your continued use of「FURUOKADRUG」.\n";
                    englishMessage += "We are pleased to announce a special campaign only for customers who have received this e-mail.\n\n"
                    englishMessage += "Special Coupon Information from「" + req.body.validFrom + "」to「" + req.body.validTo + "」\n";
                    englishMessage += "【Coupon details】\n";
                    // 쿠폰종류 설정
                    let tmpKey = "";
                    CouponType.map(item => {
                        if (item.key === req.body.type) {
                            tmpKey = item.key; 
                            englishMessage += " ・Coupon Type: " + item.value + "\n";
                        }
                    })
                    // 쿠폰종류에 따른 할인율 단위
                    englishMessage += " ・Coupon Discount: " + req.body.amount
                    if (tmpKey === "0") englishMessage += "%\n";
                    if (tmpKey === "1") englishMessage += "(point)\n";
                    if (tmpKey === "2") englishMessage += "(JPY)\n";
                    // 카테고리
                    MAIN_CATEGORY.map(item => {
                        if (item.key === Number(req.body.item)) {
                            englishMessage += " ・Category: " + item.value + "\n";
                        }
                    })
                    // 상품정보 가져오기
                    if (req.body.productId !== "") {
                        const productInfo = await Product.find({ "_id": req.body.productId });
                        englishMessage += " ・Product: " + productInfo[0].title + "\n";
                    }
                    // 세일과 함께 사용유무
                    UseWithSale.map(item => {
                        if (item.key === req.body.useWithSale) {
                            englishMessage += " ・Use with sale: " + item.value + "\n";
                        }
                    })
                    // 쿠폰 사용회수
                    if (req.body.count === "") {
                        englishMessage += " ・Number of uses: Unlimited\n\n";
                    } else {
                        englishMessage += " ・Number of uses: " + req.body.count + "\n\n";
                    }
                    englishMessage += "【Coupon Expiration Date】\n";
                    englishMessage += req.body.validFrom + " ～ " + req.body.validTo + "\n\n";
                    englishMessage += "【Coupon code】\n";
                    englishMessage += " ・Code: " + req.body.code + "\n\n";
                    englishMessage += "This is a limited time offer. Please take advantage of this opportunity."

                    // 사용자 메일전송
                    const userName = "Hi " + userInfos[i].lastName + "." + userInfos[i].name + "\n\n"
                    const englishOptions = {
                        from: ADMIN_EMAIL,
                        to: userInfos[i].email,
                        subject: 'Special Coupon Information of「FURUOKADRUG」until ' + req.body.validTo,
                        text: userName + englishMessage
                    };

                    await sendMailProcess(englishOptions);
                }
                // 사용자의 언어가 중국어인 경우
                if (userInfos[i].language === "cn") {
                    // 메일본문 설정
                    let chineseMessage = "感谢你一直以来使用 【古冈药妆】。\n";
                    chineseMessage += "这是一封限定优惠活动的邮件，为只有收到这封邮件的客户专门提供的一个特别活动。\n\n"
                    chineseMessage += "从 「" + req.body.validFrom + "」到「" + req.body.validTo + "」的特别优惠券信息\n";
                    chineseMessage += "【优惠券内容】\n";
                    // 쿠폰종류 설정
                    let tmpKey = "";
                    SaleType.map(item => {
                        if (item.key === req.body.type) {
                            tmpKey = item.key; 
                            chineseMessage += " ・优惠券类型: " + item.value + "\n";
                        }
                    })
                    // 쿠폰종류에 따른 할인율 단위
                    chineseMessage += " ・优惠券折扣: " + req.body.amount
                    if (tmpKey === "0") chineseMessage += "%\n";
                    if (tmpKey === "1") chineseMessage += "(point)\n";
                    if (tmpKey === "2") chineseMessage += "(JPY)\n";
                    // 카테고리
                    MAIN_CATEGORY.map(item => {
                        if (item.key === Number(req.body.item)) {
                            chineseMessage += " ・可用类别: " + item.value + "\n";
                        }
                    })
                    // 상품정보 가져오기
                    if (req.body.productId !== "") {
                        const productInfo = await Product.find({ "_id": req.body.productId });
                        chineseMessage += " ・产品: " + productInfo[0].title + "\n";
                    }
                    // 세일과 함께 사용유무
                    UseWithSale.map(item => {
                        if (item.key === req.body.useWithSale) {
                            chineseMessage += " ・与折扣一起使用: " + item.value + "\n";
                        }
                    })
                    // 쿠폰 사용회수
                    if (req.body.count === "") {
                        chineseMessage += " ・使用次数: 無制限\n\n";
                    } else {
                        chineseMessage += " ・使用次数: " + req.body.count + "\n\n";
                    }
                    chineseMessage += "【优惠截止日期】\n";
                    chineseMessage += req.body.validFrom + " ～ " + req.body.validTo + "\n\n";
                    chineseMessage += "【优惠券代码】\n";
                    chineseMessage += " ・代码: " + req.body.code + "\n\n";
                    chineseMessage += "这是一个限时优惠。 请抓住这个机会。"

                    // 사용자 메일전송
                    const userName = "亲爱的" + userInfos[i].lastName + " " + userInfos[i].name + "\n\n"
                    const chineseOptions = {
                        from: ADMIN_EMAIL,
                        to: userInfos[i].email,
                        subject: '【古冈药妆】特别优惠券活动至' + req.body.validTo + '为止',
                        text: userName + chineseMessage
                    };

                    await sendMailProcess(chineseOptions);
                }
            }
        }
    } catch (err) {
        console.log("Coupon send mail err:", err);
    }
});

// 쿠폰 수정시 관리자에게 메일
router.post("/coupon/admin", async (req, res) => {
    try {
        // 메일내용 설정
        let japaneseMessage = "いつも「FURUOKADRUG」をご利用いただき、ありがとうございます。\n";
        japaneseMessage += "このメールを受け取られたお客様限定でキャンペーンをご案内させて頂いております。\n\n"
        japaneseMessage += "「" + req.body.validFrom + "」から「" + req.body.validTo + "」までの特別クーポンのご案内\n";
        japaneseMessage += "【クーポンの内容】\n";
        // 쿠폰종류 설정
        let tmpKey = "";
        CouponType.map(item => {
            if (item.key === req.body.type) {
                tmpKey = item.key; 
                japaneseMessage += " ・クーポン種類: " + item.value + "\n";
            }
        })
        // 쿠폰종류에 따른 할인율 단위
        japaneseMessage += " ・クーポン割引: " + req.body.amount
        if (tmpKey === "0") japaneseMessage += "%\n";
        if (tmpKey === "1") japaneseMessage += "(point)\n";
        if (tmpKey === "2") japaneseMessage += "(JPY)\n";
        // 카테고리
        MAIN_CATEGORY.map(item => {
            if (item.key === Number(req.body.item)) {
                japaneseMessage += " ・カテゴリ: " + item.value + "\n";
            }
        })
        // 상품정보 가져오기
        if (req.body.productId !== "") {
            const productInfo = await Product.find({ "_id": req.body.productId });
            japaneseMessage += " ・対象商品: " + productInfo[0].title + "\n";
        }
        // 세일과 함께 사용유무
        UseWithSale.map(item => {
            if (item.key === req.body.useWithSale) {
                japaneseMessage += " ・セール併用: " + item.value + "\n";
            }
        })
        // 쿠폰 사용회수
        if (req.body.count === "") {
            japaneseMessage += " ・使用次数: 無制限\n\n";
        } else {
            japaneseMessage += " ・使用次数: " + req.body.count + "\n\n";
        }
        japaneseMessage += "【クーポン有効期限】: " + req.body.validFrom + " ～ " + req.body.validTo + "\n\n";
        japaneseMessage += "【クーポンコード】: " + req.body.code + "\n\n";
        japaneseMessage += "【メール送信有無】: " + req.body.sendMail + "\n\n";

        // 관리자 메일 전송
        const adminName = "管理者様\n\n";
        
        // 쿠폰등록인 경우
        let adminMessage = "";
        if (req.body.mod === "reg") {
            adminMessage = "";
        } else if (req.body.mod === "modify") {
            // 세일수정인 경우
            let tmpActive = '';
            if (req.body.active === '1') {
                tmpActive = '「使用可」'
            } else {
                tmpActive = '「使用不可」'
            }
            adminMessage = "下記のセールを" + tmpActive + "に修正しました\n\n";
        }

        // 관리자 메일 전송
        let adminOptions = {
            from: ADMIN_EMAIL,
            to: ADMIN_EMAIL,
            subject: '【クーポン修正のお知らせ】「FURUOKADRUG」特別のクーポン案内 ' + req.body.validTo + 'まで',
            text: adminName + adminMessage + japaneseMessage
        };
        await sendMailProcess(adminOptions);
    } catch (err) {
        console.log(err);
    }
});

// 생일자 쿠폰 등록시 관리자에게 메일
router.post("/coupon/birth/admin", async (req, res) => {
    try {
        // 메일내용 설정
        let japaneseMessage = "いつも「FURUOKADRUG」をご利用いただき、ありがとうございます。\n";
        japaneseMessage += "このメールを受け取られたお客様限定でキャンペーンをご案内させて頂いております。\n\n"
        japaneseMessage += "誕生日クーポンのご案内\n";
        japaneseMessage += "【クーポンの内容】\n";
        // 쿠폰종류 설정
        let tmpKey = "";
        CouponType.map(item => {
            if (item.key === req.body.type) {
                tmpKey = item.key; 
                japaneseMessage += " ・クーポン種類: " + item.value + "\n";
            }
        })
        // 쿠폰종류에 따른 할인율 단위
        japaneseMessage += " ・クーポン割引: " + req.body.amount
        if (tmpKey === "0") japaneseMessage += "%\n";
        if (tmpKey === "1") japaneseMessage += "(point)\n";
        if (tmpKey === "2") japaneseMessage += "(JPY)\n";
        // 카테고리
        MAIN_CATEGORY.map(item => {
            if (item.key === Number(req.body.item)) {
                japaneseMessage += " ・カテゴリ: " + item.value + "\n";
            }
        })
        // 상품정보 가져오기
        if (req.body.productId !== "") {
            const productInfo = await Product.find({ "_id": req.body.productId });
            japaneseMessage += " ・対象商品: " + productInfo[0].title + "\n";
        }
        // 세일과 함께 사용유무
        UseWithSale.map(item => {
            if (item.key === req.body.useWithSale) {
                japaneseMessage += " ・セール併用: " + item.value + "\n";
            }
        })
        // 쿠폰 사용회수
        japaneseMessage += " ・使用次数: " + req.body.count + "\n\n";
        japaneseMessage += "【クーポン有効期限】: " + "誕生日" + req.body.beforeBirthday + "前 ～ 誕生日"+ req.body.afterBirthday + "まで\n\n";
        japaneseMessage += "【クーポンコード】: " + req.body.code + "\n\n";
        japaneseMessage += "【メール送信有無】: " + req.body.sendMail + "\n\n";

        // 관리자 메일 전송
        const adminName = "管理者様\n\n";

        // 관리자 메일 전송
        let adminOptions = {
            from: ADMIN_EMAIL,
            to: ADMIN_EMAIL,
            subject: '「FURUOKADRUG」誕生日のクーポン案内 ',
            text: adminName + japaneseMessage
        };
        await sendMailProcess(adminOptions);
    } catch (err) {
        console.log(err);
    }
});

// 세일등록시 메일송신(모든 사용자 및 관리자)
router.post("/sale", async (req, res) => {
    try {
        // 메일본문 설정
        let japaneseMessage = "いつも「FURUOKADRUG」をご利用いただき、ありがとうございます。\n";
        japaneseMessage += "このメールを受け取られたお客様限定でキャンペーンをご案内させて頂いております。\n\n"
        japaneseMessage += "「" + req.body.validFrom + "」から「" + req.body.validTo + "」までの特別セールのご案内\n";
        japaneseMessage += "【セール内容】\n";
        // 세일종류 설정
        let tmpKey = "";
        SaleType.map(item => {
            if (item.key === req.body.type) {
                tmpKey = item.key; 
                japaneseMessage += " ・セール種類: " + item.value + "\n";
            }
        })
        // 세일종류에 따른 할인율 단위
        japaneseMessage += " ・セール割引: " + req.body.amount
        if (tmpKey === "0") japaneseMessage += "%\n";
        if (tmpKey === "1") japaneseMessage += "(point)\n";
        if (tmpKey === "2") japaneseMessage += "(JPY)\n";
        // 카테고리
        MAIN_CATEGORY.map(item => {
            if (item.key === Number(req.body.item)) {
                japaneseMessage += " ・カテゴリ: " + item.value + "\n";
            }
        })
        // 상품정보 가져오기
        if (req.body.productId !== "") {
            const productInfo = await Product.find({ "_id": req.body.productId });
            japaneseMessage += " ・対象商品: " + productInfo[0].title + "\n\n";
        } else {
            japaneseMessage += "\n";
        }
        // 관리자 커멘트
        if (req.body.jpMailComment !== "") {
            japaneseMessage += "【管理者コメント】\n";
            japaneseMessage += req.body.jpMailComment + "\n\n";
        }
        japaneseMessage += "【セール有効期限】\n";
        japaneseMessage += req.body.validFrom + " ～ " + req.body.validTo + "\n\n";
        japaneseMessage += "期間限定のセールとなります。是非この機会にご利用ください。"

        // 관리자 메일전송
        const adminName = "管理者様\n\n";

        // 세일등록인 경우
        let adminMessage = "";
        if (req.body.mod === "reg") {
            adminMessage = "";
        } else if (req.body.mod === "modify") {
            // 세일수정인 경우
            let tmpActive = '';
            if (req.body.active === '1') {
                tmpActive = '「使用可」'
            } else {
                tmpActive = '「使用不可」'
            }
            adminMessage = "下記のセールを" + tmpActive + "に修正しました\n\n";
        }

        let adminOptions = {
            from: ADMIN_EMAIL,
            to: ADMIN_EMAIL,
            subject: '「FURUOKADRUG」特別のセール案内 ' + req.body.validTo + 'まで',
            text: adminName + adminMessage + japaneseMessage
        };
        await sendMailProcess(adminOptions);
        
        // 논리삭제가 되지않은 모든 일반 사용자에게 메일 전송
        const userInfos = await User.find({ "password": {$exists: true}, "deletedAt": null , "role": 0 });

        for (let i=0; i<userInfos.length; i++) {
            // 사용자의 언어가 일본어인 경우
            if (userInfos[i].language === "jp") {
                const userName = userInfos[i].lastName + " " + userInfos[i].name + "様\n\n"
                // 사용자 메일전송
                const japaneseOptions = {
                    from: ADMIN_EMAIL,
                    to: userInfos[i].email,
                    subject: '「FURUOKADRUG」特別のセール案内 ' + req.body.validTo + 'まで',
                    text: userName + japaneseMessage
                };
                await sendMailProcess(japaneseOptions);
            }

            // 사용자의 언어가 영어인 경우
            if (userInfos[i].language === "en") {
                // 메일본문 설정
                let englishMessage = "Thank you for your continued use of「FURUOKADRUG」.\n";
                englishMessage += "We are pleased to announce a special campaign only for customers who have received this e-mail.\n\n"
                englishMessage += "Special Sale Information from「" + req.body.validFrom + "」to「" + req.body.validTo + "」\n";
                englishMessage += "【Sale details】\n";
                // 세일종류 설정
                let tmpKey = "";
                SaleType.map(item => {
                    if (item.key === req.body.type) {
                        tmpKey = item.key; 
                        englishMessage += " ・Sale Type: " + item.value + "\n";
                    }
                })
                // 세일종류에 따른 할인율 단위
                englishMessage += " ・Sale Discount: " + req.body.amount
                if (tmpKey === "0") englishMessage += "%\n";
                if (tmpKey === "1") englishMessage += "(point)\n";
                if (tmpKey === "2") englishMessage += "(JPY)\n";
                // 카테고리
                MAIN_CATEGORY.map(item => {
                    if (item.key === Number(req.body.item)) {
                        englishMessage += " ・Category: " + item.value + "\n";
                    }
                })
                // 상품정보 가져오기
                if (req.body.productId !== "") {
                    const productInfo = await Product.find({ "_id": req.body.productId });
                    englishMessage += " ・Product: " + productInfo[0].title + "\n\n";
                } else {
                    englishMessage += "\n";
                }
                // 관리자 커멘트
                if (req.body.enMailComment !== "") {
                    englishMessage += "【Administrator's Comment】\n";
                    englishMessage += req.body.enMailComment + "\n\n";
                }
                englishMessage += "【Sale Expiration Date】\n";
                englishMessage += req.body.validFrom + " ～ " + req.body.validTo + "\n\n";
                englishMessage += "This is a limited time offer. Please take advantage of this opportunity."

                // 사용자 이름
                const userName = "Hi " + userInfos[i].lastName + "." + userInfos[i].name + "\n\n"
                // 사용자 메일전송
                const englishOptions = {
                    from: ADMIN_EMAIL,
                    to: userInfos[i].email,
                    subject: 'Sale Information of「FURUOKADRUG」Special until ' + req.body.validTo,
                    text: userName + englishMessage
                };
                
                await sendMailProcess(englishOptions);
            }

            // 사용자의 언어가 중국어인 경우
            if (userInfos[i].language === "cn") {
                // 메일본문 설정
                let chineseMessage = "感谢你一直以来使用 【古冈药妆】。\n";
                chineseMessage += "这是一封限定优惠活动的邮件，为只有收到这封邮件的客户专门提供的一个特别活动。\n\n"
                chineseMessage += "从 「" + req.body.validFrom + "」到「" + req.body.validTo + "」的特别优惠券信息\n";
                chineseMessage += "【优惠内容】\n";
                // 세일종류 설정
                let tmpKey = "";
                SaleType.map(item => {
                    if (item.key === req.body.type) {
                        tmpKey = item.key; 
                        chineseMessage += " ・优惠种类: " + item.value + "\n";
                    }
                })
                // 세일종류에 따른 할인율 단위
                chineseMessage += " ・优惠折扣: " + req.body.amount
                if (tmpKey === "0") chineseMessage += "%\n";
                if (tmpKey === "1") chineseMessage += "(point)\n";
                if (tmpKey === "2") chineseMessage += "(JPY)\n";
                // 카테고리
                MAIN_CATEGORY.map(item => {
                    if (item.key === Number(req.body.item)) {
                        chineseMessage += " ・可用类别: " + item.value + "\n";
                    }
                })
                // 상품정보 가져오기
                if (req.body.productId !== "") {
                    const productInfo = await Product.find({ "_id": req.body.productId });
                    chineseMessage += " ・产品: " + productInfo[0].title + "\n\n";
                } else {
                    chineseMessage += "\n";
                }
                // 관리자 커멘트
                if (req.body.cnMailComment !== "") {
                    chineseMessage += "【管理员评论】\n";
                    chineseMessage += req.body.cnMailComment + "\n\n";
                }
                chineseMessage += "【优惠截止日期】\n";
                chineseMessage += req.body.validFrom + " ～ " + req.body.validTo + "\n\n";
                chineseMessage += "这是一个限时优惠。 请抓住这个机会。"

                // 사용자 이름
                const userName = "亲爱的" + userInfos[i].lastName + " " + userInfos[i].name + "\n\n"
                // 사용자 메일전송
                const chineseOptions = {
                    from: ADMIN_EMAIL,
                    to: userInfos[i].email,
                    subject: '【古冈药妆】特别优惠券活动至' + req.body.validTo + '为止',
                    text: userName + chineseMessage
                };

                await sendMailProcess(chineseOptions);
            }
        }
    } catch (err) {
        console.log("Sale registration failed: ", err);
    }
});

// 세일등록시 세일제외 정보인 경우 관리자에게 메일전송
router.post("/saleExcept", async (req, res) => {
    try {
        let adminMessage = "「" + req.body.validFrom + "」から「" + req.body.validTo + "」までのセール対象外情報の案内\n";
        adminMessage += "【セール対象外の内容】\n";
        // 세일종류 설정
        let tmpKey = "";
        SaleType.map(item => {
            if (item.key === req.body.type) {
                tmpKey = item.key; 
                adminMessage += " ・セール種類: " + item.value + "\n";
            }
        })
        // 카테고리
        MAIN_CATEGORY.map(item => {
            if (item.key === Number(req.body.item)) {
                adminMessage += " ・カテゴリ: " + item.value + "\n";
            }
        })
        // 상품정보 가져오기
        if (req.body.productId !== "") {
            const productInfo = await Product.find({ "_id": req.body.productId });
            adminMessage += " ・対象商品: " + productInfo[0].title + "\n";
        } else {
            adminMessage += "\n";
        }
        adminMessage += "【セール有効期限】: " + req.body.validFrom + " ～ " + req.body.validTo + "\n\n";
        adminMessage += "【セールコード】: " + req.body.code + "\n\n";

        // 관리자 메일전송
        const adminName = "管理者様\n\n";
        let adminOptions = {
            from: ADMIN_EMAIL,
            to: ADMIN_EMAIL,
            subject: '「FURUOKADRUG」セール対象外の案内 ' + req.body.validTo + 'まで',
            text: adminName + adminMessage
        };
        await sendMailProcess(adminOptions);
        
        
    } catch (err) {
        console.log(err);
    }
});

// 세일 수정시 관리자에게 메일
router.post("/sale/admin", async (req, res) => {
    try {
        // 메일내용 설정
        let japaneseMessage = "いつも「FURUOKADRUG」をご利用いただき、ありがとうございます。\n";
        japaneseMessage += "このメールを受け取られたお客様限定でキャンペーンをご案内させて頂いております。\n\n"
        japaneseMessage += "「" + req.body.validFrom + "」から「" + req.body.validTo + "」までの特別セールのご案内\n";
        japaneseMessage += "【セールの内容】\n";
        
        // 세일종류 설정
        let tmpKey = "";
        CouponType.map(item => {
            if (item.key === req.body.type) {
                tmpKey = item.key; 
                japaneseMessage += " ・セール種類: " + item.value + "\n";
            }
        })
        // 쿠폰종류에 따른 할인율 단위
        if (req.body.amount !== "") {
            japaneseMessage += " ・セール割引: " + req.body.amount
            if (tmpKey === "0") japaneseMessage += "%\n";
            if (tmpKey === "1") japaneseMessage += "(point)\n";
            if (tmpKey === "2") japaneseMessage += "(JPY)\n";
        }
        // 카테고리
        MAIN_CATEGORY.map(item => {
            if (item.key === Number(req.body.item)) {
                japaneseMessage += " ・カテゴリ: " + item.value + "\n";
            }
        })
        // 상품정보 가져오기
        if (req.body.productId !== "") {
            const productInfo = await Product.find({ "_id": req.body.productId });
            japaneseMessage += " ・対象商品: " + productInfo[0].title + "\n\n";
        } else {
            japaneseMessage += "\n";
        }
        // 관리자 커멘트
        japaneseMessage += "【管理者コメント】\n";
        if (req.body.jpMailComment !== "") {
            japaneseMessage += " ・日本語: " + req.body.jpMailComment + "\n";
        } 
        if (req.body.enMailComment !== "") {
            japaneseMessage += " ・英語: " + req.body.enMailComment + "\n";
        }
        if (req.body.cnMailComment !== "") {
            japaneseMessage += " ・中国語: " + req.body.cnMailComment + "\n\n";
        }
        japaneseMessage += "【セール有効期限】: " + req.body.validFrom + " ～ " + req.body.validTo + "\n\n";
        japaneseMessage += "【セールコード】: " + req.body.code + "\n\n";
        japaneseMessage += "【メール送信有無】: " + req.body.sendMail + "\n\n";

        // 관리자 메일전송
        const adminName = "管理者様\n\n"
        // 세일등록인 경우
        let adminMessage = "";
        if (req.body.mod === "reg") {
            adminMessage = "";
        } else if (req.body.mod === "modify") {
            // 세일수정인 경우
            let tmpActive = '';
            if (req.body.active === '1') {
                tmpActive = '「使用可」'
            } else {
                tmpActive = '「使用不可」'
            }
            adminMessage = "下記のセールを" + tmpActive + "に修正しました\n\n";
        }

        // 관리자 메일 전송
        let adminOptions = {
            from: ADMIN_EMAIL,
            to: ADMIN_EMAIL,
            subject: '【セール修正のお知らせ】「FURUOKADRUG」特別のセール案内 ' + req.body.validTo + 'まで',
            text: adminName + adminMessage + japaneseMessage
        };
        await sendMailProcess(adminOptions);
    } catch (err) {
        console.log(err);
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