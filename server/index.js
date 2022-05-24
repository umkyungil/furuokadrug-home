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


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// CORS 설정
const cors = require('cors')
app.use(cors({ origin: true, credentials: true }));

// 배치실행 관련 설정
const { User } = require("./models/User");
const schedule = require('node-schedule');
const nodemailer = require("nodemailer");
const nodeConfig = require("./config/mailConfig");

// 사용자 취득(3달동안 로그인하지 않은 사용자)
// 배치 실행(5초 간격)
// schedule.scheduleJob("5 * * * * *", function() {
//   // 3달전 일자 취득
//   let now = new Date();
//   let oneMonthAgo = new Date(now.setMonth(now.getMonth() - 2)).toISOString();
  
//   // 사용자 정보취득
//   User.find({"lastLogin": {$lte: new Date(oneMonthAgo)}, role: 0})
//     .exec((err, userInfos) => {
//       if (err) console.log("error: ", err);
      
//       if (userInfos.length > 0) {        
//         for (let i=0; i < userInfos.length; i++) {
//           // 메일설정 및 본문작성
//           let message = userInfos[i].name + " " + userInfos[i].lastName + "様\n"
//           message = message + "ご来訪いただきますよう、何卒よろしくお願いいたします。";

//           const body = {
//             type: "Batch",
//             subject: "お知らせ",
//             from: "umkyungil@hirosophy.co.jp", // email
//             to: "umkyungil@hirosophy.co.jp", // userInfos[i].email,
//             message: message
//           }
//           // 메일송신
//           sendEmail(body);
//         }
//       }
//     })  
// });

// 메일 송신
function sendEmail(body) {
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
      from: body.from,
      to: body.to ,
      subject: body.subject,
      text: body.message
  };

  transporter.sendMail(mailOptions, function(err, info){
    try {
      if (err) {
          console.log("batch email error: ", err);
      } else {
        // 메일 전송 성공시 메일정보 등록
        const body = {
            type: body.type,
            subject: body.subject,
            to: body.to,
            from: body.from,
            message: body.message,
        }

        const mail = new Mail(body);
        mail.save((err, doc) => {
            if (err) {
                console.log("batch email error: ", err);
            }
            console.log("batch email success");
        });
      }
    } catch(err) {
      console.log("notice email error: ", err);
    }
  });
};

// 아래 주소로 오면 해당 라우터로 가라는 지정
app.use('/api/users', require('./routes/users'));
app.use('/api/product', require('./routes/product'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/csv', require('./routes/csv'));
app.use('/api/sendmail', require('./routes/sendmail'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/order', require('./routes/order'));
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