const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const config = require("./config/key");
const mongoose = require("mongoose");
const connect = mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

const { Mail } = require("./models/Mail");
const { ADMIN_EMAIL } = require('./config/config');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// CORS 설정
const cors = require('cors')
app.use(cors({ origin: true, credentials: true }));

// 배치실행 관련 설정
const { User } = require("./models/User");
const { TmpOrder } = require("./models/TmpOrder");
const { TmpPayment } = require("./models/TmpPayment");
const schedule = require('node-schedule');
const nodemailer = require("nodemailer");

/* *    *    *    *    *    * */
// ┬    ┬    ┬    ┬    ┬    ┬
// │    │    │    │    │    │
// │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
// │    │    │    │    └───── month (1 - 12)
// │    │    │    └────────── day of month (1 - 31)
// │    │    └─────────────── hour (0 - 23)
// │    └──────────────────── minute (0 - 59)
// └───────────────────────── second (0 - 59, OPTIONAL)

// 임시 사용자 삭제
// 매일 24시
const rule1 = new schedule.RecurrenceRule();
rule1.hour = 0
rule1.minute = 0
rule1.tz = 'Asia/Tokyo'

schedule.scheduleJob(rule1, function() {
  let startToday = new Date();
  let startTime = startToday.toLocaleString('ja-JP');
  console.log("-------------------------------------------");
  console.log("Delete temporary users start :", startTime);
  console.log("-------------------------------------------");

  // 임시 사용자 정보 가져오기
  User.find({ role: 0 })
  .exec((err, userInfos) => {
    if (err) {
      console.log("Temporary user deletion batch processing failed: ", err);
      return;
    }

    if (userInfos.length > 0) {
      for (let i=0; i < userInfos.length; i++) {
        // 비밀번호가 설정안된 사용자 정보
        if(!userInfos[i].password) {
          let orgDate = new Date(userInfos[i].createdAt);
          let curDate = new Date();

          // DB저장시간에서 한시간후의 시간을 구한다
          let chgDate = new Date(Date.parse(orgDate) + 1000 * 60 * 60);

          // 임시사용자 메일 수신후 1시간이상 경과 확인
          if (curDate > chgDate) {
            // 임시사용자 삭제
            User.remove({ _id: userInfos[i]._id })
            .exec((err, tmpUserInfo) => {
              if (err) console.log("Temporary user deletion batch processing failed: ", err);
              console.log("Deleted temporary user information: ", tmpUserInfo);
            })
          }
        }
      }
      
    }
  })

  let endToday = new Date();
  let endTime = endToday.toLocaleString('ja-JP');
  console.log("-------------------------------------------");
  console.log("Delete temporary users end :", endTime);
  console.log("-------------------------------------------");
});

// 임시 결제정보 및 임시 주문정보 삭제
// 매일 24시
const rule2 = new schedule.RecurrenceRule();
rule2.hour = 0
rule2.minute = 0
rule2.tz = 'Asia/Tokyo'

schedule.scheduleJob(rule2, function() {
  let startToday = new Date();
  let startTime = startToday.toLocaleString('ja-JP');
  console.log("-------------------------------------------");
  console.log("Temporary payment and temporary order information deletion start :", startTime);
  console.log("-------------------------------------------");

  // 임시 주문정보 가져오기
  TmpOrder.find({})
  .exec((err, tmpOrderInfos) => {
    if (err) {
      console.log("Temporary order deletion batch processing failed: ", err);
      return;
    }

    if (tmpOrderInfos.length > 0) {
      for (let i=0; i < tmpOrderInfos.length; i++) {
        let orgDate = new Date(tmpOrderInfos[i].createdAt);
        let curDate = new Date();

        // DB저장시간에서 24시간후의 시간을 구한다
        let chgDate = new Date(Date.parse(orgDate) + 1 + 1000 * 60 * 60 * 24);

        // 임시주문정보 저장후 1시간이상 경과여부 확인
        if (curDate > chgDate) {
          // 임시주문정보 삭제
          TmpOrder.remove({ _id: tmpOrderInfos[i]._id })
          .exec((err, tmpOrderInfo) => {
            if (err) console.log("Temporary order deletion batch processing failed: ", err);
            console.log("Deleted temporary order information: ", tmpOrderInfo);
          })
        }
      }
    }
  })

  // 임시 주문정보취득
  TmpPayment.find({})
  .exec((err, tmpPaymentInfos) => {
    if (err) console.log("Temporary payment deletion batch processing failed: ", err);

    console.log("tmpPaymentInfos: ", tmpPaymentInfos);
    if (tmpPaymentInfos.length > 0) {
      for (let i=0; i < tmpPaymentInfos.length; i++) {
        let orgDate = new Date(tmpPaymentInfos[i].createdAt);
        let curDate = new Date();

        // DB저장시간에서 한시간후의 시간을 구한다
        let chgDate = new Date(Date.parse(orgDate) + 1000 * 60 * 60);

        // 임시결제정보 저장후 1시간이상 경과여부 확인
        if (curDate > chgDate) {
            // 임시결제정보 삭제
            TmpPayment.remove({ _id: tmpPaymentInfos[i]._id })
            .exec((err, tmpPaymentInfo) => {
              if (err) console.log("Temporary payment deletion batch processing failed: ", err);
              console.log("Deleted temporary payment information: ", tmpPaymentInfo);
            })
        }
      }
    }
  })

  let endToday = new Date();
  let endTime = endToday.toLocaleString('ja-JP');
  console.log("-------------------------------------------");
  console.log("Temporary payment and temporary order information deletion end :", endTime);
  console.log("-------------------------------------------");
});

// 사용자 취득(3달동안 로그인하지 않은 사용자)
// 매월 1일 아침 6시
const rule3 = new schedule.RecurrenceRule();
rule3.date = 1
rule2.hour = 0
rule2.minute = 0
rule2.tz = 'Asia/Tokyo'

schedule.scheduleJob(rule3, function() {
  // 3달전 일자 취득
  let now = new Date();
  let threeMonthsAgo = new Date(now.setMonth(now.getMonth() - 3)).toISOString();

  // 사용자 정보취득
  User.find({"lastLogin": {$lte: new Date(threeMonthsAgo)}, role: 0})
  .exec((err, userInfos) => {
    if (err) console.log("Failed to search for users who have not logged in for 3 months ", err);
    
    if (userInfos.length > 0) {        
      for (let i=0; i < userInfos.length; i++) {
        // if(!userInfos[i].createdAt) {
        //   continue;
        // }
        // if (userInfos[i].createdAt === "") {
        //   continue;
        // }

        // 메일설정 및 본문작성(논리삭제 사용자는 메일전송하지 않음)
        if (!userInfos[i].deletedAt) {
          let message = userInfos[i].name + " " + userInfos[i].lastName + "様\n\n"
          message = message + "ご来訪いただきますよう、何卒よろしくお願いいたします。";

          const body = {
            type: "Batch",
            subject: "お知らせします。",
            from: ADMIN_EMAIL,
            to: userInfos[i].email,
            message: message
          }
          // 메일송신
          sendEmail(body);
        }
      }
    }
  })
});

// 메일 송신
async function sendEmail(data) {
  // AWS SES 접근 보안키
  process.env.AWS_ACCESS_KEY_ID = sesConfig.accessKeyId;
  process.env.AWS_SECRET_ACCESS_KEY = sesConfig.secretAccessKey;
  const ses = new AWS.SES({
      apiVersion: "2010-12-01",
      region: "ap-northeast-1", 
  });
  const transporter = nodemailer.createTransport({ SES: ses, AWS });

  try {
    // 메일설정
    let mailOptions = {
      from: data.from,
      to: data.to,
      subject: data.subject,
      text: data.message
    };

    // 메일송신
    await transporter.sendMail(mailOptions);

    // 메일등록
    const body = {
      type: body.type,
      from: body.from,
      to: body.to,
      subject: body.subject,
      message: body.message,
    }
    
    const mail = new Mail(body);
    await mail.save((err, doc) => {
      if (err) {
        console.log("Failed to send batch mail: ", err);
        return false;
      }
      return true;
    });
  } catch (err) {
    console.log("Failed to send batch mail: ", err);
  }
};

// 아래 주소로 오면 해당 라우터로 가라는 지정
app.use('/api/users', require('./routes/users'));
app.use('/api/product', require('./routes/product'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/csv', require('./routes/csv'));
app.use('/api/sendmail', require('./routes/sendmail'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/order', require('./routes/order'));
app.use('/api/coupon', require('./routes/coupon'));
app.use('/api/point', require('./routes/point'));
app.use('/uploads', express.static('uploads'));

if (process.env.NODE_ENV === "production") {
  // 모든 자바스크립트와 css 파일 같은 static한 파일들은 이 폴더에서 처리한다고 지정
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
  });
}

const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`Server Listening on ${port}`)
});