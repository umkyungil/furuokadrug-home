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
        // 카트결제인 경우 sod의 포인트값을 추출
        let point = 0;
        let tmpStr = req.query.uniqueField;
        let tmpArr = tmpStr.split('_');
        if (tmpArr[0].trim() === "cart") {
          if (req.query.sod) {
            point = Number(req.query.sod);
          }
          // 카트에서 결제는 sod에 포인트를 대입했기에 결과값이 날라온 시간으로 변경
          let date = new Date();
          req.query.sod = date.toLocaleString('ja-JP'); 
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

          // 카트 AliPay결제인 경우만 uniqueKey에 PaymentId가 들어온다
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
            { $push: { history: tmpPaymentInfo.product }, $set: { myPoint: point }},
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
                          {_id: item.id },
                          {
                              $inc: {
                                  "sold": item.quantity
                              }
                          },
                          { new: false },
                          callback
                        )
                      }, (err) => {
                        if(err) {
                          console.log("payment update failed: ", err);
                        } else {
                          console.log("payment update success");
                        }
                      })
                    }
                });            
              } 
            }
        )}
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
    // UnivaPayCast 사양에 의해 관리페이지의 킥백에 설정한 주소로 1바이트 문자를 표시하기 위한 조건
    if (!req.query) {
      return res.status(200).json({success: true});
    } else {
      // 결제 성공했을 경우
      if (req.query.rst === "1") {
        // 카트결제인 경우 sod의 포인트값을 추출
        let point = 0;
        let tmpStr = req.query.uniqueField;
        let tmpArr = tmpStr.split('_');
        if (tmpArr[0].trim() === "cart") {
          if (req.query.sod) {
            point = Number(req.query.sod);
          }
          console.log("point: ", point);
          
          // 카트에서 결제는 sod에 포인트를 대입했기에 결과값이 날라온 시간으로 변경
          let date = new Date();
          req.query.sod = date.toLocaleString('ja-JP'); 
        }
        
		    // Wechat에 결제결과 등록
        const wechat = new Wechat(req.query)
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

          // 카트 WeChat결제인 경우만 uniqueKey에 PaymentId가 들어온다
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
          { $push: { history: tmpPaymentInfo.product }, $set: { myPoint: point }},
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
                        {_id: item.id },
                        {
                            $inc: {
                                "sold": item.quantity
                            }
                        },
                        { new: false },
                        callback
                      )
                    }, (err) => {
                      if(err) {
                        console.log("payment update failed: ", err);
                      } else {
                        console.log("payment update success");
                      }
                    })
                  }
              });            
            } 
          }
        )}
      } else {
        // 임시 주문정보 삭제
        // await TmpOrder.findOneAndDelete({ uniqueField: req.query.uniqueField });

        // 카트 WeChat결제인 경우 임시 계약정보 삭제
        // let str = req.query.uniqueField;
        // let arr = str.split('_');
        // if (arr[0].trim() === "cart") {
        //   const paymentId = arr[1];
        //   const paymentInfo = await TmpPayment.findOneAndDelete({ _id: paymentId })
        // }

        console.log("WeChat payment failed.");
      }
    }
  } catch (err) {
    console.log("WeChat payment failed: ", err);
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