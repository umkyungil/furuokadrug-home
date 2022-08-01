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
const { Counter } = require('../models/Point');
const async = require('async');

//=================================
//             Payment
//=================================

// UnivaPayCast Alipay 결제결과 등록
router.get('/alipay/register', async (req, res) => {
  try {
    // UnivaPayCast 사양에 의해 관리페이지의 킥백에 설정한 주소로 
    // 1바이트 문자를 표시하기 위한 조건
    if (!req.query) {
      return res.status(200).json({success: true});
    } else {
      // 결제 성공했을 경우
      if (req.query.rst === "1") {
        // 카트결제인 경우 sod의 포인트값들을 추출
        let pointToUse = 0;
        let productPoint = 0;
        let totalPoint = 0;
        let tmpSod = req.query.sod;
        let tmpArr = tmpSod.split('_');
        if (tmpArr[0].trim() === "cart") {
          pointToUse = Number(tmpArr[1]);
          productPoint = Number(tmpArr[2]);
          totalPoint = Number(tmpArr[3]);

          // 카트에서 결제는 sod에 포인트를 대입했기에 결과값이 날라온 시간으로 변경
          // let date = new Date();
          // req.query.sod = date.toLocaleString('ja-JP'); 
        }

        // Alipay에 결제결과 등록
        const alipay = new Alipay(req.query)
        await alipay.save();

        // 임시 주문정보 가져오기
        const tmpOrderInfo = await TmpOrder.findOne({ uniqueField: req.query.uniqueField });

        // 주문정보 설정
        const body = {
          type: tmpOrderInfo.type,
          userId: tmpOrderInfo.userId,
          name: tmpOrderInfo.name,
          lastName: tmpOrderInfo.lastName,
          tel: tmpOrderInfo.tel,
          email: tmpOrderInfo.email,
          address: tmpOrderInfo.address,
          receiver: tmpOrderInfo.receiver,
          receiverTel: tmpOrderInfo.receiverTel,
          sod: tmpOrderInfo.sod,
          uniqueField: tmpOrderInfo.uniqueField,
          amount: tmpOrderInfo.amount,
          staffName: tmpOrderInfo.staffName,
          paymentStatus: '入金済み',
          deliveryStatus: tmpOrderInfo.deliveryStatus
        }

        // 주문정보 저장
        const order = new Order(body);
        const orderInfo = await order.save();

        // 임시 주문정보 삭제
        await TmpOrder.findOneAndDelete({ uniqueField: req.query.uniqueField });
        
        // 카트 Alipay결제인 경우만 TmpPayment 정보 취득
        let str = req.query.uniqueField;
        let arr = str.split('_');
        if (arr[0].trim() === "cart") {
          // Payment에 저장할 새로운 data정보 셋팅
          let paymentData = [];
          paymentData.push({
            address: {
              city: '未設定',
              country_code: "未設定",
              line1: orderInfo.address,
              postal_code: '未設定',
              recipient_name: orderInfo.receiver,
              state: '未設定',
            },
            cancelled: false,
            email: '未設定',
            paid: true,
            payerID: '未設定',
            paymentID: req.query.pid, // 실제 결제ID
            paymentToken: '未設定',
            returnUrl: '未設定',
          });

          // 카트결제인 경우 uniqueKey에 PaymentId가 들어온다
          const paymentId = arr[1];

          // TmpPayment 가져오기
          const tmpPaymentInfo = await TmpPayment.findOne({ _id: paymentId })

          // 구매상품 모든곳에 Alipay 결제ID 설정
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

          // User의 history paymentId 정보추가 및 포인트 누적
          User.findOneAndUpdate(
            { _id: tmpPaymentInfo.user[0].id },
            { $push: { history: tmpPaymentInfo.product }, $set: { myPoint: totalPoint }},
            { new: true },
            (err, user) => {
              if(err) {
                console.log("user update failed: ", err);
              } else {
                // Payment에 transactionData정보 저장
                const payment = new Payment(transactionData)
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
                          { $inc: { "sold": item.quantity }},
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

          let tmpDate1 = new Date();
          const curDate = new Date(tmpDate1.getTime() - (tmpDate1.getTimezoneOffset() * 60000)).toISOString();
          
          // 입력한 포인트가 있는지 확인
          if(pointToUse > 0) {
            // 해당 사용자의 포인트 가져오기 (남은포인트가 0보다 큰 데이타)
            Point.find({userId: tmpPaymentInfo.user[0].id, remainingPoints: { $gt: 0 }})
              .sort({ "validTo": 1 }) // 유효기간To가 작은것부터 정렬
              .exec((err, pointInfos) => {
                if (err) return res.status(400).json({ success: false });

                for (let i=0; i<pointInfos.length; i++) {
                  // 첫번째 레코드는 사용자가 입력한 포인트로 계산을 한다
                  if (i===0) {
                    // 사용하지 않은 포인트인 경우
                    if (pointInfos[i].dateUsed === '' && pointInfos[i].subSeq === 0) {
                      // [기존 포인트] - [사용자가 입력한 포인트]: 항상 [양수] - [양수] 이기에 그대로 계산 가능
                      let tmp = pointInfos[i].remainingPoints - pointToUse;
                      if(tmp < 0) {
                        // 사용자가 입력한 포인트를 사용한 포인트에 대입
                        pointInfos[i].usePoint = tmp;

                        Point.findOneAndUpdate(
                          { _id: pointInfos[i]._id },
                          { $set: { usePoint: tmp, remainingPoints: 0, dateUsed: curDate }},
                          { new: true },
                          (err, pointInfo) => {
                              if(err) return res.status(400).json({ success: false, err });
                          }
                        )
                      } else {
                        Point.findOneAndUpdate(
                          { _id: pointInfos[i]._id },
                          { $set: { usePoint: tmp, remainingPoints: tmp, dateUsed: curDate }},
                          { new: true },
                          (err, pointInfo) => {
                              if(err) return res.status(400).json({ success: false, err });
                          }
                        )
                        // [기존 포인트 > 사용자가 입력한 포인트] 이므로 포인트 계산 종료
                        break;
                      }
                    // 한번이상 사용했는데 남은 잔 포인트가 있는 경우
                    } else {
                      // 기존 레코드의 나머지 금액을 0으로 업데이트
                      Point.findOneAndUpdate(
                        { _id: pointInfos[i]._id },
                        { $set: { remainingPoints: 0 }},
                        { new: true },
                        (err, pointInfo) => {
                          if(err) return res.status(400).json({ success: false, err });
                        }
                      )

                      // 기존 레코드를 복사한다
                      let dataToSubmit = {
                        seq: pointInfos[i].seq,
                        subSeq: pointInfos[i].subSeq + 1,
                        userId: pointInfos[i].userId,
                        point: pointInfos[i].point,
                        description: pointInfos[i].description,
                        validFrom: pointInfos[i].validFrom,
                        validTo: pointInfos[i].validTo
                      }
                      
                      // 포인트 계산 [기존 포인트 - 사용자가 입력한 포인트]
                      let tmp = pointInfos[i].remainingPoints - pointToUse;

                      if(tmp < 0) {
                        // 가지고 온 포인트 정보의 사용자 포인트를 계산된 값으로 수정
                        pointInfos[i].usePoint = tmp;
                        dataToSubmit.usePoint = tmp;
                        dataToSubmit.remainingPoints = 0;
                        dataToSubmit.dateUsed = curDate;

                        // 포인트 등록
                        const point = new Point(dataToSubmit);
                        point.save((err, doc) => {
                            if (err) return res.status(400).json({ success: false, err });
                        });
                      } else {
                        dataToSubmit.usePoint = tmp;
                        dataToSubmit.remainingPoints = tmp;
                        dataToSubmit.dateUsed = curDate;

                        // 포인트 등록
                        const point = new Point(dataToSubmit);
                        point.save((err, doc) => {
                            if (err) return res.status(400).json({ success: false, err });
                        });

                        // 기존 포인트 > 사용할 포인트 이므로 포인트 계산 종료
                        break;
                      }    
                    }
                  } else {
                    let usePoint = pointInfos[i-1].usePoint;
                    let remainingPoints = pointInfos[i].remainingPoints;

                    let tmp = 0;
                    // 전 레코드의 usePoint: 음수, 현재 레코드의 point: 양수 <- 이 조건만 있을수 있다  
                    if (Math.abs(usePoint) <= remainingPoints) {
                      tmp = remainingPoints - Math.abs(usePoint); // 포인트가 남거나 0이 되기때문에 현재 레코드에서 계산이 종료되는 경우
                    } else {
                      tmp = (Math.abs(usePoint) - remainingPoints) * -1; // 포인트가 부족해서 다음 레코드에서 계산을 해야 하는경우
                    }
                    
                    if(tmp < 0) {
                      // 계산된 포인트 값으로 수정
                      pointInfos[i].usePoint = tmp;

                      Point.findOneAndUpdate(
                        { _id: pointInfos[i]._id },
                        { $set: { usePoint: tmp, remainingPoints: 0, dateUsed: curDate }},
                        { new: true },
                        (err, pointInfo) => {
                            if(err) return res.status(400).json({ success: false, err });
                        }
                      )
                    } else {
                      Point.findOneAndUpdate(
                        { _id: pointInfos[i]._id },
                        { $set: { usePoint: tmp, remainingPoints: tmp, dateUsed: curDate }},
                        { new: true },
                        (err, pointInfo) => {
                          if(err) return res.status(400).json({ success: false, err });
                        }
                      )

                      // 기존 포인트 > 사용할 포인트 이므로 포인트 계산 종료
                      break;
                    }
                  }
                }
              });
          } else {
            // 포인트 누적할 항목 설정
            let dataToSubmit = {
              userId: req.user._id,
              point: req.body.productPoint, // 구매상품 포인트 합계
              remainingPoints: req.body.productPoint,
              usePoint: 0,
              description: "商品購入",
              validFrom: curDate,
              validTo: oneYearDate,
              dateUsed:''
            }
  
            // 카운트에서 포인트의 일련번호 가져오기
            Counter.findOneAndUpdate(
              { name: "point" },
              { $inc: { "seq": 1 }},
              { new: true },
              (err, countInfo) => {
                if(err) return res.status(400).json({ success: false, err });

                // 포인트의 seq에 카운트에서 가져온 일련번호를 대입해서 포인트를 생성 
                dataToSubmit.seq = countInfo.seq; 
                const point = new Point(dataToSubmit);
                point.save((err, doc) => {
                    if (err) return res.status(400).json({ success: false, err });
                });
              }
            );
          }
        }
      } else {
        // 임시 주문정보 삭제
        // await TmpOrder.findOneAndDelete({ uniqueField: req.query.uniqueField });

        // 카트 AliPay결제인 경우 임시 계약정보 삭제
        // let str = req.query.uniqueField;
        // let arr = str.split('_');
        // if (arr[0].trim() === "cart") {
        //   // 임시 계약정보 삭제 (uniqueKey의 PaymentId를 사용)
        //   const paymentId = arr[1];
        //   const paymentInfo = await TmpPayment.findOneAndDelete({ _id: paymentId })
        // }

        // Batch에서 임시 주문정보 및 임시 계약정보를 삭제한다.
        console.log("Alipay payment failed.");
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  } 
})

// UnivaPayCast Wechat결제결과 등록
router.get('/wechat/register', async (req, res) => {
  try {
    // UnivaPayCast 사양에 의해 관리페이지의 킥백에 설정한 주소로
    // 1바이트 문자를 표시하기 위한 조건
    if (!req.query) {
      return res.status(200).json({success: true});
    } else {
      // 결제 성공했을 경우
      if (req.query.rst === "1") {
        // 카트결제인 경우 sod의 포인트값들을 추출
        let pointToUse = 0;
        let productPoint = 0;
        let totalPoint = 0;
        let tmpSod = req.query.sod;
        let tmpArr = tmpSod.split('_');
        if (tmpArr[0].trim() === "cart") {
          pointToUse = Number(tmpArr[1]);
          productPoint = Number(tmpArr[2]);
          totalPoint = Number(tmpArr[3]);

          // 카트에서 결제는 sod에 포인트를 대입했기에 결과값이 날라온 시간으로 변경
          // let date = new Date();
          // req.query.sod = date.toLocaleString('ja-JP'); 
        }
        
		    // Wechat에 결제결과 등록
        const wechat = new Wechat(req.query);
        await wechat.save();

        // 임시 주문정보 가져오기
        const tmpOrderInfo = await TmpOrder.findOne({ uniqueField: req.query.uniqueField });

        // 주문정보 설정
        const body = {
          type: tmpOrderInfo.type,
          userId: tmpOrderInfo.userId,
          name: tmpOrderInfo.name,
          lastName: tmpOrderInfo.lastName,
          tel: tmpOrderInfo.tel,
          email: tmpOrderInfo.email,
          address: tmpOrderInfo.address,
          receiver: tmpOrderInfo.receiver,
          receiverTel: tmpOrderInfo.receiverTel,
          sod: tmpOrderInfo.sod,
          uniqueField: tmpOrderInfo.uniqueField,
          amount: tmpOrderInfo.amount,
          staffName: tmpOrderInfo.staffName,
          paymentStatus: '入金済み',
          deliveryStatus: tmpOrderInfo.deliveryStatus
        }

        // 주문정보 저장
        const order = new Order(body);
        const orderInfo = await order.save();

        // 임시 주문정보 삭제
        await TmpOrder.findOneAndDelete({ uniqueField: req.query.uniqueField });

        // 카트 WeChat결제인 경우만 TmpPayment 정보 취득
        let str = req.query.uniqueField;
        let arr = str.split('_');
        if (arr[0].trim() === "cart") {
          // Payment에 저장할 새로운 data정보 셋팅
          let paymentData = [];
          paymentData.push({
            address: {
              city: '未設定',
              country_code: "未設定",
              line1: orderInfo.address,
              postal_code: '未設定',
              recipient_name: orderInfo.receiver,
              state: '未設定',
            },
            cancelled: false,
            email: '未設定',
            paid: true,
            payerID: '未設定',
            paymentID: req.query.pid, // 실제 결제ID
            paymentToken: '未設定',
            returnUrl: '未設定',
          });

          // 카트결제인 경우만 uniqueKey에 PaymentId가 들어온다
          const paymentId = arr[1];

          // TmpPayment 가져오기
          const tmpPaymentInfo = await TmpPayment.findOne({ _id: paymentId })

          // 구매상품 모든곳에 WeChat 결제ID 설정
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

          // User의 history paymentId 정보추가 및 포인트 누적
          User.findOneAndUpdate(
            { _id: tmpPaymentInfo.user[0].id },
            { $push: { history: tmpPaymentInfo.product }, $set: { myPoint: totalPoint }},
            { new: true },
            (err, user) => {
              if(err) {
                console.log("user update failed: ", err);
              } else {
                // Payment에 transactionData 정보 저장
                const payment = new Payment(transactionData)
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
                          { $inc: { "sold": item.quantity }},
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

          let tmpDate1 = new Date();
          const curDate = new Date(tmpDate1.getTime() - (tmpDate1.getTimezoneOffset() * 60000)).toISOString();
          
          // 입력한 포인트가 있는지 확인
          if(pointToUse > 0) {
            // 해당 사용자의 포인트 가져오기 (남은포인트가 0보다 큰 데이타)
            Point.find({userId: tmpPaymentInfo.user[0].id, remainingPoints: { $gt: 0 }})
              .sort({ "validTo": 1 }) // 유효기간To가 작은것부터 정렬
              .exec((err, pointInfos) => {
                if (err) return res.status(400).json({ success: false });

                for (let i=0; i<pointInfos.length; i++) {
                  // 첫번째 레코드는 사용자가 입력한 포인트로 계산을 한다
                  if (i===0) {
                    // 사용하지 않은 포인트인 경우
                    if (pointInfos[i].dateUsed === '' && pointInfos[i].subSeq === 0) {
                      // [기존 포인트] - [사용자가 입력한 포인트]: 항상 [양수] - [양수] 이기에 그대로 계산 가능
                      let tmp = pointInfos[i].remainingPoints - pointToUse;
                      if(tmp < 0) {
                        // 사용자가 입력한 포인트를 사용한 포인트에 대입
                        pointInfos[i].usePoint = tmp;

                        Point.findOneAndUpdate(
                          { _id: pointInfos[i]._id },
                          { $set: { usePoint: tmp, remainingPoints: 0, dateUsed: curDate }},
                          { new: true },
                          (err, pointInfo) => {
                              if(err) return res.status(400).json({ success: false, err });
                          }
                        )
                      } else {
                        Point.findOneAndUpdate(
                          { _id: pointInfos[i]._id },
                          { $set: { usePoint: tmp, remainingPoints: tmp, dateUsed: curDate }},
                          { new: true },
                          (err, pointInfo) => {
                              if(err) return res.status(400).json({ success: false, err });
                          }
                        )
                        // [기존 포인트 > 사용자가 입력한 포인트] 이므로 포인트 계산 종료
                        break;
                      }
                    // 한번이상 사용했는데 남은 잔 포인트가 있는 경우
                    } else {
                      // 기존 레코드의 나머지 금액을 0으로 업데이트
                      Point.findOneAndUpdate(
                        { _id: pointInfos[i]._id },
                        { $set: { remainingPoints: 0 }},
                        { new: true },
                        (err, pointInfo) => {
                          if(err) return res.status(400).json({ success: false, err });
                        }
                      )

                      // 기존 레코드를 복사한다
                      let dataToSubmit = {
                        seq: pointInfos[i].seq,
                        subSeq: pointInfos[i].subSeq + 1,
                        userId: pointInfos[i].userId,
                        point: pointInfos[i].point,
                        description: pointInfos[i].description,
                        validFrom: pointInfos[i].validFrom,
                        validTo: pointInfos[i].validTo
                      }
                      
                      // 포인트 계산 [기존 포인트 - 사용자가 입력한 포인트]
                      let tmp = pointInfos[i].remainingPoints - pointToUse;

                      if(tmp < 0) {
                        // 가지고 온 포인트 정보의 사용자 포인트를 계산된 값으로 수정
                        pointInfos[i].usePoint = tmp;
                        dataToSubmit.usePoint = tmp;
                        dataToSubmit.remainingPoints = 0;
                        dataToSubmit.dateUsed = curDate;

                        // 포인트 등록
                        const point = new Point(dataToSubmit);
                        point.save((err, doc) => {
                            if (err) return res.status(400).json({ success: false, err });
                        });
                      } else {
                        dataToSubmit.usePoint = tmp;
                        dataToSubmit.remainingPoints = tmp;
                        dataToSubmit.dateUsed = curDate;

                        // 포인트 등록
                        const point = new Point(dataToSubmit);
                        point.save((err, doc) => {
                            if (err) return res.status(400).json({ success: false, err });
                        });

                        // 기존 포인트 > 사용할 포인트 이므로 포인트 계산 종료
                        break;
                      }    
                    }
                  } else {
                    let usePoint = pointInfos[i-1].usePoint;
                    let remainingPoints = pointInfos[i].remainingPoints;

                    let tmp = 0;
                    // 전 레코드의 usePoint: 음수, 현재 레코드의 point: 양수 <- 이 조건만 있을수 있다  
                    if (Math.abs(usePoint) <= remainingPoints) {
                      tmp = remainingPoints - Math.abs(usePoint); // 포인트가 남거나 0이 되기때문에 현재 레코드에서 계산이 종료되는 경우
                    } else {
                      tmp = (Math.abs(usePoint) - remainingPoints) * -1; // 포인트가 부족해서 다음 레코드에서 계산을 해야 하는경우
                    }
                    
                    if(tmp < 0) {
                      // 계산된 포인트 값으로 수정
                      pointInfos[i].usePoint = tmp;

                      Point.findOneAndUpdate(
                        { _id: pointInfos[i]._id },
                        { $set: { usePoint: tmp, remainingPoints: 0, dateUsed: curDate }},
                        { new: true },
                        (err, pointInfo) => {
                            if(err) return res.status(400).json({ success: false, err });
                        }
                      )
                    } else {
                      Point.findOneAndUpdate(
                        { _id: pointInfos[i]._id },
                        { $set: { usePoint: tmp, remainingPoints: tmp, dateUsed: curDate }},
                        { new: true },
                        (err, pointInfo) => {
                          if(err) return res.status(400).json({ success: false, err });
                        }
                      )

                      // 기존 포인트 > 사용할 포인트 이므로 포인트 계산 종료
                      break;
                    }
                  }
                }
              });
          } else {
            // 포인트 누적할 항목 설정
            let dataToSubmit = {
              userId: req.user._id,
              point: req.body.productPoint, // 구매상품 포인트 합계
              remainingPoints: req.body.productPoint,
              usePoint: 0,
              description: "商品購入",
              validFrom: curDate,
              validTo: oneYearDate,
              dateUsed:''
            }
  
            // 카운트에서 포인트의 일련번호 가져오기
            Counter.findOneAndUpdate(
              { name: "point" },
              { $inc: { "seq": 1 }},
              { new: true },
              (err, countInfo) => {
                if(err) return res.status(400).json({ success: false, err });

                // 포인트의 seq에 카운트에서 가져온 일련번호를 대입해서 포인트를 생성 
                dataToSubmit.seq = countInfo.seq; 
                const point = new Point(dataToSubmit);
                point.save((err, doc) => {
                    if (err) return res.status(400).json({ success: false, err });
                });
              }
            );
          }
        }
      } else {
        // 임시 주문정보 삭제
        // await TmpOrder.findOneAndDelete({ uniqueField: req.query.uniqueField });

        // 카트 WeChat결제인 경우 임시 계약정보 삭제
        // let str = req.query.uniqueField;
        // let arr = str.split('_');
        // if (arr[0].trim() === "cart") {
        //   // 임시 계약정보 삭제 (uniqueKey의 PaymentId를 사용)
        //   const paymentId = arr[1];
        //   const paymentInfo = await TmpPayment.findOneAndDelete({ _id: paymentId })
        // }

        // Batch에서 임시 주문정보 및 임시 계약정보를 삭제한다.
        console.log("WeChat payment failed.");
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

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
          Alipay.find({ "uniqueField":{'$regex':term[1], $options: 'i' }})
          .sort({ "createdAt": -1 })
          .exec((err, alipayInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, alipayInfo})
          });
        } else {
          Alipay.find({"rst":term[0], "uniqueField":{'$regex':term[1], $options: 'i'}})
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
            "uniqueField":{'$regex':term[1], $options: 'i'}, 
            "createdAt":{$gte: fromDate, $lte: toDate }
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
            "uniqueField":{'$regex':term[1], $options: 'i'}, 
            "createdAt":{$gte: fromDate, $lte: toDate }
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
          Alipay.find({ "createdAt":{$gte: fromDate, $lte: toDate }})
          .sort({ "createdAt": -1 })
          .exec((err, alipayInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, alipayInfo})
          });
        } else {
          Alipay.find({ "rst":term[0], "createdAt":{$gte: fromDate, $lte: toDate }})
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
    console.log(err);
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
          Wechat.find({ "uniqueField":{'$regex':term[1], $options: 'i' }})
          .sort({ "createdAt": -1 })
          .exec((err, wechatInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, wechatInfo})
          });
        } else {
          Wechat.find({ "rst":term[0], "uniqueField":{'$regex':term[1], $options: 'i' }})
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
            "uniqueField":{ '$regex':term[1], $options: 'i' }, 
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
            "uniqueField":{ '$regex':term[1], $options: 'i' }, 
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
    console.log(err);
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
    console.log(err);
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
    console.log(err);
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
            "user":{"$elemMatch": {"name": {"$regex": term[0], $options: 'i'}}}, 
            "createdAt":{$gte: fromDate, $lte: toDate}
          })
          .sort({ "createdAt": -1 })
          .exec((err, paypalInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, paypalInfo})
          });
        // 사용자 이름만 들어왔을때
        } else {
          Payment.find({ "user":{ "$elemMatch": { "name": {"$regex": term[0], $options: 'i' }}}})
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
    console.log(err);
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