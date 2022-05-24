const express = require('express');
const router = express.Router();
const { Alipay } = require('../models/Alipay');
const { Wechat } = require('../models/Wechat');
const { Order } = require('../models/Order');
const { Payment } = require('../models/Payment');
const moment = require("moment");

//=================================
//             Payment
//=================================

// UnivaPayCast Alipay 결제결과 등록
router.get('/alipay/register', (req, res) => {
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
})

// UnivaPayCast Wechat결제결과 등록
router.get('/wechat/register', (req, res) => {
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
})

// Alipay 결제결과 조회
router.post("/alipay/list", (req, res) => {
  let term = req.body.searchTerm;

  if (term) {
    // Select 값만 들어온 경우(Select는 ""가 될수 없고 날짜는 From To 같이 들어오게 되어 있다)
    if (term[1] === "" && term[2] === "") {
      // term[0] = 0은 전체 검색
      if (term[0] === '0') {
        Alipay.find() // rst:0 (All), 1 (success), rst:2 (fail)
        .skip(req.body.skip)
        .exec((err, alipayInfo) => {
          if (err) return res.status(400).json({success: false, err});
          return res.status(200).json({ success: true, alipayInfo})
        });
      } else {
        Alipay.find({"rst": term[0]})
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
        Alipay.find({"uniqueField":{'$regex':term[1], $options: 'i'}}) // $options: 'i' : 대소문자 구분 안함
        .skip(req.body.skip)
        .exec((err, alipayInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, alipayInfo})
        });
      } else {
        Alipay.find({"rst":term[0], "uniqueField":{'$regex':term[1], $options: 'i'}})
        .skip(req.body.skip)
        .exec((err, alipayInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, alipayInfo})
        });
      }
    }
    // Select, Unique, 날짜가 들어온 경우(날짜느 form to가 같이 들어오게 되어 있음)
    if (term[1] !== "" && term[2] !== "") {
      if (term[0] === '0') {
        Alipay.find(
          {"uniqueField":{'$regex':term[1], $options: 'i'}, "createdAt":{$gte: moment(term[2]).toDate()}, $lte: moment(term[3]).toDate()}
        )
        .skip(req.body.skip)
        .exec((err, alipayInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, alipayInfo})
        });
      } else {
        Alipay.find(
          {"rst":term[0], "uniqueField":{'$regex':term[1], $options: 'i'}, 
          "createdAt":{$gte: moment(term[2]).toDate()}, $lte: moment(term[3]).toDate()}
        )
        .skip(req.body.skip)
        .exec((err, alipayInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, alipayInfo})
        });
      }
    }
    // Unique만 값이 들어오지 않은 경우
    if (term[1] === "" && term[2] !== "") {
      if (term[0] === '0') {
        // moment(term[2]).toDate():  2022-01-01T08:29:00.000Z
        Alipay.find({"createdAt":{$gte: moment(term[2]).toDate()}, $lte: moment(term[3]).toDate()})
        .skip(req.body.skip)
        .exec((err, alipayInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, alipayInfo})
        });
      } else {
        Alipay.find({"rst":term[0], "createdAt":{$gte: moment(term[2]).toDate()}, $lte: moment(term[3]).toDate()})
        .skip(req.body.skip)
        .exec((err, alipayInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, alipayInfo})
        });
      }
    }
  } else {
    Alipay.find()
      .skip(req.body.skip)
      .exec((err, alipayInfo) => {
          if (err) return res.status(400).json({success: false, err});
          return res.status(200).json({ success: true, alipayInfo})
      });
  }  
});


// Wechat 결제결과 조회
router.post("/wechat/list", (req, res) => {
  let term = req.body.searchTerm;

  if (term) {
    // Select 값만 들어온 경우(Select는 ""가 될수 없고 날짜는 From To 같이 들어오게 되어 있다)
    if (term[1] === "" && term[2] === "") {
      // term[0] = 0은 전체 검색
      if (term[0] === '0') {
        Wechat.find() // rst:0 (All), 1 (success), rst:2 (fail)
        .skip(req.body.skip)
        .exec((err, wechatInfo) => {
          if (err) return res.status(400).json({success: false, err});
          return res.status(200).json({ success: true, wechatInfo})
        });
      } else {
        Wechat.find({"rst": term[0]})
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
        Wechat.find({"uniqueField":{'$regex':term[1], $options: 'i'}}) // $options: 'i' : 대소문자 구분 안함
        .skip(req.body.skip)
        .exec((err, wechatInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, wechatInfo})
        });
      } else {
        Wechat.find({"rst":term[0], "uniqueField":{'$regex':term[1], $options: 'i'}})
        .skip(req.body.skip)
        .exec((err, wechatInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, wechatInfo})
        });
      }
    }
    // Select, Unique, 날짜가 들어온 경우(날짜느 form to가 같이 들어오게 되어 있음)
    if (term[1] !== "" && term[2] !== "") {
      if (term[0] === '0') {
        Wechat.find(
          {"uniqueField":{'$regex':term[1], $options: 'i'}, "createdAt":{$gte: moment(term[2]).toDate()}, $lte: moment(term[3]).toDate()}
        )
        .skip(req.body.skip)
        .exec((err, wechatInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, wechatInfo})
        });
      } else {
        Wechat.find(
          {"rst":term[0], "uniqueField":{'$regex':term[1], $options: 'i'}, 
          "createdAt":{$gte: moment(term[2]).toDate()}, $lte: moment(term[3]).toDate()}
        )
        .skip(req.body.skip)
        .exec((err, wechatInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, wechatInfo})
        });
      }
    }
    // Unique만 값이 들어오지 않은 경우
    if (term[1] === "" && term[2] !== "") {
      if (term[0] === '0') {
        // moment(term[2]).toDate():  2022-01-01T08:29:00.000Z
        Wechat.find({"createdAt":{$gte: moment(term[2]).toDate()}, $lte: moment(term[3]).toDate()})
        .skip(req.body.skip)
        .exec((err, wechatInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, wechatInfo})
        });
      } else {
        Wechat.find({"rst":term[0], "createdAt":{$gte: moment(term[2]).toDate()}, $lte: moment(term[3]).toDate()})
        .skip(req.body.skip)
        .exec((err, wechatInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, wechatInfo})
        });
      }
    }
  } else {
    Wechat.find()
    .skip(req.body.skip)
    .exec((err, wechatInfo) => {
        if (err) return res.status(400).json({success: false, err});
        return res.status(200).json({ success: true, wechatInfo})
    });
  }  
});

// Alipay 상세조회
router.get('/alipay_by_id', (req, res) => {
  let alipayId = req.query.id;
  Alipay.find({ _id: alipayId })
      .exec((err, alipay) => {
          if (err) return res.status(400).send(err)
          return res.status(200).send({success: true, alipay});
      })
})

// Wechat 상세조회
router.get('/wechat_by_id', (req, res) => {
  let wechatId = req.query.id;
  Wechat.find({ _id: wechatId })
      .exec((err, wechat) => {
          if (err) return res.status(400).send(err)
          return res.status(200).send({success: true, wechat});
      })
})

// Paypal 결제결과 조회
router.get('/paypal/list', (req, res) => {
  Payment.find().exec((err, paypalInfo) => {
    if (err) return res.status(400).json({success: false, err});
      return res.status(200).send({success: true, paypalInfo});
  })
})

module.exports = router;