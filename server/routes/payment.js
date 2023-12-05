const express = require('express');
const router = express.Router();
const { Alipay } = require('../models/Alipay');
const { Wechat } = require('../models/Wechat');
const { Order } = require('../models/Order');
const { TmpOrder } = require('../models/TmpOrder');
const { User } = require('../models/User');
const { Payment } = require('../models/Payment');
const { TmpPayment } = require('../models/TmpPayment');
const { Product } = require('../models/Product');
const { Point } = require('../models/Point');
const { Counter } = require('../models/Counter');
const async = require('async');
const { NOT_SET, DEPOSITED } = require('../config/const')

//=================================
//             Payment
//=================================

// UPC AliPay 결제결과 등록
router.get('/alipay/register', async (req, res) => {
  try {
    // UPC 사양에 의해 관리페이지의 킥백에 설정한 주소로 1바이트 문자를 표시하기 위한 조건
    if (!req.query) {
      return res.status(200).json({success: true});
    } else {
      // 링크결제는 이래의 로직을 타지 않게 한다(uniqueField가 없다)
      if (req.query.uniqueField) {
        // 결제 성공했을 경우
        if (req.query.rst === "1") {          
          let dt1 = new Date();
          let currentDate = new Date(dt1.getTime() - (dt1.getTimezoneOffset() * 60000)).toISOString();
          let dt2 = new Date(dt1.setFullYear(dt1.getFullYear() + 1));
          let oneYearDate = new Date(dt2.getTime() - (dt2.getTimezoneOffset() * 60000)).toISOString();

          // Cart결제인 경우 sod의 포인트값들을 추출
          let pointToUse = 0;
          let productPoint = 0;
          let totalPoint = 0;

          // Live: uniqueField = 'alipay' + '_' + loginUserId + '_' + uniqueDate;
          // Cart: uniqueField = 'cart_' + tmpPaymentId + '_' + uniqueDate + '_' + userID;
          let uniqueField = req.query.uniqueField;

          let arrUniqueField = req.query.uniqueField.split('_');
          if (arrUniqueField[0].trim() === "cart") {
            // sod는 카트에서 이동된 경우, 사용자가 사용한 포인트, 상품구매의 포인트 그리고 총 포인트가 넘어온다
            // sod = UsePoint + '_' + AcquisitionPoints + '_' + grantPoint;
            let arrSod = req.query.sod.split('_');
            pointToUse = parseInt(arrSod[0]); // 사용자가 입력한 포인트(UsePoint)
            productPoint = parseInt(arrSod[1]); // 누적할 포인트(AcquisitionPoints)
            totalPoint = parseInt(arrSod[2]); // 총 포인트(grantPoint)

            // Cart인 경우 Wechat확인 페이지에서 tmpOrder에 등록할때 userId를 제외한 
            // uniqueField로 등록해서 userId를 제외한 uniqueField로 검색한다
            // UPC에 전송할때 userId를 붙인 이유는 redirect 페이지에서 사용하기 위함
            uniqueField = arrUniqueField[0] + "_" + arrUniqueField[1] + "_" + arrUniqueField[2];
          } else {
            // sod는 Live에서 이동된 경우는 Alipay확인화면에서 상품의 총 금액애 해당하는 포인트를 계산해서 보낸다
            // Live는 사용자가 포인트를 사용할수 없기때문에 상품구매 포인트와 총 포인트가 같다
            let arrSod = req.query.sod.split('_');
            productPoint = parseInt(arrSod[0]);
            totalPoint = parseInt(arrSod[0]);
          }

          // Alipay에 결제결과 등록
          // uniqueField는 tmpOrder와 동일하게 userId를 삭제한 값으로 등록한다
          req.query.uniqueField = uniqueField;
          const alipay = new Alipay(req.query);
          await alipay.save();

          // 임시 주문정보 가져오기(Alipay확인 페이지에서 tmpOrder정보를 저장한다)
          const tmpOrderInfo = await TmpOrder.findOne({ "uniqueField": uniqueField });

          // 주문정보 설정
          const body = {
            type: tmpOrderInfo.type,
            userId: tmpOrderInfo.userId,
            name: tmpOrderInfo.name,
            lastName: tmpOrderInfo.lastName,
            tel: tmpOrderInfo.tel,
            email: tmpOrderInfo.email,
            country: tmpOrderInfo.country,
            zip: tmpOrderInfo.zip,
            address: tmpOrderInfo.address,
            receiver: tmpOrderInfo.receiver,
            receiverTel: tmpOrderInfo.receiverTel,
            sod: tmpOrderInfo.sod,
            uniqueField: tmpOrderInfo.uniqueField,
            amount: tmpOrderInfo.amount,
            staffName: tmpOrderInfo.staffName,
            paymentStatus: DEPOSITED,
            deliveryStatus: tmpOrderInfo.deliveryStatus
          }

          // 주문정보 저장
          const order = new Order(body);
          const orderInfo = await order.save();

          // 임시 주문정보 삭제
          await TmpOrder.findOneAndDelete({ "uniqueField": uniqueField });
          
          // 카트에서 호출된경우 TmpPayment정보 가져오기
          if (arrUniqueField[0].trim() === "cart") {
            // Payment에 저장할 새로운 data정보 셋팅
            let paymentData = [];
            paymentData.push({
              address: {
                city: NOT_SET,
                country_code: NOT_SET,
                line1: orderInfo.address,
                postal_code: NOT_SET,
                recipient_name: orderInfo.receiver,
                state: NOT_SET,
              },
              cancelled: false,
              email: NOT_SET,
              paid: true,
              payerID: NOT_SET,
              paymentID: req.query.pid, // 실제 결제ID
              paymentToken: NOT_SET,
              returnUrl: NOT_SET,
            });

            // 카트결제인 경우만 uniqueKey에 PaymentId가 들어온다
            const paymentId = arrUniqueField[1];

            // TmpPayment 가져오기(카트 페이지에서 저장)
            const tmpPaymentInfo = await TmpPayment.findOne({ _id: paymentId })

            // 모든 구매상품에 AliPay 결제ID 설정
            for(let i=0; i<tmpPaymentInfo.product.length; i++) {
              tmpPaymentInfo.product[i].paymentId = req.query.pid;
            }

            // 임시 결제정보 삭제
            await TmpPayment.findOneAndDelete({ _id: paymentId });

            // 결제정보 설정
            let transactionData = {};
            transactionData.user = tmpPaymentInfo.user[0];
            transactionData.data = paymentData;
            transactionData.product = tmpPaymentInfo.product;

            //불특정 사용자인 경우(확인 페이지에서 아이디가 삭제되기 때문에 별도처리가 필요)
            if (tmpOrderInfo.name.substring(0, 9) === 'Anonymous') {
              // Payment에 결제정보 저장
              const payment = new Payment(transactionData);
              payment.save((err, doc) => {
                if(err) {
                  console.log("payment update failed: ", err);
                } else {
                  // Product의 sold 필드 정보 업데이트
                  // 상품별 몇개를 샀는지 파악 
                  let products = [];
                  doc.product.forEach(item => {
                      products.push({ id: item.id, quantity: item.quantity })
                  })

                  // Product에 구매수량 업데이트
                  async.eachSeries(products, (item, callback) => {
                    Product.updateOne(
                      { _id: item.id },
                      { $inc: { "sold": item.quantity, "quantity": item.quantity * -1 }},
                      { new: false },
                      callback
                    )
                  }, (err) => {
                    if(err) {
                      console.log("Payment update failed: ", err);
                    } else {
                      console.log("Payment update success");
                    }
                  })
                }
              });
            } else {
              // User의 history paymentId 정보추가 및 포인트 누적
              User.findOneAndUpdate(
                { _id: tmpPaymentInfo.user[0].id },
                { $push: { history: tmpPaymentInfo.product }, $set: { myPoint: totalPoint }},
                { new: true },
                (err, user) => {
                  if(err) {
                    console.log("user update failed: ", err);
                  } else {
                    // Payment에 결제정보 저장
                    const payment = new Payment(transactionData);
                    payment.save((err, doc) => {
                      if(err) {
                        console.log("payment update failed: ", err);
                      } else {
                        // Product의 sold 필드 정보 업데이트
                        // 상품당 몇개를 샀는지 파악 
                        let products = [];
                        doc.product.forEach(item => {
                            products.push({ id: item.id, quantity: item.quantity })
                        })
                        // Product에 구매수량 업데이트
                        async.eachSeries(products, (item, callback) => {
                          Product.updateOne(
                            { _id: item.id },
                            { $inc: { "sold": item.quantity, "quantity": item.quantity * -1 }},
                            { new: false },
                            callback
                          )
                        }, (err) => {
                          if(err) {
                            console.log("Payment update failed: ", err);
                          } else {
                            console.log("Payment update success");
                          }
                        })
                      }
                    });
                  }
                }
              )
              
              // 사용자가 입력한 포인트가 있는지 확인 (입력한 포인트는 기본값이 화면단에서 0으로 설정되어 있다)
              // 불특정 사용자는 포인트 입력을 못한다
              const userId = tmpOrderInfo.userId;
              const name = tmpOrderInfo.name;
              const lastName = tmpOrderInfo.lastName;
              if(pointToUse > 0) {
                // 포인트 계산 및 이력관리
                calcPoint(userId, name, lastName, currentDate, oneYearDate, productPoint, pointToUse);
              } else {
                // 포인트 누적할 항목 설정
                let dataToSubmit = {
                  userId: userId,
                  userName: name,
                  userLastName: lastName,
                  point: productPoint, // 구매상품 포인트 합계
                  remainingPoints: productPoint,
                  usePoint: 0,
                  dspUsePoint: 0,
                  validFrom: currentDate,
                  validTo: oneYearDate,
                  dateUsed:''
                }
                // 포인트 등록
                savePoint(dataToSubmit)
              }
            }
          } else {
            // 라이브에서 이동된 경우 포인트 처리(라이브는 로그인 한 사용자만 사용이 가능하기에 사용자 정보를 가지고 있다.)
            // 상품에 대한 정보가 없기 때문에 TmpPayment, Payment정보를 저장하지 않는다
            // 사용자 포인트 가져오기
            User.findOne({ "_id": tmpOrderInfo.userId, "deletedAt": null , "role": 0 }, function(err, userInfo) {
              if (err) {
                console.log("err: ", err);
              } else {
                // 사용자 기존 포인트에 라이브에서 구매한 상품의 포인트를 합산
                totalPoint += userInfo.myPoint

                User.findOneAndUpdate({ _id: tmpOrderInfo.userId }, { myPoint: totalPoint },
                  (err, user) => {
                    if (err) {
                      console.log("user update failed: ", err);
                    } else {
                      // 포인트 테이블에 포인트정보를 등록한다
                      let dataToSubmit = {
                        userId: tmpOrderInfo.userId,
                        userName: tmpOrderInfo.name,
                        userLastName: tmpOrderInfo.lastName,
                        point: productPoint, // 구매상품 포인트 합계
                        remainingPoints: productPoint,
                        usePoint: 0,
                        dspUsePoint: 0,
                        validFrom: currentDate,
                        validTo: oneYearDate,
                        dateUsed:''
                      }
                      // 포인트 등록
                      savePoint(dataToSubmit);
                    }
                })
              }
            })
          }
        } else {
          console.log("AliPay payment failed at UPC");
        }
      }
      // UPC 사양에 의해 관리페이지의 킥백에 설정한 주소로 
      // 1바이트 문자를 표시하기 위한 조건
      return res.status(200).json({success: true});
    }
  } catch (err) {
    console.log("Payment alipay_register err: ", err);
  } 
})

// UPC WeChat 결제결과 등록
router.get('/wechat/register', async (req, res) => {
  try {
    // UPC 사양에 의해 관리페이지의 킥백에 설정한 주소로 1바이트 문자를 표시하기 위한 조건
    if (!req.query) {
      return res.status(200).json({success: true});
    } else {
      // 링크결제는 이래의 로직을 타지 않게 한다(uniqueField가 없다)
      if (req.query.uniqueField) {
        // 결제 성공했을 경우
        if (req.query.rst === "1") {
          let dt1 = new Date();
          let currentDate = new Date(dt1.getTime() - (dt1.getTimezoneOffset() * 60000)).toISOString();
          let dt2 = new Date(dt1.setFullYear(dt1.getFullYear() + 1));
          let oneYearDate = new Date(dt2.getTime() - (dt2.getTimezoneOffset() * 60000)).toISOString();

          // Cart결제인 경우 sod의 포인트값들을 추출
          let pointToUse = 0;
          let productPoint = 0;
          let totalPoint = 0;

          // Live: uniqueField = 'alipay' + '_' + loginUserId + '_' + uniqueDate;
          // Cart: uniqueField = 'cart_' + tmpPaymentId + '_' + uniqueDate + '_' + userID;
          let uniqueField = req.query.uniqueField;

          let arrUniqueField = req.query.uniqueField.split('_');
          if (arrUniqueField[0].trim() === "cart") {
            // sod는 카트에서 이동된 경우, 사용자가 사용한 포인트, 상품구매의 포인트 그리고 총 포인트가 넘어온다
            // sod = UsePoint + '_' + AcquisitionPoints + '_' + grantPoint;
            let arrSod = req.query.sod.split('_');
            pointToUse = parseInt(arrSod[0]); // 사용자가 입력한 포인트(UsePoint)
            productPoint = parseInt(arrSod[1]); // 누적할 포인트(AcquisitionPoints)
            totalPoint = parseInt(arrSod[2]); // 총 포인트(grantPoint)

            // Cart인 경우 Wechat확인 페이지에서 tmpOrder에 등록할때 userId를 제외한 
            // uniqueField로 등록해서 userId를 제외한 uniqueField로 검색한다
            // UPC에 전송할때 userId를 붙인 이유는 redirect 페이지에서 사용하기 위함
            uniqueField = arrUniqueField[0] + "_" + arrUniqueField[1] + "_" + arrUniqueField[2];
          } else {
            // sod는 Live에서 이동된 경우는 Alipay확인화면에서 상품의 총 금액애 해당하는 포인트를 계산해서 보낸다
            // Live는 사용자가 포인트를 사용할수 없기때문에 상품구매 포인트와 총 포인트가 같다
            let arrSod = req.query.sod.split('_');
            productPoint = parseInt(arrSod[0]);
            totalPoint = parseInt(arrSod[0]);
          }

          // WeChat에 결제결과 등록
          // uniqueField는 tmpOrder와 동일하게 userId를 삭제한 값으로 등록한다
          req.query.uniqueField = uniqueField;
          const wechat = new Wechat(req.query);
          await wechat.save();

          // 임시 주문정보 가져오기(Wechat확인 페이지에서 tmpOrder정보를 저장한다)
          const tmpOrderInfo = await TmpOrder.findOne({ "uniqueField": uniqueField });

          // 주문정보 설정
          const body = {
            type: tmpOrderInfo.type,
            userId: tmpOrderInfo.userId,
            name: tmpOrderInfo.name,
            lastName: tmpOrderInfo.lastName,
            tel: tmpOrderInfo.tel,
            email: tmpOrderInfo.email,
            country: tmpOrderInfo.country,
            zip: tmpOrderInfo.zip,
            address: tmpOrderInfo.address,
            receiver: tmpOrderInfo.receiver,
            receiverTel: tmpOrderInfo.receiverTel,
            sod: tmpOrderInfo.sod,
            uniqueField: tmpOrderInfo.uniqueField,
            amount: tmpOrderInfo.amount,
            staffName: tmpOrderInfo.staffName,
            paymentStatus: DEPOSITED,
            deliveryStatus: tmpOrderInfo.deliveryStatus
          }

          // 주문정보 저장
          const order = new Order(body);
          const orderInfo = await order.save();

          // 임시 주문정보 삭제
          await TmpOrder.findOneAndDelete({ "uniqueField": uniqueField });
          
          // 카트에서 호출된경우 TmpPayment정보 가져오기
          if (arrUniqueField[0].trim() === "cart") {
            // Payment에 저장할 새로운 data정보 셋팅
            let paymentData = [];
            paymentData.push({
              address: {
                city: NOT_SET,
                country_code: NOT_SET,
                line1: orderInfo.address,
                postal_code: NOT_SET,
                recipient_name: orderInfo.receiver,
                state: NOT_SET,
              },
              cancelled: false,
              email: NOT_SET,
              paid: true,
              payerID: NOT_SET,
              paymentID: req.query.pid, // 실제 결제ID
              paymentToken: NOT_SET,
              returnUrl: NOT_SET,
            });

            // 카트결제인 경우만 uniqueKey에 PaymentId가 들어온다
            const paymentId = arrUniqueField[1];

            // TmpPayment 가져오기(카트 페이지에서 저장)
            const tmpPaymentInfo = await TmpPayment.findOne({ _id: paymentId })

            // 모든 구매상품에 WeChat 결제ID 설정
            for(let i=0; i<tmpPaymentInfo.product.length; i++) {
              tmpPaymentInfo.product[i].paymentId = req.query.pid;
            }

            // 임시 결제정보 삭제
            await TmpPayment.findOneAndDelete({ _id: paymentId });

            // 결제정보 설정
            let transactionData = {};
            transactionData.user = tmpPaymentInfo.user[0];
            transactionData.data = paymentData;
            transactionData.product = tmpPaymentInfo.product;

            // 불특정 사용자인 경우(확인 페이지에서 아이디가 삭제되기 때문에 별도처리가 필요)
            if (tmpOrderInfo.name.substring(0, 9) === 'Anonymous') {
              // Payment에 결제정보 저장
              const payment = new Payment(transactionData);
              payment.save((err, doc) => {
                if(err) {
                  console.log("payment update failed: ", err);
                } else {
                  // Product의 sold 필드 정보 업데이트
                  // 상품당 몇개를 샀는지 파악 
                  let products = [];
                  doc.product.forEach(item => {
                      products.push({ id: item.id, quantity: item.quantity })
                  })

                  // Product에 구매수량 업데이트
                  async.eachSeries(products, (item, callback) => {
                    Product.updateOne(
                      { _id: item.id },
                      { $inc: { "sold": item.quantity, "quantity": item.quantity * -1 }},
                      { new: false },
                      callback
                    )
                  }, (err) => {
                    if(err) {
                      console.log("Payment update failed: ", err);
                    } else {
                      console.log("Payment update success");
                    }
                  })
                }
              });
            } else {
              // User의 history paymentId 정보추가 및 포인트 누적
              User.findOneAndUpdate(
                { _id: tmpPaymentInfo.user[0].id },
                { $push: { history: tmpPaymentInfo.product }, $set: { myPoint: totalPoint }},
                { new: true },
                (err, user) => {
                  if(err) {
                    console.log("user update failed: ", err);
                  } else {
                    // Payment에 결제정보 저장
                    const payment = new Payment(transactionData);
                    payment.save((err, doc) => {
                      if(err) {
                        console.log("payment update failed: ", err);
                      } else {
                        // Product의 sold 필드 정보 업데이트
                        // 상품당 몇개를 샀는지 파악 
                        let products = [];
                        doc.product.forEach(item => {
                            products.push({ id: item.id, quantity: item.quantity })
                        })
                        // Product에 구매수량 업데이트
                        async.eachSeries(products, (item, callback) => {
                          Product.updateOne(
                            { _id: item.id },
                            { $inc: { "sold": item.quantity, "quantity": item.quantity * -1 }},
                            { new: false },
                            callback
                          )
                        }, (err) => {
                          if(err) {
                            console.log("Payment update failed: ", err);
                          } else {
                            console.log("Payment update success");
                          }
                        })
                      }
                    });
                  }
                }
              )
              
              // 사용자가 입력한 포인트가 있는지 확인 (입력한 포인트는 기본값이 화면단에서 0으로 설정되어 있다)
              // 불특정 사용자는 포인트 입력을 못한다
              const userId = tmpOrderInfo.userId;
              const name = tmpOrderInfo.name;
              const lastName = tmpOrderInfo.lastName;
              if(pointToUse > 0) {
                // 포인트 계산 및 이력관리
                calcPoint(userId, name, lastName, currentDate, oneYearDate, productPoint, pointToUse);
              } else {
                // 포인트 누적할 항목 설정
                let dataToSubmit = {
                  userId: userId,
                  userName: name,
                  userLastName: lastName,
                  point: productPoint, // 구매상품 포인트 합계
                  remainingPoints: productPoint,
                  usePoint: 0,
                  dspUsePoint: 0,
                  validFrom: currentDate,
                  validTo: oneYearDate,
                  dateUsed:''
                }
                // 포인트 등록
                savePoint(dataToSubmit);
              }
            }
          } else {
            // 라이브에서 이동된 경우 포인트 처리(라이브는 로그인 한 사용자만 사용이 가능하기에 사용자 정보를 가지고 있다.)
            // 상품에 대한 정보가 없기 때문에 TmpPayment, Payment정보를 저장하지 않는다
            // 사용자 포인트 가져오기
            User.findOne({ "_id": tmpOrderInfo.userId, "deletedAt": null , "role": 0 }, function(err, userInfo) {
              if (err) {
                console.log("err: ", err);
              } else {
                // 사용자 기존 포인트에 라이브에서 구매한 상품의 포인트를 합산
                totalPoint += userInfo.myPoint

                User.findOneAndUpdate({ _id: tmpOrderInfo.userId }, { myPoint: totalPoint },
                  (err, user) => {
                    if (err) {
                      console.log("user update failed: ", err);
                    } else {
                      // 포인트 테이블에 포인트정보를 등록한다
                      let dataToSubmit = {
                        userId: tmpOrderInfo.userId,
                        userName: tmpOrderInfo.name,
                        userLastName: tmpOrderInfo.lastName,
                        point: productPoint, // 구매상품 포인트 합계
                        remainingPoints: productPoint,
                        usePoint: 0,
                        dspUsePoint: 0,
                        validFrom: currentDate,
                        validTo: oneYearDate,
                        dateUsed:''
                      }
                      // 포인트 등록
                      savePoint(dataToSubmit);
                    }
                })
              }
            })
          }
        } else {
          console.log("WeChat payment failed at UPC");
        }
      }
      // UPC 사양에 의해 관리페이지의 킥백에 설정한 주소로 
      // 1바이트 문자를 표시하기 위한 조건
      return res.status(200).json({success: true});
    }
  } catch (err) {
    console.log("Payment wechat_register err: ", err);
  }
})

// 포인트 계산 및 이력관리
const calcPoint = (userId, name, lastName, currentDate, oneYearDate, productPoint, pointToUse) => {
  try {
    // 포인트 누적할 항목 설정
    let dataToSubmit = {
      "userId": userId,
      "userName": name,
      "userLastName": lastName,
      "point": productPoint, // 취득한 포인트
      "remainingPoints": productPoint, // 취득한 포인트
      "usePoint": 0,
      "dspUsePoint": 0,
      "validFrom": currentDate,
      "validTo": oneYearDate,
      "dateUsed":''
    }

    // 포인트 등록
    savePoint(dataToSubmit)

    // 사용자가 보유하는 포인트 가져오기 (남은포인트가 0보다 큰 데이타)
    Point.find({ "userId": userId, "remainingPoints": { $gt: 0 }})
    .sort({ "validTo": 1 }) // 유효기간To가 가까운것부터 정렬(내림차순)
    .exec((err, points) => {
      if (err) {
        console.log("Point calculation failed: ", err);
        return false;
      } else {

        // 유효기간 내의 사용할수 있는 포인트만 추출
        let pointInfos = [];
        let current = new Date(currentDate.substring(0, 10));

        for (let i=0; i<points.length; i++) {
          let from = points[i].validFrom;
          let to = points[i].validTo;
          let validFrom = new Date(from.toISOString().substring(0, 10))
          let validTo = new Date(to.toISOString().substring(0, 10))

          if ((validFrom <= current) && (current <=  validTo)) {
            pointInfos.push(points[i]);
          }
        }

        for (let i=0; i<pointInfos.length; i++) {
          // 첫번째 레코드는 사용자가 입력한 포인트로 계산을 한다
          if (i===0) {
            // 한번도 사용하지 않은 포인트인 경우
            if (pointInfos[i].dateUsed) {
              const remainingPoints = pointInfos[i].remainingPoints;

              // 기존 포인트 - 사용자가 입력한 포인트(항상 [양수 - 양수] 이기에 그대로 계산 가능)
              let tmp = remainingPoints - pointToUse;

              if(tmp < 0) {
                // ****다음 레코드에서 포인트를 계산을 하기 위해 pointInfos[i] 배열에 값을 대입한다. **** //
                // 포인트를 계산한 값
                pointInfos[i].usePoint = tmp;
                // 포인트를 전부 사용했기에 원래 가지고 있던 포인트 대입(화면 노출)
                pointInfos[i].dspUsePoint = remainingPoints;
                // 포인트 업데이트
                updatePoint(pointInfos[i]._id, remainingPoints, tmp, 0, currentDate);
                
              } else {
                // 포인트 업데이트
                updatePoint(pointInfos[i]._id, pointToUse, tmp, tmp, currentDate);
                // [기존 포인트 > 사용자가 입력한 포인트] 인 경우 포인트계산 종료
                break;
              }
            // 한번이상 사용해서 남은 잔 포인트가 있는 경우
            } else {
              // 기존 레코드의 나머지 금액을 0으로 업데이트
              Point.findOneAndUpdate(
                { _id: pointInfos[i]._id },
                { $set: { remainingPoints: 0 }},
                { new: true },
                (err, pointInfo) => {
                  if(err) {
                    console.log(err);
                    return false;
                  }
                }
              )

              // 기존 레코드를 복사
              let dataToSubmit = {
                seq: pointInfos[i].seq,
                subSeq: pointInfos[i].subSeq + 1,
                userId: pointInfos[i].userId,
                userName: pointInfos[i].userName,
                userLastName: pointInfos[i].userLastName,
                point: pointInfos[i].point,
                validFrom: pointInfos[i].validFrom,
                validTo: pointInfos[i].validTo
              }
              
              const remainingPoints = pointInfos[i].remainingPoints;
              // 기존 포인트 - 사용자가 입력한 포인트
              let tmp = remainingPoints - pointToUse; 

              if(tmp < 0) {
                // 가지고 온 포인트 정보의 사용자 포인트를 계산된 값으로 수정
                pointInfos[i].usePoint = tmp;

                dataToSubmit.usePoint = tmp;
                dataToSubmit.dspUsePoint = remainingPoints;
                dataToSubmit.remainingPoints = 0;
                dataToSubmit.dateUsed = currentDate;

                // 포인트 등록
                const point = new Point(dataToSubmit);
                point.save((err, doc) => {
                  if(err) {
                    console.log(err);
                    return false;
                  }
                });
              } else {
                dataToSubmit.usePoint = tmp;
                dataToSubmit.dspUsePoint = pointToUse;
                dataToSubmit.remainingPoints = tmp;
                dataToSubmit.dateUsed = currentDate;

                // 포인트 등록
                const point = new Point(dataToSubmit);
                point.save((err, doc) => {
                  if(err) {
                    console.log(err);
                    return false;
                  }
                });

                // [기존 포인트 > 사용자가 입력한 포인트] 인 경우 포인트계산 종료
                break;
              }    
            }
          } else {
            let usePoint = Math.abs(pointInfos[i-1].usePoint);
            let remainingPoints = pointInfos[i].remainingPoints;

            let tmp = 0;
            // 전 레코드의 usePoint: 음수, 현재 레코드의 point: 양수 <- 이 조건만 있을수 있다  
            if (usePoint <= remainingPoints) {
              tmp = remainingPoints - usePoint; // 포인트가 남거나 0이 되기때문에 현재 레코드에서 계산이 종료되는 경우
            } else {
              tmp = (usePoint - remainingPoints) * -1; // 포인트가 부족해서 다음 레코드에서 계산을 해야 하는경우
            }
              
            if(tmp < 0) {
              // 전 레코드의 계산된 포인트로 가지고 온 포인트 정보의 사용자 포인트를 계산된 값으로 수정
              pointInfos[i].usePoint = tmp;
              // 포인트 업데이트
              updatePoint(pointInfos[i]._id, remainingPoints, tmp, 0, currentDate);
            } else {
              // 포인트 업데이트
              updatePoint(pointInfos[i]._id, usePoint, tmp, tmp, currentDate)
              // [기존 포인트 > 사용자가 입력한 포인트] 인 경우 포인트계산 종료
              break;
            }
          }
        }
      }
    });  
  } catch (err) {
    console.log("Payment calcPoint err: ", err);
  }
}

const savePoint  = (dataToSubmit)  => {
  try {
    // 카운트를 중가시키고 포인트 저장
    Counter.findOneAndUpdate(
      { "name": "point" }, { $inc: { "seq": 1 }}, { new: true },
      (err, countInfo) => {
        if(err) {
          console.log(err);
        } else {
          // 포인트의 seq에 카운트에서 가져온 일련번호를 대입해서 포인트를 생성 
          dataToSubmit.seq = countInfo.seq; 
          const point = new Point(dataToSubmit);
          point.save((err, doc) => {
            if (err) console.log(err);
          });
        }
      }
    )
  } catch (err) {
    console.log("Payment savePoint err: ", err);
  }
}

const updatePoint = (tmp1, tmp2, tmp3, tmp4, tmp5) => {
  try {
    Point.findOneAndUpdate(
      { _id: tmp1 },
      { $set: { dspUsePoint: tmp2, usePoint: tmp3, remainingPoints: tmp4, dateUsed: tmp5 }},
      { new: true },
      (err, pointInfo) => {
        if(err) console.log(err);
      }
    )  
  } catch (err) {
    console.log("Payment updatePoint err: ", err); 
  }
}

// Alipay 결제결과 조회
router.post("/alipay/list", (req, res) => {
  try {
    let term = req.body.searchTerm;

    if (term) {
      // Select 값만 들어온 경우(Select는 ""가 될수 없고 날짜는 From To 같이 들어오게 되어 있다)
      if (term[1] === "" && term[2] === "") {
        // term[0] = 0은 전체 검색
        if (term[0] === '0') {
          Alipay.find() // rst:0 (All), 1 (success), rst:2 (fail)
          .sort({ "createdAt": -1 })
          .exec((err, alipayInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, alipayInfo})
          });
        } else {
          Alipay.find({"rst": term[0]})
          .sort({ "createdAt": -1 })
          .exec((err, alipayInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, alipayInfo})
          });
        }  
      }
      // Select, Unique 값만 들어온 경우
      if (term[1] !== "" && term[2] === "") {
        if (term[0] === '0') {
          Alipay.find({ "uniqueField": { $regex: term[1], $options: 'i' }})
          .sort({ "createdAt": -1 })
          .exec((err, alipayInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, alipayInfo})
          });
        } else {
          Alipay.find({"rst":term[0], "uniqueField":{ $regex: term[1], $options: 'i'}})
          .sort({ "createdAt": -1 })
          .exec((err, alipayInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, alipayInfo})
          });
        }
      }
      // Select, Unique, 날짜가 들어온 경우(날짜는 form to가 같이 들어오게 되어 있음)
      if (term[1] !== "" && term[2] !== "") {
        const fromDate = new Date(term[2]).toISOString();
        const toDate = new Date(term[3]).toISOString();

        if (term[0] === '0') {
          Alipay.find
          ({ 
            "uniqueField":{ $regex: term[1], $options: 'i' }, 
            "createdAt":{ $gte: fromDate, $lte: toDate }
          })
          .sort({ "createdAt": -1 })
          .exec((err, alipayInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, alipayInfo})
          });
        } else {
          Alipay.find
          ({ 
            "rst":term[0], 
            "uniqueField":{ $regex: term[1], $options: 'i' }, 
            "createdAt":{ $gte: fromDate, $lte: toDate }
          })
          .sort({ "createdAt": -1 })
          .exec((err, alipayInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, alipayInfo})
          });
        }
      }
      // Unique만 값이 들어오지 않은 경우
      if (term[1] === "" && term[2] !== "") {
        const fromDate = new Date(term[2]).toISOString();
        const toDate = new Date(term[3]).toISOString();

        if (term[0] === '0') {
          Alipay.find({ "createdAt":{ $gte: fromDate, $lte: toDate }})
          .sort({ "createdAt": -1 })
          .exec((err, alipayInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, alipayInfo})
          });
        } else {
          Alipay.find({ "rst":term[0], "createdAt":{ $gte: fromDate, $lte: toDate }})
          .sort({ "createdAt": -1 })
          .exec((err, alipayInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, alipayInfo})
          });
        }
      }
    } else {
      Alipay.find()
      .sort({ "createdAt": -1 })
      .exec((err, alipayInfo) => {
        if (err) return res.status(400).json({success: false, err});
        return res.status(200).json({ success: true, alipayInfo})
      });
    }
  } catch (err) {
    console.log("Payment alipay_list err: ", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});


// Wechat 결제결과 조회
router.post("/wechat/list", (req, res) => {
  try {
    let term = req.body.searchTerm;

    if (term) {
      // Select 값만 들어온 경우(Select는 ""가 될수 없고 날짜는 From To 같이 들어오게 되어 있다)
      if (term[1] === "" && term[2] === "") {
        // term[0] = 0은 전체 검색
        if (term[0] === '0') {
          Wechat.find() // rst:0 (All), 1 (success), rst:2 (fail)
          .sort({ "createdAt": -1 })
          .exec((err, wechatInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, wechatInfo})
          });
        } else {
          Wechat.find({"rst": term[0]})
          .sort({ "createdAt": -1 })
          .exec((err, wechatInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, wechatInfo})
          });
        }  
      }
      // Select, Unique 값만 들어온 경우
      if (term[1] !== "" && term[2] === "") {
        if (term[0] === '0') {
          Wechat.find({ "uniqueField":{ $regex: term[1], $options: 'i' }})
          .sort({ "createdAt": -1 })
          .exec((err, wechatInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, wechatInfo})
          });
        } else {
          Wechat.find({ "rst":term[0], "uniqueField":{ $regex: term[1], $options: 'i' }})
          .sort({ "createdAt": -1 })
          .exec((err, wechatInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, wechatInfo})
          });
        }
      }
      // Select, Unique, 날짜가 들어온 경우(날짜느 form to가 같이 들어오게 되어 있음)
      if (term[1] !== "" && term[2] !== "") {
        const fromDate = new Date(term[2]).toISOString();
        const toDate = new Date(term[3]).toISOString();

        if (term[0] === '0') {
          Wechat.find
          ({ 
            "uniqueField":{ $regex: term[1], $options: 'i' }, 
            "createdAt":{ $gte: fromDate, $lte: toDate }
          })
          .sort({ "createdAt": -1 })
          .exec((err, wechatInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, wechatInfo})
          });
        } else {
          Wechat.find
          ({ 
            "rst":term[0], 
            "uniqueField":{ $regex: term[1], $options: 'i' }, 
            "createdAt":{ $gte: fromDate, $lte: toDate }
          })
          .sort({ "createdAt": -1 })
          .exec((err, wechatInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, wechatInfo})
          });
        }
      }
      // Unique만 값이 들어오지 않은 경우
      if (term[1] === "" && term[2] !== "") {
        const fromDate = new Date(term[2]).toISOString();
        const toDate = new Date(term[3]).toISOString();

        if (term[0] === '0') {
          Wechat.find({ "createdAt":{ $gte: fromDate, $lte: toDate }})
          .sort({ "createdAt": -1 })
          .exec((err, wechatInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, wechatInfo})
          });
        } else {
          Wechat.find({ "rst":term[0], "createdAt":{ $gte: fromDate, $lte: toDate }})
          .sort({ "createdAt": -1 })
          .exec((err, wechatInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, wechatInfo})
          });
        }
      }
    } else {
      Wechat.find()
      .sort({ "createdAt": -1 })
      .exec((err, wechatInfo) => {
        if (err) return res.status(400).json({success: false, err});
        return res.status(200).json({ success: true, wechatInfo})
      });
    }
  } catch (err) {
    console.log("Payment wechat_list err: ", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Alipay 상세조회
router.get('/alipay_by_id', (req, res) => {
  try {
    let alipayId = req.query.id;
    Alipay.find({ _id: alipayId })
    .exec((err, alipay) => {
      if (err) return res.status(400).send(err)
      return res.status(200).send({success: true, alipay});
    })
  } catch (err) {
    console.log("Payment alipay_by_id err: ", err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// Wechat 상세조회
router.get('/wechat_by_id', (req, res) => {
  try {
    let wechatId = req.query.id;
    Wechat.find({ _id: wechatId })
    .exec((err, wechat) => {
      if (err) return res.status(400).send(err)
      return res.status(200).send({success: true, wechat});
    })
  } catch (err) {
    console.log("Payment wechat_by_id err: ", err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// Paypal 관리자 결제결과 조회
router.post('/paypal/admin/list', (req, res) => {
  try {
    let term = req.body.searchTerm;

    if (term) {
      if (term[0] !== "") {
        // 사용자 이름, 날짜값이 들어왔을때
        if (term[1]) {
          const fromDate = new Date(term[1]).toISOString();
          const toDate = new Date(term[2]).toISOString();

          Payment.find
          ({
            "user":{"$elemMatch": {"name": { $regex: term[0], $options: 'i' }}}, 
            "createdAt":{$gte: fromDate, $lte: toDate}
          })
          .sort({ "createdAt": -1 })
          .exec((err, paypalInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, paypalInfo})
          });
        // 사용자 이름만 들어왔을때
        } else {
          Payment.find({ "user":{ "$elemMatch": { "name": { $regex: term[0], $options: 'i' }}}})
          .sort({ "createdAt": -1 })
          .exec((err, paypalInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, paypalInfo})
          });
        }
      } else {
        // 날짜값만 들어왔을때
        if (term[1]) {
          const fromDate = new Date(term[1]).toISOString();
          const toDate = new Date(term[2]).toISOString();

          Payment.find({ "createdAt":{$gte: fromDate, $lte: toDate }})
          .sort({ "createdAt": -1 })
          .exec((err, paypalInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, paypalInfo})
          });
        // 아무런값도 안들어왔을때
        } else {
          Payment.find()
          .sort({ "createdAt": -1 })
          .exec((err, paypalInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, paypalInfo})
          });
        }
      }
    // 조건이 undefined일 경우(초기페이지)
    } else {
      Payment.find()
      .sort({ "createdAt": -1 })
      .exec((err, paypalInfo) => {
        if (err) return res.status(400).json({success: false, err});
        return res.status(200).json({ success: true, paypalInfo})
      });
    }
  } catch (err) {
    console.log("Payment paypal_admin_list err: ", err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// Paypal 일반사용자 결제결과 조회
// 현재는 사용자 이력정보에서 리스트를 보여주고 있어서 사용하지 않음
// router.get('/paypal/list', (req, res) => {
//   try {
//     Payment.find().exec((err, paypalInfo) => {
//       if (err) return res.status(400).json({success: false, err});
//       return res.status(200).send({success: true, paypalInfo});
//     })
//   } catch (err) {
//     console.log(err);
//     return res.status(500).json({ success: false, message: err.message });
//   }
// })

module.exports = router;