const express = require('express');
const router = express.Router();
const { Customer } = require("../models/Customer");

//=================================
//             Customer
//=================================

// 사용자 등록
router.post("/register", (req, res) => {

    const customer = new Customer(req.body);

    customer.save((err, doc) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({
            success: true
        });
    });
});

// 사용자 조회
router.post("/list", (req, res) => {
    let term = req.body.searchTerm;

    // Customer collection에 들어 있는 모든 사용자 정보 가져오기
    if (term) {
        console.log("term>>>",term);
        Customer
        //.find({ $text: { $search: term } })
        .find({ 
            "name": { '$regex': term },
          })
        .skip(req.body.skip)
        .exec((err, customerInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, customerInfo})
        });
    } else {
        Customer.find().exec((err, customerInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, customerInfo})
        });
    }
    
});



module.exports = router;
