const express = require('express');

const router = express.Router();
const { Customer } = require("../models/Customer");

//=================================
//             Customer
//=================================

// 고객정보 등록
router.post("/register", (req, res) => {
    try {
        const customer = new Customer(req.body);

        customer.save((err, doc) => {;
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

// 고객정보 조회
router.post("/list", (req, res) => {
    try {
        let term = req.body.searchTerm;

        // Customer collection에 들어 있는 모든 고객정보 가져오기
        if (term) {
            Customer.find({ "name": { '$regex': term },})
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
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// 고객정보 상세조회
router.get('/customers_by_id', (req, res) => {
    try {
        let type = req.query.type;
        let customerId = req.query.id;
        // customerId를 이용해서 DB에서 customerId와 같은 고객의 정보를 가져온다
        Customer.find({ _id: customerId })
        .exec((err, customer) => {
            if (err) return res.status(400).send(err)
            return res.status(200).send({success: true, customer});
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
})

// 고객정보 삭제
router.post('/delete', (req, res) => {
    try {
        let customerId = req.body.customerId;
        // customerId를 이용해서 DB에서 customerId와 같은 고객의 정보를 가져온다
        Customer.remove({ _id: customerId })
        .exec((err, customer) => {
            if (err) return res.status(400).send(err)
            return res.status(200).send({success: true, customer});
        })
    } catch (error) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
})

// 고객정보 수정
router.post("/update", (req, res) => {
    Customer.updateMany(
        { _id: req.body.id }, 
        { 
            smaregiId: req.body.smaregiId, 
            name: req.body.name,
            tel: req.body.tel,
            email: req.body.email,
            address1: req.body.address1,
            address2: req.body.address2,
            address3: req.body.address3,
            salesman: req.body.salesman,
            point:req.body.point
        }, (err, doc) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).send({
            success: true
        });
    });
});

module.exports = router;