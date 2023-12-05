const express = require('express');
const router = express.Router();
const { Coupon } = require("../models/Coupon");
const { CouponHistory } = require("../models/CouponHistory");


//=================================
//             Coupon
//=================================

// 쿠폰정보 가져오기
router.post("/list", (req, res) => {
    try {
        if (req.body.code) {
            // 쿠폰코드 중복체크
            Coupon.find({ "code": req.body.code })
                .sort({ "createdAt": -1 })
                .exec((err, couponInfos) => {
                    if (err) return res.status(400).json({success: false, err});

                    return res.status(200).send({ success: true, couponInfos });
                }
            )
        } else {
            // 쿠폰정보 가져오기
            Coupon.find()
                .sort({ "createdAt": -1 })
                .exec((err, couponInfos) => {
                    if (err) return res.status(400).json({success: false, err});

                    return res.status(200).send({ success: true, couponInfos });
            })
        }
    } catch (err) {
        console.log("Coupon list err: ", err);
        return res.status(500).json({ success: false, message: err.message });
    }   
});

// 생일자 쿠폰 리스트
router.post("/birth/list", (req, res) => {
    try {
        // 생일자 쿠폰코드 중복체크
        Coupon.find({ "code": req.body.code })
            .sort({ "createdAt": -1 })
            .exec((err, couponInfos) => {
                if (err) return res.status(400).json({success: false, err});

                return res.status(200).send({ success: true, couponInfos });
            }
        )
    } catch (err) {
        console.log("Coupon birth_list err: ", err);
        return res.status(500).json({ success: false, message: err.message });
    }   
});

// 쿠폰이력 가져오기(post)
router.post("/history/list", (req, res) => {
    try {
        // 쿠폰정보 가져오기
        CouponHistory.find({ "code": req.body.code, "couponUserId": req.body.couponUserId, "type": req.body.type })
            .sort({ "createdAt": -1 })
            .exec((err, couponInfo) => {
                if (err) return res.status(400).json({success: false, err});
                
                return res.status(200).send({ success: true, couponInfo });
        })
    } catch (err) {
        console.log("Coupon history_list err: ", err);
        return res.status(500).json({ success: false, message: err.message });
    }   
});

// 쿠폰이력 가져오기(get)
router.get("/history/list", (req, res) => {
    try {
        // 쿠폰정보 가져오기
        CouponHistory.find()
            .sort({ "createdAt": -1 })
            .exec((err, couponInfos) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).send({ success: true, couponInfos });
        })
    } catch (err) {
        console.log("Coupon history_list err: ", err);
        return res.status(500).json({ success: false, message: err.message });
    }   
});

// 쿠폰이력 등록
router.post("/history/register", (req, res) => {
    try {
        const history = new CouponHistory(req.body);
        history.save((err, couponInfo) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).json({ success: true });
        });
    } catch (err) {
        console.log("Coupon history_register err: ", err);
        return res.status(500).json({ success: false, message: err.message });
    }   
});

// 쿠폰등록
router.post("/register", (req, res) => {
    try {
        const coupon = new Coupon(req.body);
        coupon.save((err, couponInfo) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).json({ success: true });
        });
    } catch (err) {
        console.log("Coupon register err: ", err);
        return res.status(500).json({ success: false, message: err.message });
    }   
});

// 쿠폰정보 가져오기(id)
router.get('/coupons_by_id', (req, res) => {
    try {
        let couponId = req.query.id;
        
        Coupon.find({ _id: couponId })
        .exec((err, couponInfo) => {
            if (err) return res.status(400).send(err);
            return res.status(200).send({success: true, couponInfo});
        })
    } catch (err) {
        console.log("Coupon coupons_by_id err: ", err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// 쿠폰정보 가져오기(code)
router.get('/coupons_by_cd', (req, res) => {
    try {
        let cd = req.query.cd;
        
        Coupon.find({ code: cd, active: "1" })
        .exec((err, couponInfo) => {
            if (err) return res.status(400).send(err);
            return res.status(200).send({success: true, couponInfo});
        })
    } catch (err) {
        console.log("Coupon coupons_by_cd err: ", err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// 쿠폰정보 업데이트
router.post("/update", (req, res) => {
    try {
        Coupon.findOneAndUpdate(
            { '_id': req.body.id },
            { 'active': req.body.active, 'sendMail': req.body.sendMail },
            (err, couponInfo) => {
                if(err) return res.status(400).json({ success: false, message: err.message })
                
                return res.status(200).send({ success: true });
            }
        );
    } catch (err) {
        console.log("Coupon update err: ", err);
        return res.status(500).json({ success: false, message: err.message })
    }
});

// 쿠폰정보 삭제
router.post('/delete', (req, res) => {
    try {
        Coupon.deleteOne({ _id: req.body.id })
        .then((deletedCount)=>{
            return res.status(200).send({ success: true });
        }, (err)=>{
            if (err) return res.status(400).send(err);
        })
    } catch (err) {
        console.log("Coupon delete err: ", err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;