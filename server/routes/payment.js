const express = require('express');
const router = express.Router();
const {Alipay} = require('../models/Alipay');
const {Wechat} = require('../models/Wechat');
const url = require('url');
const { moveMessagePortToContext } = require('worker_threads');

//=================================
//             Payment
//=================================

// UnivaPayCast를 통한 Alipay결제결과 등록
router.get('/alipay/register', (req, res) => {
  // UnivaPayCast 사양에 의해 관리페이지의 킥백에 설정한 주소로 1바이트 문자를 표시하기 위한 조건
  if (!req.query) {    
    return res.status(200).json({success: true});
  } else {
    const alipay = new Alipay(req.query)
    alipay.save((err) => {
      if (err) return res.status(400).json({success: false, err})
      return res.status(200).json({success: true});
    })
  }  
})

// UnivaPayCast를 통한 Wechat결제결과 등록
router.get('/wechat/register', (req, res) => {
  // UnivaPayCast 사양에 의해 관리페이지의 킥백에 설정한 주소로 1바이트 문자를 표시하기 위한 조건
  if (!req.query) {
    return res.status(200).json({success: true});
  } else {
    const wechat = new Wechat(req.query)
    wechat.save((err) => {
      if (err) return res.status(400).json({success: false, err})
      return res.status(200).json({success: true});
    })
  }
})

// Alipay 결제결과 조회
router.post("/alipay/list", (req, res) => {
  let term = req.body.searchTerm;

  if (term) {
    if (term[1] === "" && term[2] === "" && term[3] === "") {
      Alipay.find({"rst": term[0]})
      .skip(req.body.skip)
      .exec((err, alipayInfo) => {
          if (err) return res.status(400).json({success: false, err});
          return res.status(200).json({ success: true, alipayInfo})
      });
    }
    if (term[1] != "" && term[2] === "" && term[3] === "") {
      Alipay.find({"rst":term[0]},{"uniqueField":{'$regex':term[1]}})
      .skip(req.body.skip)
      .exec((err, alipayInfo) => {
          if (err) return res.status(400).json({success: false, err});
          return res.status(200).json({ success: true, alipayInfo})
      });
    }
    if (term[1] === "" && term[2] != "" && term[3] === "") {
      Alipay.find({"rst":term[0]},{"createdAt":{$gte: moment(term[2]).toDate()}})
      .skip(req.body.skip)
      .exec((err, alipayInfo) => {
          if (err) return res.status(400).json({success: false, err});
          return res.status(200).json({ success: true, alipayInfo})
      });
    }
    if (term[1] === "" && term[2] === "" && term[3] != "") {
      Alipay.find({"rst":term[0]},{"createdAt":{$lte: moment(term[3]).toDate()}})
      .skip(req.body.skip)
      .exec((err, alipayInfo) => {
          if (err) return res.status(400).json({success: false, err});
          return res.status(200).json({ success: true, alipayInfo})
      });
    }
    if (term[1] != "" && term[2] != "" && term[3] === "") {
      Alipay.find({"rst":term[0]},{"uniqueField":{'$regex':term[1]}},{"createdAt":{$gte: moment(term[2]).toDate()}})
      .skip(req.body.skip)
      .exec((err, alipayInfo) => {
          if (err) return res.status(400).json({success: false, err});
          return res.status(200).json({ success: true, alipayInfo})
      });
    }
    if (term[1] != "" && term[2] === "" && term[3] != "") {
      Alipay.find({"rst":term[0]},{"uniqueField":{'$regex':term[1]}},{"createdAt":{$lte: moment(term[3]).toDate()}})
      .skip(req.body.skip)
      .exec((err, alipayInfo) => {
          if (err) return res.status(400).json({success: false, err});
          return res.status(200).json({ success: true, alipayInfo})
      });
    }
    if (term[1] === "" && term[2] != "" && term[3] != "") {
      Alipay.find({"rst":term[0]},{createdAt: {$gte: moment(term[2]).toDate(), $lte: moment(term[3]).toDate()}})
      .skip(req.body.skip)
      .exec((err, alipayInfo) => {
          if (err) return res.status(400).json({success: false, err});
          return res.status(200).json({ success: true, alipayInfo})
      });
    }
    if (term[1] != "" && term[2] != "" && term[3] != "") {
      Alipay.find({"rst":term[0]},{"uniqueField":{'$regex':term[1]}},{createdAt: {$gte: moment(term[2]).toDate(), $lte: moment(term[3]).toDate()}})
      .skip(req.body.skip)
      .exec((err, alipayInfo) => {
          if (err) return res.status(400).json({success: false, err});
          return res.status(200).json({ success: true, alipayInfo})
      });
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
    if (term[1] === "" && term[2] === "" && term[3] === "") {
      Wechat.find({"rst": term[0]})
      .skip(req.body.skip)
      .exec((err, wechatInfo) => {
          if (err) return res.status(400).json({success: false, err});
          return res.status(200).json({ success: true, wechatInfo})
      });
    }
    if (term[1] != "" && term[2] === "" && term[3] === "") {
      Wechat.find({"rst":term[0]},{"uniqueField":{'$regex':term[1]}})
      .skip(req.body.skip)
      .exec((err, wechatInfo) => {
          if (err) return res.status(400).json({success: false, err});
          return res.status(200).json({ success: true, wechatInfo})
      });
    }
    if (term[1] === "" && term[2] != "" && term[3] === "") {
      Wechat.find({"rst":term[0]},{"createdAt":{$gte: moment(term[2]).toDate()}})
      .skip(req.body.skip)
      .exec((err, wechatInfo) => {
          if (err) return res.status(400).json({success: false, err});
          return res.status(200).json({ success: true, wechatInfo})
      });
    }
    if (term[1] === "" && term[2] === "" && term[3] != "") {
      Wechat.find({"rst":term[0]},{"createdAt":{$lte: moment(term[3]).toDate()}})
      .skip(req.body.skip)
      .exec((err, wechatInfo) => {
          if (err) return res.status(400).json({success: false, err});
          return res.status(200).json({ success: true, wechatInfo})
      });
    }
    if (term[1] != "" && term[2] != "" && term[3] === "") {
      Wechat.find({"rst":term[0]},{"uniqueField":{'$regex':term[1]}},{"createdAt":{$gte: moment(term[2]).toDate()}})
      .skip(req.body.skip)
      .exec((err, wechatInfo) => {
          if (err) return res.status(400).json({success: false, err});
          return res.status(200).json({ success: true, wechatInfo})
      });
    }
    if (term[1] != "" && term[2] === "" && term[3] != "") {
      Wechat.find({"rst":term[0]},{"uniqueField":{'$regex':term[1]}},{"createdAt":{$lte: moment(term[3]).toDate()}})
      .skip(req.body.skip)
      .exec((err, wechatInfo) => {
          if (err) return res.status(400).json({success: false, err});
          return res.status(200).json({ success: true, wechatInfo})
      });
    }
    if (term[1] === "" && term[2] != "" && term[3] != "") {
      Wechat.find({"rst":term[0]},{createdAt: {$gte: moment(term[2]).toDate(), $lte: moment(term[3]).toDate()}})
      .skip(req.body.skip)
      .exec((err, wechatInfo) => {
          if (err) return res.status(400).json({success: false, err});
          return res.status(200).json({ success: true, wechatInfo})
      });
    }
    if (term[1] != "" && term[2] != "" && term[3] != "") {
      Wechat.find({"rst":term[0]},{"uniqueField":{'$regex':term[1]}},{createdAt: {$gte: moment(term[2]).toDate(), $lte: moment(term[3]).toDate()}})
      .skip(req.body.skip)
      .exec((err, wechatInfo) => {
          if (err) return res.status(400).json({success: false, err});
          return res.status(200).json({ success: true, wechatInfo})
      });
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

module.exports = router;