const express = require('express');
const router = express.Router();
const { Coupon } = require("../models/Coupon");


//=================================
//             Coupon
//=================================

// 쿠폰등록
router.post("/register", (req, res) => {
    try {
        const coupon = new Coupon(req.body);
        coupon.save((err, doc) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).json({ success: true });
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }   
});


module.exports = router;