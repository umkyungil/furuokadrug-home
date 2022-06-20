const express = require('express');
const router = express.Router();
const { Alipay } = require('../models/Alipay');
const { Wechat } = require('../models/Wechat');
const { Order } = require('../models/Order');
const { User } = require('../models/User');
const { Payment } = require('../models/Payment');
const { Product } = require('../models/Product');
const async = require('async');

//=================================
//             Payment
//=================================

// UnivaPayCast Alipay 결제결과 등록
router.get('/alipay/register', async (req, res) => {
  try {
    // UnivaPayCast 사양에 의해 관리페이지의 킥백에 설정한 주소로 1바이트 문자를 표시하기 위한 조건
    if (!req.query) {    
      return res.status(200).json({success: true});
    } else {
      // 결제결과 등록
      const alipay = new Alipay(req.query)
      await alipay.save();

      // 결제 성공했을 경우
      if (req.query.rst === "1") {
        // 주문정보 업데이트
        const orderInfo = await Order.findOneAndUpdate(
          { uniqueField:req.query.uniqueField },
          { paymentStatus: "入金済み" },
          { new: true }
        );
        
        // 카트에서 AliPay결제인 경우만 사용자의 카트정보를 삭제한다.
        let str = req.query.uniqueField;
        let arr = str.split('_');
        if (arr[0].trim() === "cart") {
          let history = [];
          let paymentData = [];
          let transactionData = {};

          // 사용자 정보 가져오기
          let userId = arr[1];
          const userInfo = await User.findOne({ _id: userId });
          let cartInfos = userInfo.cart;

          // 상품아이디만 배열에 담는다
          for (let i=0; i<cartInfos.length; i++) {
            const productInfo = await Product.find({ _id: cartInfos[i].id }).populate("writer");

            // 결제한 카트에 담겼던 상품정보를 history에 넣어줌
            let date = new Date();
            const dateInfo = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
            history.push({
              dateOfPurchase: dateInfo,
              name: productInfo[0].title,
              id: productInfo[0]._id,
              price: productInfo[0].price,
              quantity: cartInfos[i].quantity,
              paymentId: req.query.pid // Alipay Payment ID(pid)
            })
          }

          // data정보(Alipay정보를 Paypal 정보의 항목에 저장)
          paymentData.push({
            paid: req.query.rst,
            cancelled: false,
            payerID: '未設定',
            paymentID: req.query.pid,
            paymentToken: '未設定',
            returnUrl: '未設定',
            address: {
              recipient_name: orderInfo.receiver,
              line1: orderInfo.address,
              city: "",
              state: "",
              postal_code: "",
              country_code: ""
            },
            email: userInfo.email
          })
            
          // user정보
          transactionData.user = {
            id: userInfo._id,
            name: userInfo.name,
            email: userInfo.email,        
          }
          // data정보(Paypal정보를 저장)
          transactionData.data = paymentData;
          // product정보
          transactionData.product = history;

          // User에 history정보 저장 및 Cart정보 삭제
          const userUpdate = await User.findOneAndUpdate(
            {_id: userId},
            { $push: { history: history }, $set: {cart: []}},
            { new: true }
          )

          // Payment에 transactionData정보 저장
          const payment = new Payment(transactionData)
          const paymentSave = await payment.save();

          // Product의 sold 필드 정보 업데이트
          // 상품당 몇개를 샀는지 파악 
          let products = [];
          paymentSave.product.forEach(item => {
            products.push({ id: item.id, quantity: item.quantity })
          })

          // Product에 업데이트
          async.eachSeries(products, (item, callback) => {
            Product.updateOne(
              { _id: item.id },
              { $inc: { "sold": item.quantity }},
              { new: false },
              callback
            )
          }, (err) => {
            if(err) console.log("err: ", err);
          })
        }
      // 결제 실패했을 경우
      } else {
        // 주문정보 업데이트 (실패했을 경우는 카트정보는 삭제하지 않는다.)
        const orderInfo = await Order.findOneAndUpdate(
          { uniqueField:req.query.uniqueField },
          { paymentStatus: "入金失敗" },
          { new: true }
        );
      }

      return res.status(200).json({success: true});
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
      // 결제결과 등록
      const weChat = new Wechat(req.query)
      await weChat.save();

      // 결제 성공했을 경우
      if (req.query.rst === "1") {
        // 주문정보 업데이트
        const orderInfo = await Order.findOneAndUpdate(
          { uniqueField:req.query.uniqueField },
          { paymentStatus: "入金済み" },
          { new: true }
        );
        
        // 카트에서 WeChat결제인 경우만 사용자의 카트정보를 삭제한다.
        let str = req.query.uniqueField;
        let arr = str.split('_');
        if (arr[0].trim() === "cart") {
          let history = [];
          let paymentData = [];
          let transactionData = {};

          // 사용자 정보 가져오기
          let userId = arr[1];
          const userInfo = await User.findOne({ _id: userId });
          let cartInfos = userInfo.cart;

          // 상품아이디만 배열에 담는다
          for (let i=0; i<cartInfos.length; i++) {
            const productInfo = await Product.find({ _id: cartInfos[i].id }).populate("writer");

            // 결제한 카트에 담겼던 상품정보를 history에 넣어줌
            let date = new Date();
            const dateInfo = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
            history.push({
              dateOfPurchase: dateInfo,
              name: productInfo[0].title,
              id: productInfo[0]._id,
              price: productInfo[0].price,
              quantity: cartInfos[i].quantity,
              paymentId: req.query.pid // WeChat Payment ID(pid)
            })
          }

          // data정보(WeChat정보를 Paypal 정보의 항목에 저장)
          paymentData.push({
            paid: req.query.rst,
            cancelled: false,
            payerID: '未設定',
            paymentID: req.query.pid,
            paymentToken: '未設定',
            returnUrl: '未設定',
            address: {
              recipient_name: orderInfo.receiver,
              line1: orderInfo.address,
              city: "",
              state: "",
              postal_code: "",
              country_code: ""
            },
            email: userInfo.email
          })
            
          // user정보
          transactionData.user = {
            id: userInfo._id,
            name: userInfo.name,
            email: userInfo.email,        
          }
          // data정보(Paypal정보를 저장)
          transactionData.data = paymentData;
          // product정보
          transactionData.product = history;

          // User에 history정보 저장 및 Cart정보 삭제
          const userUpdate = await User.findOneAndUpdate(
            {_id: userId},
            { $push: { history: history }, $set: {cart: []}},
            { new: true }
          )

          // Payment에 transactionData정보 저장
          const payment = new Payment(transactionData)
          const paymentSave = await payment.save();

          // Product의 sold 필드 정보 업데이트
          // 상품당 몇개를 샀는지 파악 
          let products = [];
          paymentSave.product.forEach(item => {
            products.push({ id: item.id, quantity: item.quantity })
          })

          // Product에 업데이트
          async.eachSeries(products, (item, callback) => {
            Product.updateOne(
              { _id: item.id },
              { $inc: { "sold": item.quantity }},
              { new: false },
              callback
            )
          }, (err) => {
            if(err) console.log("err: ", err);
          })
        }
      // 결제 실패했을 경우
      } else {
        // 주문정보 업데이트 (실패했을 경우는 카트정보는 삭제하지 않는다.)
        const orderInfo = await Order.findOneAndUpdate(
          { uniqueField:req.query.uniqueField },
          { paymentStatus: "入金失敗" },
          { new: true }
        );
      }

      return res.status(200).json({success: true});
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