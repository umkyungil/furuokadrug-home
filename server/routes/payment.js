const express = require('express');
const router = express.Router();
const { Alipay } = require('../models/Alipay');
const { Wechat } = require('../models/Wechat');
const { Order } = require('../models/Order');
const { Payment } = require('../models/Payment');

//=================================
//             Payment
//=================================

// UnivaPayCast Alipay 결제결과 등록
router.get('/alipay/register', (req, res) => {
  try {
    // UnivaPayCast 사양에 의해 관리페이지의 킥백에 설정한 주소로 1바이트 문자를 표시하기 위한 조건
    if (!req.query) {    
      return res.status(200).json({success: true});
    } else {
      // 결제결과 등록
      const alipay = new Alipay(req.query)
      alipay.save((err) => {
        if (err) return res.status(400).json({success: false, err});

        // 주문정보 업데이트
        Order.findOneAndUpdate({ sod:req.query.sod, uniqueField:req.query.uniqueField }, { paymentStatus: "入金済み" }, (err, doc) => {
          if (err) console.log("err: ", err);
          console.log("Alipay order information update successful");
        });

        return res.status(200).json({success: true});
      })
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// UnivaPayCast Wechat결제결과 등록
router.get('/wechat/register', (req, res) => {
  try {
    // UnivaPayCast 사양에 의해 관리페이지의 킥백에 설정한 주소로 1바이트 문자를 표시하기 위한 조건
    if (!req.query) {
      return res.status(200).json({success: true});
    } else {
      // 결제결과 등록
      const wechat = new Wechat(req.query)
      wechat.save((err) => {
        if (err) return res.status(400).json({success: false, err});

        // 주문정보 업데이트
        Order.findOneAndUpdate({ sod:req.query.sod, uniqueField:req.query.uniqueField }, { paymentStatus: "入金済み" }, (err, doc) => {
          if (err) console.log("err: ", err);
          console.log("Wechat order information update successful");
        });

        return res.status(200).json({success: true});
      })
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
          .skip(req.body.skip)
          .exec((err, alipayInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, alipayInfo})
          });
        } else {
          Alipay.find({"rst": term[0]})
          .sort({ "createdAt": -1 })
          .skip(req.body.skip)
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
          .skip(req.body.skip)
          .exec((err, alipayInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, alipayInfo})
          });
        } else {
          Alipay.find({"rst":term[0], "uniqueField":{'$regex':term[1], $options: 'i'}})
          .sort({ "createdAt": -1 })
          .skip(req.body.skip)
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
          .skip(req.body.skip)
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
          .skip(req.body.skip)
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
          .skip(req.body.skip)
          .exec((err, alipayInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, alipayInfo})
          });
        } else {
          Alipay.find({ "rst":term[0], "createdAt":{$gte: fromDate, $lte: toDate }})
          .sort({ "createdAt": -1 })
          .skip(req.body.skip)
          .exec((err, alipayInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, alipayInfo})
          });
        }
      }
    } else {
      Alipay.find()
      .sort({ "createdAt": -1 })
      .skip(req.body.skip)
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
          .skip(req.body.skip)
          .exec((err, wechatInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, wechatInfo})
          });
        } else {
          Wechat.find({"rst": term[0]})
          .sort({ "createdAt": -1 })
          .skip(req.body.skip)
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
          .skip(req.body.skip)
          .exec((err, wechatInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, wechatInfo})
          });
        } else {
          Wechat.find({ "rst":term[0], "uniqueField":{'$regex':term[1], $options: 'i' }})
          .sort({ "createdAt": -1 })
          .skip(req.body.skip)
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
          .skip(req.body.skip)
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
          .skip(req.body.skip)
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
          .skip(req.body.skip)
          .exec((err, wechatInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, wechatInfo})
          });
        } else {
          Wechat.find({ "rst":term[0], "createdAt":{ $gte: fromDate, $lte: toDate }})
          .sort({ "createdAt": -1 })
          .skip(req.body.skip)
          .exec((err, wechatInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, wechatInfo})
          });
        }
      }
    } else {
      Wechat.find()
      .sort({ "createdAt": -1 })
      .skip(req.body.skip)
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
          Payment.find
          ({
            "user":{"$elemMatch": {"name": {"$regex": term[0], $options: 'i'}}}, 
            "createdAt":{$gte: term[1], $lte: term[2]}
          })
          .skip(req.body.skip)
          .exec((err, paypalInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, paypalInfo})
          });
        // 사용자 이름만 들어왔을때
        } else {
          Payment.find({"user":{"$elemMatch": {"name": {"$regex": term[0], $options: 'i'}}}})
          .skip(req.body.skip)
          .exec((err, paypalInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, paypalInfo})
          });
        }
      } else {
        // 날짜값만 들어왔을때
        if (term[1]) {
          Payment.find({"createdAt":{$gte: term[1], $lte: term[2]}})
          .skip(req.body.skip)
          .exec((err, paypalInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, paypalInfo})
          });
        // 아무런값도 안들어왔을때
        } else {
          Payment.find().exec((err, paypalInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, paypalInfo})
          });
        }
      }
    // 조건이 undefined일 경우(초기페이지)
    } else {
      Payment.find().exec((err, paypalInfo) => {
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
router.get('/paypal/list', (req, res) => {
  try {
    Payment.find().exec((err, paypalInfo) => {
      if (err) return res.status(400).json({success: false, err});
      return res.status(200).send({success: true, paypalInfo});
    })
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

module.exports = router;