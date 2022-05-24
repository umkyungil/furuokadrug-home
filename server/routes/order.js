const express = require('express');
const router = express.Router();
const { Order } = require('../models/Order');
const { User } = require('../models/User');
const { Alipay } = require('../models/Alipay');
const { Wechat } = require('../models/Wechat');

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
  const userId = req.body.id;
  const mode = req.body.mode;
  const userName = req.body.userName;
    
  if (userId !== "") {
    // 사용자 정보 검색
    User.findOne({ _id: userId }, function(err, result) {
      if (err) {
        console.log("err: ", err);
        return res.status(400).json({success: false, err});
      }

      // 관리자인 경우
      if (result.role === 2) {
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
      // 스텝인 경우
      } else if (result.role === 1) {
        console.log("mode: ", mode);

        if (mode === true) {
          Order.find({ "staffName": { '$regex': userName },})
            .skip(req.body.skip)
            .exec((err, orderInfo) => {
              if (err) return res.status(400).json({success: false, err});
              return res.status(200).json({ success: true, orderInfo})
            });
        } else {
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
        }
      // 일반 사용자인 경우(자신이 구매한 상품만 취득)
      } else {
        if (term) {
          Order.find({ "userId": userId, "name": { '$regex': term } })
          .exec((err, orderInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, orderInfo})
          });
        } else {
          Order.find({ "userId": userId })
          .exec((err, orderInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, orderInfo})
          });
        }
      }
    })
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

// 주문정보 삭제
router.post('/delete', (req, res) => {
  let orderId = req.body.orderId;
  let uniqueField = req.body.uniqueField;
  let type = req.body.type;
  
  Order.remove({ _id: orderId })
    .exec((err, order) => {
        if (err) return res.status(400).send(err);

        // 결제정보 삭제
        if (type === "Alipay") {
          Alipay.remove({ uniqueField: uniqueField }, function(err, alipay) {
            if (err) return res.status(400).json({success: false, err});
            console.log("Alipay remove success");
          })          
        } else if (type === "Wechat") {
          Wechat.remove({ uniqueField: uniqueField }, function(err, wechat) {
            if (err) return res.status(400).json({success: false, err});
            console.log("Wechat remove success");
          })          
        }
        return res.status(200).send({success: true, order});
    })
})

module.exports = router;