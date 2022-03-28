const express = require('express');
const router = express.Router();
const { Order } = require('../models/Order');

//=================================
//             Order
//=================================

// 주문정보 등록
router.post("/register", (req, res) => {
  const order = new Order(req.body);

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

  if (term) {
    Order.find({ "name": { '$regex': term },})
    .skip(req.body.skip)
    .exec((err, orderInfo) => {
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

// 주문정보 상세조회
router.get('/orders_by_id', (req, res) => {
  let orderId = req.query.id;
  
  Order.find({ _id: orderId })
    .exec((err, orders) => {
      if (err) return res.status(400).send(err);
      return res.status(200).send({success: true, orders});
    })
})

// 주문정보 수정
router.get("/deliveryStatus", (req, res) => {
  let orderId = req.query.id;
  const state = "配送手続き完了";

  Order.updateMany(
    { _id: orderId }, 
    { deliveryStatus: state }, 
    (err, doc) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).send({
        success: true
    });
  });
});

module.exports = router;