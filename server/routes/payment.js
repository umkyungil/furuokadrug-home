const express = require('express');
const router = express.Router();
const {Alipay} = require('../models/Alipay');
const {Wechat} = require('../models/Wechat');
const url = require('url');

//=================================
//             Payment
//=================================

// UnivaPayCast를 통한 Alipay결제결과 등록
router.get('/alipay/register', (req, res) => {
  const alipay = new Alipay(req.query)
  alipay.save((err) => {
    if (err) return res.status(400).json({success: false, err})
    return res.status(200).json({success: true});
  })
})

// UnivaPayCast를 통한 Wechat결제결과 등록
router.get('/wechat/register', (req, res) => {
  const wechat = new Wechat(req.query)
  wechat.save((err) => {
    if (err) return res.status(400).json({success: false, err})
    return res.status(200).json({success: true});
  })
})

// Alipay 결제결과 조회
router.post("/alipay/list", (req, res) => {
  let term = req.body.searchTerm;
  
  //find({createdAt: {$gt: moment('2020-05-03 21:13:04').toDate(), $lt: moment('2020-05-03 21:13:06').toDate()}})


  if (term) {
    if (Number(term[0]) === 0 && term[1] === "") {
      Alipay.find().exec((err, alipayInfo) => {        
        if (err) return res.status(400).json({success: false, err});
        return res.status(200).json({ success: true, alipayInfo})
      })
    }
    
    if (Number(term[0]) === 0 && term[1] != "") {
      Alipay.find({ "uniqueField":{'$regex':term[1]}})
      .skip(req.body.skip)
      .exec((err, alipayInfo) => {
          if (err) return res.status(400).json({success: false, err});
          return res.status(200).json({ success: true, alipayInfo})
      });
    }

    if (Number(term[0]) > 0 && term[1] === "") {
      Alipay.find({"rst":term[0]})
      .skip(req.body.skip)
      .exec((err, alipayInfo) => {
          if (err) return res.status(400).json({success: false, err});
          return res.status(200).json({ success: true, alipayInfo})
      });
    }

    if (Number(term[0]) > 0 && term[1] != "") {
      Alipay.find({ "rst":term[0], "uniqueField":{'$regex':term[1]}})
      .skip(req.body.skip)
      .exec((err, alipayInfo) => {
          if (err) return res.status(400).json({success: false, err});
          return res.status(200).json({ success: true, alipayInfo})
      });
    }
  } else {
    Alipay.find().exec((err, alipayInfo) => {
      if (err) return res.status(400).json({success: false, err});
      return res.status(200).json({ success: true, alipayInfo})
    })
  }
});


// Wechat 결제결과 조회
router.post("/wechat/list", (req, res) => {
  let term = req.body.searchTerm;

  if (term) {
    if (Number(term[0]) === 0 && term[1] === "") {
      console.log("full search");

      Wechat.find().exec((err, wechatInfo) => {
        if (err) return res.status(400).json({success: false, err});
        return res.status(200).json({ success: true, wechatInfo})
      })
    }
    
    if (Number(term[0]) === 0 && term[1] != "") {
      Wechat.find({ "uniqueField":{'$regex':term[1]}})
      .skip(req.body.skip)
      .exec((err, wechatInfo) => {
          if (err) return res.status(400).json({success: false, err});
          return res.status(200).json({ success: true, wechatInfo})
      });
    }

    if (Number(term[0]) > 0 && term[1] === "") {
      Wechat.find({"rst":term[0]})
      .skip(req.body.skip)
      .exec((err, wechatInfo) => {
          if (err) return res.status(400).json({success: false, err});
          return res.status(200).json({ success: true, wechatInfo})
      });
    }

    if (Number(term[0]) > 0 && term[1] != "") {
      Wechat.find({ "rst":term[0], "uniqueField":{'$regex':term[1]}})
      .skip(req.body.skip)
      .exec((err, wechatInfo) => {
          if (err) return res.status(400).json({success: false, err});
          return res.status(200).json({ success: true, wechatInfo})
      });
    }
  } else {
    Wechat.find().exec((err, wechatInfo) => {
      if (err) return res.status(400).json({success: false, err});
      return res.status(200).json({ success: true, wechatInfo})
    })
  }  
});

module.exports = router;