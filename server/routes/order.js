const express = require('express');
const router = express.Router();
const { Order } = require('../models/Order');

//=================================
//             Order
//=================================

// 주문정보 등록
router.post("/register", (req, res) => {
  const order = new Order(req.body);

  console.log("req: ", req.body);

  order.save((err, doc) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
      success: true
    });
  });
});

// 주문정보 조회
router.post("/list", (req, res) => {
  let term = req.body.searchTerm;

  // Order collection의 고객정보 가져오기
  if (term) {
    Order.find({ "name": { '$regex': term },})
    .skip(req.body.skip)
    .exec((err, customerInfo) => {
      if (err) return res.status(400).json({success: false, err});
      return res.status(200).json({ success: true, orderInfo})
    });
  } else {
    Order.find().exec((err, orderInfo) => {
      if (err) return res.status(400).json({success: false, err});
      return res.status(200).json({ success: true, orderInfo})
    });
  }
  
});

module.exports = router;