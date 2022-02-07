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

  // Alipay Collection에 들어 있는 모든정보 가져오기
  if (term) {
    Alipay.find({ "uniqueField": { '$regex': term },})
    .skip(req.body.skip)
    .exec((err, alipayInfo) => {
        if (err) return res.status(400).json({success: false, err});
        return res.status(200).json({ success: true, alipayInfo})
    });
  } else {
    Alipay.find().exec((err, alipayInfo) => {
      if (err) return res.status(400).json({success: false, err});
      return res.status(200).json({ success: true, alipayInfo})
    });
  }  
});

// Wechat 결제결과 조회
router.post("/wechat/list", (req, res) => {
  let term = req.body.searchTerm;

  // Wechat Collection에 들어 있는 모든정보 가져오기
  if (term) {
    Wechat.find({ "uniqueField": { '$regex': term },})
    .skip(req.body.skip)
    .exec((err, wechatInfo) => {
        if (err) return res.status(400).json({success: false, err});
        return res.status(200).json({ success: true, wechatInfo})
    });
  } else {
    Alipay.find().exec((err, wechatInfo) => {
      if (err) return res.status(400).json({success: false, err});
      return res.status(200).json({ success: true, wechatInfo})
    });
  }  
});

module.exports = router;