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
  try {
    const order = new Order(req.body);

    order.save((err, doc) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).json({
        success: true
      });
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 주문정보 조회
router.post("/list", (req, res) => {
  let term = req.body.searchTerm;
  const userId = req.body.id;
  const mode = req.body.mode;
  const userName = req.body.userName;
    
  try {
    // 로그인 사용자 정보 검색
    User.findOne({ _id: userId }, function(err, result) {
      if (err) {
        console.log("err: ", err);
        return res.status(400).json({success: false, err});
      }

      // 관리자인 경우
      if (result.role === 2) {
        // 조건검색(초기페이지는 term=undefined 이기에 조건을 줘야 한다 )
        if (term) {
          // 배달상태 값 변형
          let tmpDelivery = "";
          if (term[0] === "1") {
            tmpDelivery = "配送手続き完了" ;
          } else if(term[0] === "2") {
            tmpDelivery = "未確認" ;
          }

          // Delivery status 값만 들어온 경우
          // Select는 ""가 될수 없고 날짜는 From To가 같이 들어오게 되어 있어서 term[3]의 유무만 체크하면 된다
          if (term[1] === "" && term[2] === "" && term[3] === "") {
            // term[0] = 0은 전체 검색
            if (term[0] === '0') {
              Order.find()
                .sort({ "sod": -1 })
                .skip(req.body.skip)
                .exec((err, orderInfo) => {
                  if (err) return res.status(400).json({success: false, err});
                  return res.status(200).json({ success: true, orderInfo})
                });
            } else {              
              Order.find({ "deliveryStatus": tmpDelivery })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            }
          }
          // Delivery status, User name 값만 들어온 경우
          if (term[1] !== "" && term[2] === "" && term[3] === "") {
            if (term[0] === '0') {
              Order.find({ "name":{'$regex':term[1], $options: 'i' }})
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            } else {
              Order.find
              ({ 
                "deliveryStatus":tmpDelivery, 
                "name":{ '$regex':term[1], $options: 'i' }
              })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            }
          }
          // Delivery status, User name, Staff name 값만 들어온 경우
          if (term[1] !== "" && term[2] !== "" && term[3] === "") {
            if (term[0] === '0') {
              Order.find
              ({ 
                "name":{ '$regex':term[1], $options: 'i' }, 
                "staffName":{ '$regex':term[2], $options: 'i' }
              })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            } else {
              Order.find
              ({
                "deliveryStatus":tmpDelivery, 
                "name":{ '$regex':term[1], $options: 'i' }, 
                "staffName":{ '$regex':term[2], $options: 'i' }
              })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            }
          }
          // 전체 조건값이 들어온 경우
          if (term[1] !== "" && term[2] !== "" && term[3] !== "") {
            let tmpFrom = new Date(term[3]);
						const fromDate = new Date(tmpFrom.getTime() - (tmpFrom.getTimezoneOffset() * 60000)).toISOString();
            let tmpTo = new Date(term[4]);
						const toDate = new Date(tmpTo.getTime() - (tmpTo.getTimezoneOffset() * 60000)).toISOString();

            if (term[0] === '0') {
              Order.find
              ({
                "name":{'$regex':term[1], $options: 'i'}, 
                "staffName":{ '$regex':term[2], $options: 'i' }, 
                "sod":{ $gte: fromDate, $lte: toDate }
              })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            } else {
              Order.find
              ({
                "deliveryStatus":tmpDelivery, 
                "name":{'$regex':term[1], $options: 'i'}, 
                "staffName":{ '$regex':term[2], $options: 'i' }, 
                "sod":{ $gte: fromDate, $lte: fromDate }
              })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            }
          }
          // Delivery status, staff name만 들어온 경우
          if (term[1] === "" && term[2] !== "" && term[3] === "") {
            if (term[0] === '0') {
              Order.find({ "staffName":{ '$regex':term[2], $options: 'i' } })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            } else {
              Order.find
              ({
                "deliveryStatus":tmpDelivery,
                "staffName":{ '$regex':term[2], $options: 'i' }
              })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            }
          }
          // Delivery status, staff name, 결제일만 들어온 경우
          if (term[1] === "" && term[2] !== "" && term[3] !== "") {
            let tmpFrom = new Date(term[3]);
						const fromDate = new Date(tmpFrom.getTime() - (tmpFrom.getTimezoneOffset() * 60000)).toISOString();
            let tmpTo = new Date(term[4]);
						const toDate = new Date(tmpTo.getTime() - (tmpTo.getTimezoneOffset() * 60000)).toISOString();

            if (term[0] === '0') {
              Order.find
              ({  
                "staffName":{ '$regex':term[2], $options: 'i' },
                "sod":{ $gte: fromDate, $lte: toDate }
              })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            } else {
              Order.find
              ({
                "deliveryStatus":tmpDelivery,
                "staffName":{ '$regex':term[2], $options: 'i' },
                "sod":{ $gte: fromDate, $lte: toDate }
              })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            }
          }
          // Delivery status, user name, 결제일만 들어온 경우
          if (term[1] !== "" && term[2] === "" && term[3] !== "") {
            let tmpFrom = new Date(term[3]);
						const fromDate = new Date(tmpFrom.getTime() - (tmpFrom.getTimezoneOffset() * 60000)).toISOString();
            let tmpTo = new Date(term[4]);
						const toDate = new Date(tmpTo.getTime() - (tmpTo.getTimezoneOffset() * 60000)).toISOString();

            if (term[0] === '0') {
              Order.find
              ({  
                "name":{ '$regex':term[1], $options: 'i' },
                "sod":{ $gte: fromDate, $lte: toDate }
              })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            } else {
              Order.find
              ({
                "deliveryStatus":tmpDelivery,
                "name":{ '$regex':term[1], $options: 'i' },
                "sod":{ $gte: fromDate, $lte: toDate }
              })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            }
          }
          // Delivery status, 결제일만 들어온 경우
          if (term[1] === "" && term[2] === "" && term[3] !== "") {
            let tmpFrom = new Date(term[3]);
						const fromDate = new Date(tmpFrom.getTime() - (tmpFrom.getTimezoneOffset() * 60000)).toISOString();
            let tmpTo = new Date(term[4]);
						const toDate = new Date(tmpTo.getTime() - (tmpTo.getTimezoneOffset() * 60000)).toISOString();

            if (term[0] === '0') {
              Order.find({ "sod":{ $gte: fromDate, $lte: toDate }})
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            } else {
              Order.find
              ({
                "deliveryStatus":tmpDelivery,
                "sod":{ $gte: fromDate, $lte: toDate }
              })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            }
          }
        } else {
          Order.find()
          .sort({ "sod": -1 })
          .exec((err, orderInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, orderInfo})
          });
        }
      // 스텝인 경우
      } else if (result.role === 1) {
        // 초기페이지: mode = true
        if (mode === true) {
          // 초기 페이지로 스텝 본인이 담당했던 이력만 검색
          Order.find({ "staffName": { '$regex': userName }})
          .sort({ "sod": -1 })
          .skip(req.body.skip)
          .exec((err, orderInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, orderInfo})
          });
        } else {
          // 조건검색
          if (term) {
            // 배달상태 값 변형
            let tmpDelivery = "";
            if (term[0] === "1") {
              tmpDelivery = "配送手続き完了" ;
            } else if(term[0] === "2") {
              tmpDelivery = "未確認" ;
            }

            // Delivery status 값만 들어온 경우
            // Select는 ""가 될수 없고 날짜는 From To가 같이 들어오게 되어 있어서 term[3]의 유무만 체크하면 된다
            if (term[1] === "" && term[2] === "" && term[3] === "") {
              // term[0] = 0은 전체 검색
              if (term[0] === '0') {
                Order.find()
                .sort({ "sod": -1 })
                .skip(req.body.skip)
                .exec((err, orderInfo) => {
                  if (err) return res.status(400).json({success: false, err});
                  return res.status(200).json({ success: true, orderInfo})
                });
              } else {              
                Order.find({ "deliveryStatus": tmpDelivery })
                .sort({ "sod": -1 })
                .skip(req.body.skip)
                .exec((err, orderInfo) => {
                  if (err) return res.status(400).json({success: false, err});
                  return res.status(200).json({ success: true, orderInfo})
                });
              }
            }
            // Delivery status, User name 값만 들어온 경우
            if (term[1] !== "" && term[2] === "" && term[3] === "") {
              if (term[0] === '0') {
                Order.find({ "name":{'$regex':term[1], $options: 'i' }})
                .sort({ "sod": -1 })
                .skip(req.body.skip)
                .exec((err, orderInfo) => {
                  if (err) return res.status(400).json({success: false, err});
                  return res.status(200).json({ success: true, orderInfo})
                });
              } else {
                Order.find
                ({ 
                  "deliveryStatus":tmpDelivery, 
                  "name":{ '$regex':term[1], $options: 'i' }
                })
                .sort({ "sod": -1 })
                .skip(req.body.skip)
                .exec((err, orderInfo) => {
                  if (err) return res.status(400).json({success: false, err});
                  return res.status(200).json({ success: true, orderInfo})
                });
              }
            }
            // Delivery status, User name, Staff name 값만 들어온 경우
            if (term[1] !== "" && term[2] !== "" && term[3] === "") {
              if (term[0] === '0') {
                Order.find
                ({ 
                  "name":{ '$regex':term[1], $options: 'i' }, 
                  "staffName":{ '$regex':term[2], $options: 'i' }
                })
                .sort({ "sod": -1 })
                .skip(req.body.skip)
                .exec((err, orderInfo) => {
                  if (err) return res.status(400).json({success: false, err});
                  return res.status(200).json({ success: true, orderInfo})
                });
              } else {
                Order.find
                ({
                  "deliveryStatus":tmpDelivery, 
                  "name":{ '$regex':term[1], $options: 'i' }, 
                  "staffName":{ '$regex':term[2], $options: 'i' }
                })
                .sort({ "sod": -1 })
                .skip(req.body.skip)
                .exec((err, orderInfo) => {
                  if (err) return res.status(400).json({success: false, err});
                  return res.status(200).json({ success: true, orderInfo})
                });
              }
            }
            // 전체 조건값이 들어온 경우
            if (term[1] !== "" && term[2] !== "" && term[3] !== "") {
              let tmpFrom = new Date(term[3]);
              const fromDate = new Date(tmpFrom.getTime() - (tmpFrom.getTimezoneOffset() * 60000)).toISOString();
              let tmpTo = new Date(term[4]);
              const toDate = new Date(tmpTo.getTime() - (tmpTo.getTimezoneOffset() * 60000)).toISOString();

              if (term[0] === '0') {
                Order.find
                ({
                  "name":{'$regex':term[1], $options: 'i'}, 
                  "staffName":{ '$regex':term[2], $options: 'i' }, 
                  "sod":{ $gte: fromDate, $lte: toDate }
                })
                .sort({ "sod": -1 })
                .skip(req.body.skip)
                .exec((err, orderInfo) => {
                  if (err) return res.status(400).json({success: false, err});
                  return res.status(200).json({ success: true, orderInfo})
                });
              } else {
                Order.find
                ({
                  "deliveryStatus":tmpDelivery, 
                  "name":{'$regex':term[1], $options: 'i'}, 
                  "staffName":{ '$regex':term[2], $options: 'i' }, 
                  "sod":{ $gte: fromDate, $lte: toDate }
                })
                .sort({ "sod": -1 })
                .skip(req.body.skip)
                .exec((err, orderInfo) => {
                  if (err) return res.status(400).json({success: false, err});
                  return res.status(200).json({ success: true, orderInfo})
                });
              }
            }
            // Delivery status, staff name만 들어온 경우
            if (term[1] === "" && term[2] !== "" && term[3] === "") {
              if (term[0] === '0') {
                Order.find({ "staffName":{ '$regex':term[2], $options: 'i' }})
                .sort({ "sod": -1 })
                .skip(req.body.skip)
                .exec((err, orderInfo) => {
                  if (err) return res.status(400).json({success: false, err});
                  return res.status(200).json({ success: true, orderInfo})
                });
              } else {
                Order.find
                ({
                  "deliveryStatus":tmpDelivery,
                  "staffName":{ '$regex':term[2], $options: 'i' }
                })
                .sort({ "sod": -1 })
                .skip(req.body.skip)
                .exec((err, orderInfo) => {
                  if (err) return res.status(400).json({success: false, err});
                  return res.status(200).json({ success: true, orderInfo})
                });
              }
            }
            // Delivery status, staff name, 결제일만 들어온 경우
            if (term[1] === "" && term[2] !== "" && term[3] !== "") {
              let tmpFrom = new Date(term[3]);
              const fromDate = new Date(tmpFrom.getTime() - (tmpFrom.getTimezoneOffset() * 60000)).toISOString();
              let tmpTo = new Date(term[4]);
              const toDate = new Date(tmpTo.getTime() - (tmpTo.getTimezoneOffset() * 60000)).toISOString();

              if (term[0] === '0') {
                Order.find
                ({  
                  "staffName":{ '$regex':term[2], $options: 'i' },
                  "sod":{ $gte: fromDate, $lte: toDate }
                })
                .sort({ "sod": -1 })
                .skip(req.body.skip)
                .exec((err, orderInfo) => {
                  if (err) return res.status(400).json({success: false, err});
                  return res.status(200).json({ success: true, orderInfo})
                });
              } else {
                Order.find
                ({
                  "deliveryStatus":tmpDelivery,
                  "staffName":{ '$regex':term[2], $options: 'i' },
                  "sod":{ $gte: fromDate, $lte: toDate }
                })
                .sort({ "sod": -1 })
                .skip(req.body.skip)
                .exec((err, orderInfo) => {
                  if (err) return res.status(400).json({success: false, err});
                  return res.status(200).json({ success: true, orderInfo})
                });
              }
            }
            // Delivery status, user name, 결제일만 들어온 경우
            if (term[1] !== "" && term[2] === "" && term[3] !== "") {
              let tmpFrom = new Date(term[3]);
              const fromDate = new Date(tmpFrom.getTime() - (tmpFrom.getTimezoneOffset() * 60000)).toISOString();
              let tmpTo = new Date(term[4]);
              const toDate = new Date(tmpTo.getTime() - (tmpTo.getTimezoneOffset() * 60000)).toISOString();

              if (term[0] === '0') {
                Order.find
                ({  
                  "name":{ '$regex':term[1], $options: 'i' },
                  "sod":{ $gte: fromDate, $lte: toDate }
                })
                .sort({ "sod": -1 })
                .skip(req.body.skip)
                .exec((err, orderInfo) => {
                  if (err) return res.status(400).json({success: false, err});
                  return res.status(200).json({ success: true, orderInfo})
                });
              } else {
                Order.find
                ({
                  "deliveryStatus":tmpDelivery,
                  "name":{ '$regex':term[1], $options: 'i' },
                  "sod":{ $gte: fromDate, $lte: toDate }
                })
                .sort({ "sod": -1 })
                .skip(req.body.skip)
                .exec((err, orderInfo) => {
                  if (err) return res.status(400).json({success: false, err});
                  return res.status(200).json({ success: true, orderInfo})
                });
              }
            }
            // Delivery status, 결제일만 들어온 경우
            if (term[1] === "" && term[2] === "" && term[3] !== "") {
              let tmpFrom = new Date(term[3]);
              const fromDate = new Date(tmpFrom.getTime() - (tmpFrom.getTimezoneOffset() * 60000)).toISOString();
              let tmpTo = new Date(term[4]);
              const toDate = new Date(tmpTo.getTime() - (tmpTo.getTimezoneOffset() * 60000)).toISOString();

              if (term[0] === '0') {
                Order.find({ "sod":{ $gte: fromDate, $lte: toDate }})
                .sort({ "sod": -1 })
                .skip(req.body.skip)
                .exec((err, orderInfo) => {
                  if (err) return res.status(400).json({success: false, err});
                  return res.status(200).json({ success: true, orderInfo})
                });
              } else {
                Order.find
                ({
                  "deliveryStatus":tmpDelivery,
                  "sod":{ $gte: fromDate, $lte: toDate }
                })
                .sort({ "sod": -1 })
                .skip(req.body.skip)
                .exec((err, orderInfo) => {
                  if (err) return res.status(400).json({success: false, err});
                  return res.status(200).json({ success: true, orderInfo})
                });
              }
            }
          // 초기페이지 이후의 검색조건이 없을경우
          } else {
            Order.find()
            .sort({ "sod": -1 })
            .exec((err, orderInfo) => {
              if (err) return res.status(400).json({success: false, err});
              return res.status(200).json({ success: true, orderInfo})
            });
          }
        }
      // 일반 사용자인 경우(자신이 구매한 상품만 취득)
      } else {
        // 조건검색
        if (term) {
          // 배달상태 값 변형(화면에서 보내는 값을 변형)
          let tmpDelivery = "";
          if (term[0] === "1") {
            tmpDelivery = "配送手続き完了";
          } else if(term[0] === "2") {
            tmpDelivery = "未確認";
          }

          console.log("term: ", term);

          // Delivery status 값만 들어온 경우
          // Delivery status(Select)는 ""가 될수 없고 날짜는 From To가 같이 들어오게 되어 있어서 term[3]의 유무만 체크하면 된다
          if (term[1] === "" && term[2] === "" && term[3] === "") {
            // term[0] = 0은 전체 검색
            if (term[0] === '0') {
              Order.find({ "userId": userId })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            } else {              
              Order.find
              ({ 
                "userId": userId, 
                "deliveryStatus": tmpDelivery 
              })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            }
          }
          // Delivery status, User name 값만 들어온 경우
          if (term[1] !== "" && term[2] === "" && term[3] === "") {
            if (term[0] === '0') {
              Order.find
              ({ 
                "userId": userId, 
                "name":{'$regex':term[1], $options: 'i' }
              })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            } else {
              Order.find
              ({ 
                "userId": userId, 
                "deliveryStatus":tmpDelivery, 
                "name":{ '$regex':term[1], $options: 'i' }
              })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            }
          }
          // Delivery status, User name, Staff name 값만 들어온 경우
          if (term[1] !== "" && term[2] !== "" && term[3] === "") {
            if (term[0] === '0') {
              Order.find
              ({ 
                "userId": userId, 
                "name":{ '$regex':term[1], $options: 'i' }, 
                "staffName":{ '$regex':term[2], $options: 'i' }
              })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            } else {
              Order.find
              ({ 
                "userId": userId, 
                "deliveryStatus":tmpDelivery, 
                "name":{ '$regex':term[1], $options: 'i' }, 
                "staffName":{ '$regex':term[2], $options: 'i' }
              })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            }
          }
          // 전체 조건값이 들어온 경우
          if (term[1] !== "" && term[2] !== "" && term[3] !== "") {
            let tmpFrom = new Date(term[3]);
						const fromDate = new Date(tmpFrom.getTime() - (tmpFrom.getTimezoneOffset() * 60000)).toISOString();
            let tmpTo = new Date(term[4]);
						const toDate = new Date(tmpTo.getTime() - (tmpTo.getTimezoneOffset() * 60000)).toISOString();

            if (term[0] === '0') {
              Order.find
              ({ 
                "userId": userId,
                "name":{'$regex':term[1], $options: 'i'}, 
                "staffName":{ '$regex':term[2], $options: 'i' }, 
                "sod":{ $gte: fromDate, $lte: toDate }
              })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            } else {
              Order.find
              ({ 
                "userId": userId, 
                "deliveryStatus":tmpDelivery, 
                "name":{'$regex':term[1], $options: 'i'}, 
                "staffName":{ '$regex':term[2], $options: 'i' }, 
                "sod":{ $gte: fromDate, $lte: toDate }
              })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            }
          }
          // Delivery status, staff name만 들어온 경우
          if (term[1] === "" && term[2] !== "" && term[3] === "") {
            if (term[0] === '0') {
              Order.find
              ({
                "userId": userId, 
                "staffName":{ '$regex':term[2], $options: 'i' }
              })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            } else {
              Order.find
              ({
                "userId": userId, 
                "deliveryStatus":tmpDelivery,
                "staffName":{ '$regex':term[2], $options: 'i' }
              })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            }
          }
          // Delivery status, staff name, 결제일만 들어온 경우
          if (term[1] === "" && term[2] !== "" && term[3] !== "") {
            let tmpFrom = new Date(term[3]);
						const fromDate = new Date(tmpFrom.getTime() - (tmpFrom.getTimezoneOffset() * 60000)).toISOString();
            let tmpTo = new Date(term[4]);
						const toDate = new Date(tmpTo.getTime() - (tmpTo.getTimezoneOffset() * 60000)).toISOString();

            if (term[0] === '0') {
              Order.find
              ({
                "userId": userId, 
                "staffName":{ '$regex':term[2], $options: 'i' },
                "sod":{ $gte: fromDate, $lte: toDate }
              })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            } else {
              Order.find
              ({
                "userId": userId, 
                "deliveryStatus":tmpDelivery,
                "staffName":{ '$regex':term[2], $options: 'i' },
                "sod":{ $gte: fromDate, $lte: toDate }
              })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            }
          }
          // Delivery status, user name, 결제일만 들어온 경우
          if (term[1] !== "" && term[2] === "" && term[3] !== "") {
            let tmpFrom = new Date(term[3]);
						const fromDate = new Date(tmpFrom.getTime() - (tmpFrom.getTimezoneOffset() * 60000)).toISOString();
            let tmpTo = new Date(term[4]);
						const toDate = new Date(tmpTo.getTime() - (tmpTo.getTimezoneOffset() * 60000)).toISOString();
            
            if (term[0] === '0') {
              Order.find
              ({
                "userId": userId, 
                "name":{ '$regex':term[1], $options: 'i' },
                "sod":{ $gte: fromDate, $lte: toDate }
              })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            } else {
              Order.find
              ({
                "userId": userId, 
                "deliveryStatus":tmpDelivery,
                "name":{ '$regex':term[1], $options: 'i' },
                "sod":{ $gte: fromDate, $lte: toDate }
              })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            }
          }
          // Delivery status, 결제일만 들어온 경우
          if (term[1] === "" && term[2] === "" && term[3] !== "") {
            let tmpFrom = new Date(term[3]);
						const fromDate = new Date(tmpFrom.getTime() - (tmpFrom.getTimezoneOffset() * 60000)).toISOString();
            let tmpTo = new Date(term[4]);
						const toDate = new Date(tmpTo.getTime() - (tmpTo.getTimezoneOffset() * 60000)).toISOString();

            if (term[0] === '0') {
              Order.find
              ({
                "userId": userId, 
                "sod":{ $gte: fromDate, $lte: toDate }
              })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, orderInfo})
              });
            } else {
              Order.find
              ({
                "userId": userId, 
                "deliveryStatus":tmpDelivery,
                "sod":{ $gte: fromDate, $lte: toDate }
              })
              .sort({ "sod": -1 })
              .skip(req.body.skip)
              .exec((err, orderInfo) => {
                  if (err) return res.status(400).json({success: false, err});
                  return res.status(200).json({ success: true, orderInfo})
              });
            }
          }
        } else {
          Order.find({ "userId": userId })
          .sort({ "sod": -1 })
          .exec((err, orderInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, orderInfo})
          });
        }
      }
    })
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
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