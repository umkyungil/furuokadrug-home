const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const config = require("./config/key");
const mongoose = require("mongoose");
const AWS = require('aws-sdk');
const { Mail } = require("./models/Mail");
const { ADMIN_EMAIL } = require("./config/url");
const { SES_CONFIG } = require("./config/aws");
const { MAIN_CATEGORY, CouponType, UseWithSale } = require('./config/const');
// 배치실행 관련 설정
const { User } = require("./models/User");
const { TmpOrder } = require("./models/TmpOrder");
const { TmpPayment } = require("./models/TmpPayment");
const { Point } = require('./models/Point');
const { Coupon } = require('./models/Coupon');
const schedule = require('node-schedule');
const nodemailer = require("nodemailer");
// CORS 설정
const cors = require('cors')

const server = async() => {
  try {
    await mongoose.connect(config.mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoDB Connected...');
    mongoose.set('debug', true);

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(cookieParser());
    app.use(cors({ origin: true, credentials: true }));

    // 아래 주소로 오면 해당 라우터로 가라는 지정
    app.use('/api/users', require('./routes/users'));
    app.use('/api/product', require('./routes/product'));
    app.use('/api/customers', require('./routes/customers'));
    app.use('/api/csv', require('./routes/csv'));
    app.use('/api/sendmail', require('./routes/sendmail'));
    app.use('/api/payment', require('./routes/payment'));
    app.use('/api/order', require('./routes/order'));
    app.use('/api/coupon', require('./routes/coupon'));
    app.use('/api/sale', require('./routes/sale'));
    app.use('/api/point', require('./routes/point'));
    app.use('/api/images', require('./routes/images'));
    app.use('/uploads', express.static('uploads'));

    if (process.env.NODE_ENV === "production") {
      // 모든 자바스크립트와 css 파일 같은 static한 파일들은 이 폴더에서 처리한다고 지정
      app.use(express.static("client/build"));
      app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
      });
    }

    const port = process.env.PORT || 5000
    app.listen(port, () => console.log(`Server Listening on ${port}`));  
  } catch (err) {
    console.log("error: ", err);
  }
}

// 서버실행
server();

  // 노드 스케줄러 크론 설정
  /* *    *    *    *    *    * */
  // ┬    ┬    ┬    ┬    ┬    ┬
  // │    │    │    │    │    │
  // │    │    │    │    │    └ day of week (0 - 7) (0 or 7 is Sun)
  // │    │    │    │    └───── month (1 - 12)
  // │    │    │    └────────── day of month (1 - 31)
  // │    │    └─────────────── hour (0 - 23)
  // │    └──────────────────── minute (0 - 59)
  // └───────────────────────── second (0 - 59, OPTIONAL)

  // RecurrenceRule 설정
  // second (0-59)
  // minute (0-59)
  // hour (0-23)
  // date (1-31)
  // month (0-11)
  // year
  // dayOfWeek (0-6) Starting with Sunday
  // tz
const batchJob = async() => {
  // 임시 사용자 삭제(생성후 1시간이 지난 임시사용자가 대상)
  // 매일 23시50분
  let rule1 = new schedule.RecurrenceRule();
  rule1.dayOfWeek = [0, new schedule.Range(0, 6)];
  rule1.hour = 23;
  rule1.minute = 45;
  rule1.second = 0;
  rule1.tz = 'Asia/Tokyo';

  schedule.scheduleJob(rule1, async function() {
    let startToday = new Date();
    let startTime = startToday.toLocaleString('ja-JP');
    console.log("-------------------------------------------");
    console.log("Delete temporary users start :", startTime);
    console.log("-------------------------------------------");

    try {
      let today = new Date();

      // 임시 사용자 정보 가져오기(임시사용자는 패스워드가 없다)
      const userInfos = await User.find({ "password": {$exists: false} });
      for (let i=0; i < userInfos.length; i++) {
        let orgDate = userInfos[i].createdAt; // 임시 사용자 생성일자(UTC)
        let chgDate = new Date(Date.parse(orgDate) + 1000 * 60 * 60); // 임시 사용자 생성일자에서 한시간 후의 시간
        // 임시사용자 생성후 1시간 이상 지난 경우
        if (today > chgDate) {
          // 임시사용자 삭제
          await User.deleteOne({ "_id": userInfos[i]._id });
        }
      }
    } catch (err) {
      console.log("Temporary User Delete Batch Failed: ", err);
    }
  });

  // 임시 결제정보 및 임시 주문정보 삭제
  // 매일 23시55분
  let rule2 = new schedule.RecurrenceRule();
  rule2.dayOfWeek = [0, new schedule.Range(0, 6)];
  rule2.hour = 23;
  rule2.minute = 55;
  rule2.second = 0;
  rule2.tz = 'Asia/Tokyo';

  schedule.scheduleJob(rule2, async function() {
    let startToday = new Date();
    let startTime = startToday.toLocaleString('ja-JP');
    console.log("-------------------------------------------");
    console.log("Temporary payment and temporary order information deletion: ", startTime);
    console.log("-------------------------------------------");

    try {
      let today = new Date();
      
      // 임시 주문정보 가져오기 
      const tmpOrderInfos = await TmpOrder.find();
      for (let i=0; i < tmpOrderInfos.length; i++) {
        const createDate = tmpOrderInfos[i].createdAt;
        // DB저장시간에서 24시간후의 시간을 구한다
        const after24Hour = new Date(Date.parse(createDate) + 1 + 1000 * 60 * 60 * 24);
        if (today > after24Hour) {
          // 임시 주문정보 삭제
          await TmpOrder.deleteOne({ "_id": tmpOrderInfos[i]._id });
        }
      }

      // 임시 결제정보 가져오기
      const tmpPaymentInfos = await TmpPayment.find();
      for (let i=0; i < tmpPaymentInfos.length; i++) {
        let createDate = tmpPaymentInfos[i].createdAt;
        // DB저장시간에서 24시간후의 시간을 구한다
        let after24Hour = new Date(Date.parse(createDate) + 1 + 1000 * 60 * 60 * 24);
        if (today > after24Hour) {
          // 임시결제정보 삭제
          await TmpPayment.deleteOne({ "_id": tmpPaymentInfos[i]._id });
        }
      }
    } catch (err) {
      console.log("Temporary order deletion batch processing failed: ", err);
    }
  });

  // 3달동안 로그인하지 않은 사용자에게 메일전송
  // 매월 1일 아침 6시
  let rule3 = new schedule.RecurrenceRule();
  rule3.date = 1;
  rule3.hour = 6;
  rule3.minute = 0;
  rule3.second = 0;
  rule3.tz = 'Asia/Tokyo';

  schedule.scheduleJob(rule3, async function() {
    let startToday = new Date();
    let startTime = startToday.toLocaleString('ja-JP');
    console.log("-------------------------------------------");
    console.log("Send mail to users who haven't logged in for 3 months: ", startTime);
    console.log("-------------------------------------------");

    try {
      // 3달전 일자 취득
      let today = new Date();
      let utc = new Date(today.setMonth(today.getMonth() - 3));
      let jst = new Date(utc.getFullYear(), utc.getMonth(), utc.getDate(), 23, 59, 59);
      let threeMonthsAgo = new Date(jst.getFullYear(), jst.getMonth(), jst.getDate(), jst.getHours() + 9, 59, 59);

      // 사용자 정보취득
      const userInfos = await getUserLastLogin(threeMonthsAgo);
      for (let i=0; i < userInfos.length; i++) {
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
        sendEmail(body, true);
      }
    } catch (err) {
      console.log("Failed to search for users who have not logged in for 3 months ", err);
    }
  });

  // 매월 삭제되는 포인트가 있는 사용자에게 메일전송
  // 매월 1일 아침 8시
  let rule4 = new schedule.RecurrenceRule();
  rule4.date = 1;
  rule4.hour = 8;
  rule4.minute = 0;
  rule4.second = 0;
  rule4.tz = 'Asia/Tokyo';

  schedule.scheduleJob(rule4, async function() {
    let startToday = new Date();
    let startTime = startToday.toLocaleString('ja-JP');
    console.log("-------------------------------------------");
    console.log("User point confirmation batch: ", startTime);
    console.log("-------------------------------------------");

    try {
      // 이번달 마지막일자 구하기(예: 2022/11/30 23:59:59)
      let today = new Date();
      let year = today.getFullYear();
      // 이번달의 마지막일 구하기
      let lastDay = new Date(year, today.getMonth() + 1, 0).getDate();
      // 서버 일자가 UTC
      let firstDayUTC = new Date(year, today.getMonth(), 1, 0, 0, 0 );
      let lastDayUTC = new Date(year, today.getMonth(), lastDay, 23, 59, 59 );
      // 9시간을 더해서 JST로 변경
      let firstDayJST = new Date(year, today.getMonth(), 1, firstDayUTC.getHours() + 9, 0, 0 );
      let lastDayJST = new Date(year, today.getMonth(), lastDay, lastDayUTC.getHours() + 9, 59, 59 );
      let expiredDate = year + "-" + lastDayJST.getMonth() + "-" + lastDay

      // 일반 사용자 정보 가져오기
      const userInfos = await getUsers();
      for (let i=0; i < userInfos.length; i++) {
        let point = 0;
        
        // 포인트 가져오기
        const pointInfos = await getPoints(userInfos[i]._id);
        for (let j=0; j<pointInfos.length; j++) {

          totalPoint += pointInfos[j].point;
          if (firstDayJST <= pointInfos[j].validTo && pointInfos[j].validTo <= lastDayJST) {
            point += pointInfos[j].point;
          }
        }

        if (point > 0) {
          let subTitle = "";
          let message = "";
          console.log("userInfos[i].language: ", userInfos[i].language);

          if (userInfos[i].language == "jp") {
            subTitle = "ポイント有効期限のお知らせ"
            message = userInfos[i].lastName + " " + userInfos[i].name + "様\n\n"
            message += "いつもご利用ありがとうございます。\n";
            message += "現在の保有ポイント数と有効期限をご案内いたします。\n\n";
            message += "利用可能なポイント： " + userInfos[i].myPoint + "\n";
            message += "今月まで使えるポイント： " + point + "\n";
            message += "有効期限： " + expiredDate + "\n";
            message += "※有効期限が切れると保有ポイントは無効となり、ご利用できなくなりますので、\n";
            message += "本メールはポイントを保有されているすべての会員様に配信しております。";
          } else if (userInfos[i].language == "en") {
            subTitle = "Notice of point expiration date"
            message = userInfos[i].lastName + " " + userInfos[i].name + "様\n\n"
            message += "Thank you for using it all the time.\n";
            message += "We will inform you of the current number of points and the expiration date.\n\n";
            message += "Points available: " + userInfos[i].myPoint + "\n";
            message += "Points that can be used until this month: " + point + "\n";
            message += "date of expiry:" + expiredDate + "\n";
            message += "※Once the expiration date expires, the points you hold will become invalid and you will not be able to use them.\n";
            message += "This email is sent to all members who have points.";
          } else if (userInfos[i].language == "cn") {
            subTitle = "积分到期通知"
            message = userInfos[i].lastName + " " + userInfos[i].name + "様\n\n"
            message += "感谢您一直使用我们的服务。\n";
            message += "我们将通知您当前持有的积分数量和到期日期。\n\n";
            message += "持有积分： " + userInfos[i].myPoint + "\n";
            message += "本月可使用的积分 " + point + "\n";
            message += "到期日期： " + expiredDate + "\n";
            message += "※一旦过期，您持有的积分将失效，您将无法使用它们。\n";
            message += "这封邮件是发给所有有积分的会员。";
          }

          const body = {
            type: "Batch",
            subject: subTitle,
            from: ADMIN_EMAIL,
            to: userInfos[i].email,
            message: message
          }
          // 메일송신
          sendEmail(body, true);
        }
      }
    } catch (err) {
      console.log("User point confirmation batch Failed: ", err);
    }
  });

  // 매월 생일자에게 생일자 쿠폰 메일전송
  // 매월 1일 아침 9시
  let rule5 = new schedule.RecurrenceRule();
  rule5.date = 1;
  rule5.hour = 9;
  rule5.minute = 0;
  rule5.second = 0;
  rule5.tz = 'Asia/Tokyo';

  schedule.scheduleJob(rule5, async function() {
    let startToday = new Date();
    let startTime = startToday.toLocaleString('ja-JP');
    console.log("-------------------------------------------");
    console.log("Birthday coupons batch: ", startTime);
    console.log("-------------------------------------------");

    try {
      // 이번달 마지막일자 구하기(예: 2022/11/30 23:59:59)
      let today = new Date();
      let year = today.getFullYear();
      // 다음달의 마지막일 구하기
      let lastDate = new Date(year, today.getMonth() + 2, 0).getDate();
      // 서버 일자가 UTC
      let startDateUTC = new Date(year, today.getMonth(), 1, 0, 0, 0 );
      // 다음달 말일 UTC
      // 9시간을 더해서 JST로 변경
      let startDateJST = new Date(year, today.getMonth(), 1, startDateUTC.getHours() + 9, 0, 0 );
      // 한달후의 날짜 계산용
      let tmpJST = new Date(year, today.getMonth() + 1, 1, startDateUTC.getHours() + 9, 0, 0 );

      const startMonth = startDateJST.getMonth() + 1;
      const endMonth = tmpJST.getMonth() + 1;
      const startDate = startDateJST.getFullYear() + "-" + startMonth + "-" + startDateJST.getDate();
      const endDate =  tmpJST.getFullYear() + "-" + endMonth + "-" + lastDate;

      // 생일자 쿠폰 정보 가져오기
      const couponInfos = await getCoupons()
      // 일반 사용자 정보 가져오기
      const userInfos = await getUsers();
      
      for (let i=0; i < userInfos.length; i++) {
        // 생일정보가 있는경우
        if (userInfos[i].birthday) {
          let birth = userInfos[i].birthday;
          let month = Number(birth.substring(4,6));
          let day = Number(birth.substring(6,8));

          if (month === startMonth){
            let message = "";
            let subTitle = "";
            if (userInfos[i].language == "jp") {
              subTitle = userInfos[i].lastName + " " + userInfos[i].name + "様へお誕生日プレゼントクーポン!! お誕生日おめでとうございます"
              message = "いつもご利用ありがとうございます。\n";
              message += month + "月" + day + "日は" + userInfos[i].lastName + " " + userInfos[i].name + "様のお誕生日ということで、"
              message += "お祝いと日頃の感謝の気持ちをお伝えさせていただくと共に、\n";
              message += "ささやかながらプレゼントをご用意させていただきました。\n\n";
              message += "【クーポンの内容】\n";
              // 쿠폰종류 설정
              let tmpKey = "";
              CouponType.map(item => {
                  if (item.key === couponInfos[0].type) {
                      tmpKey = item.key; 
                      message += " ・クーポン種類: " + item.value + "\n";
                  }
              })
              // 쿠폰종류에 따른 할인율 단위
              message += " ・クーポン割引: " + couponInfos[0].amount
              if (tmpKey === "0") message += "%\n";
              if (tmpKey === "1") message += "(point)\n";
              if (tmpKey === "2") message += "(JPY)\n";
              // 카테고리
              MAIN_CATEGORY.map(item => {
                  if (item.key === Number(couponInfos[0].item)) {
                      message += " ・カテゴリ: " + item.value + "\n";
                  }
              })
              // 상품정보 가져오기
              if (couponInfos[0].productId !== "") {
                  const productInfo = await Product.find({ "_id": couponInfos[0].productId });
                  message += " ・対象商品: " + productInfo[0].title + "\n";
              }
              // 세일과 함께 사용유무
              UseWithSale.map(item => {
                  if (item.key === couponInfos[0].useWithSale) {
                      message += " ・セール併用: " + item.value + "\n";
                  }
              })
              // 쿠폰 사용회수
              message += " ・使用次数: 1 \n\n";
              message += "【クーポン有効期限】: " + startDate + "～" + endDate + "まで\n\n";
              message += "【クーポンコード】: " + couponInfos[0].code + "\n\n";
              message += "期間限定のクーポンとなります。是非この機会にご利用ください。"
            } else if (userInfos[i].language == "en") {
              subTitle = "A birthday gift coupon for " +  userInfos[i].lastName + " " + userInfos[i].name + "!! Happy Birthday"
              message = "Thank you for using it all the time.\n";
              message += month + "月" + day + "th is " + userInfos[i].lastName + " " + userInfos[i].name + "'s birthday, "
              message += "so I would like to express my gratitude and congratulations.\n";
              message += "I have prepared a small gift for you.\n\n";
              message += "【Coupon details】\n";
              // 쿠폰종류 설정
              let tmpKey = "";
              CouponType.map(item => {
                  if (item.key === couponInfos[0].type) {
                      tmpKey = item.key; 
                      message += " ・Coupon Type: " + item.value + "\n";
                  }
              })
              // 쿠폰종류에 따른 할인율 단위
              message += " ・Coupon Discount: " + couponInfos[0].amount
              if (tmpKey === "0") message += "%\n";
              if (tmpKey === "1") message += "(point)\n";
              if (tmpKey === "2") message += "(JPY)\n";
              // 카테고리
              MAIN_CATEGORY.map(item => {
                  if (item.key === Number(couponInfos[0].item)) {
                      message += " ・Category: " + item.value + "\n";
                  }
              })
              // 상품정보 가져오기
              if (couponInfos[0].productId !== "") {
                  const productInfo = await Product.find({ "_id": couponInfos[0].productId });
                  message += " ・Product: " + productInfo[0].title + "\n";
              }
              // 세일과 함께 사용유무
              UseWithSale.map(item => {
                  if (item.key === couponInfos[0].useWithSale) {
                      message += " ・Use with sale: " + item.value + "\n";
                  }
              })
              // 쿠폰 사용회수
              message += " ・Number of use: 1 \n\n";
              message += "【Coupon Expiration Date】: " + startDate + "～" + endDate + "\n\n";
              message += "【Coupon code】: " + couponInfos[0].code + "\n\n";
              message += "This is a limited time offer. Please take advantage of this opportunity."
            } else if (userInfos[i].language == "cn") {
              subTitle = userInfos[i].lastName + " " + userInfos[i].name + "的生日礼券!! 生日快乐"
              message = "感谢你一直以来使用 【古冈药妆】。\n";
              message += month + "月" + day + "日是" + userInfos[i].lastName + " " + userInfos[i].name + "的生日，在此表示感谢和祝贺。\n";
              message += "我为你准备了一个小礼物。\n\n";
              message += "【优惠券内容】\n";
              // 쿠폰종류 설정
              let tmpKey = "";
              CouponType.map(item => {
                  if (item.key === couponInfos[0].type) {
                      tmpKey = item.key; 
                      message += " ・优惠券类型: " + item.value + "\n";
                  }
              })
              // 쿠폰종류에 따른 할인율 단위
              message += " ・优惠券折扣: " + couponInfos[0].amount
              if (tmpKey === "0") message += "%\n";
              if (tmpKey === "1") message += "(point)\n";
              if (tmpKey === "2") message += "(JPY)\n";
              // 카테고리
              MAIN_CATEGORY.map(item => {
                  if (item.key === Number(couponInfos[0].item)) {
                      message += " ・可用类别: " + item.value + "\n";
                  }
              })
              // 상품정보 가져오기
              if (couponInfos[0].productId !== "") {
                  const productInfo = await Product.find({ "_id": couponInfos[0].productId });
                  message += " ・产品: " + productInfo[0].title + "\n";
              }
              // 세일과 함께 사용유무
              UseWithSale.map(item => {
                  if (item.key === couponInfos[0].useWithSale) {
                      message += " ・与折扣一起使用: " + item.value + "\n";
                  }
              })
              // 쿠폰 사용회수
              message += " ・使用次数: 1 \n\n";
              message += "【优惠截止日期】: " + startDate + "～" + endDate + "\n\n";
              message += "【优惠券代码】: " + couponInfos[0].code + "\n\n";
              message += "这是一个限时优惠。 请抓住这个机会。"
            }

            const body = {
              type: "Batch",
              subject: subTitle,
              from: ADMIN_EMAIL,
              to: userInfos[i].email,
              message: message
            }
            // 메일송신
            sendEmail(body, false);
          }
        }
      }
    } catch (err) {
      console.log("Birthday coupons batch: ", err);
    }
  });
}

// 마지막 로그인 일자가 3개월 전인 사용자정보 가져오기(예: threeMonthsAgo:  2022-08-09T23:59:59.000Z)
function getUserLastLogin(threeMonthsAgo) {
  // 임시사용자 정보가 아니고 논리삭제되지 않았고 일반사용자인 정보
  const userInfos = User.find({"lastLogin": {$lte: threeMonthsAgo}, "password": {$exists: true}, "deletedAt": null , "role": 0 }); 
  return userInfos;
}
// 사용자정보 가져오기
function getUsers() {
  // 임시 사용자 정보가 아니고 논리삭제되지 않았고 일반사용자인 정보
  const userInfos = User.find({ "password": {$exists: true}, "deletedAt": null , "role": 0 });
  return userInfos;
}
// 사용하지 않은 포인트 가져오기
function getPoints(userId) {
  const pointInfos = Point.find({ "userId": userId, $or: [{ "dateUsed": null}, {"dateUsed": ''}]});
  return pointInfos;
}
// 생일자 쿠폰 가져오기
const getCoupons = () => {
  const couponInfos = Coupon.find({ "validTo": "9999-12-31T00:00:00.000+00:00", "active": "1" });
  return couponInfos;
}

// 메일 송신
function sendEmail(data, optional) {
  // AWS SES 접근 보안키
  process.env.AWS_ACCESS_KEY_ID = SES_CONFIG.access;
  process.env.AWS_SECRET_ACCESS_KEY = SES_CONFIG.secret;
  const ses = new AWS.SES({
      apiVersion: "2010-12-01",
      region: SES_CONFIG.region, 
  });
  const transporter = nodemailer.createTransport({ SES: ses, AWS })

  try {
    // 메일송신
    let mailOptions = {
      from: data.from,
      to: data.to,
      subject: data.subject,
      text: data.message
    };
    transporter.sendMail(mailOptions);

    // 메일등록
    if (optional) {
      const body = {
        type: data.type,
        from: data.from,
        to: data.to,
        subject: data.subject,
        message: data.message,
      }
      const mail = new Mail(body);
      mail.save();
    }
  } catch (err) {
    console.log("Failed to send batch mail: ", err);
  }
};

// batch 실행
batchJob();