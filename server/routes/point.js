const express = require('express');
const router = express.Router();
const { Point } = require("../models/Point");

//=================================
//             Point
//=================================

// 사용자의 유효기간내의 사용가능한 포인트 가져오기 
router.get('/users_by_id', async (req, res) => {
    // 사용자 아이디
    const userId = req.query.id;
    try {

        let pointInfos = [];
        let dt = new Date();
        let currentDate = new Date(dt.getTime() - (dt.getTimezoneOffset() * 60000)).toISOString();
        let current = new Date(currentDate.substring(0, 10));

        const points = await Point.find({ "userId": userId, "remainingPoints": { $gt: 0 }}).sort({ "createdAt": 1 })

        for (let i=0; i<points.length; i++) {
            let from = new Date(points[i].validFrom);
            let to = new Date(points[i].validTo);
            let validFrom = new Date(from.toISOString().substring(0, 10));
            let validTo = new Date(to.toISOString().substring(0, 10) + " 23:59:59");

            if ((validFrom <= current) && (current <=  validTo)) {
                pointInfos.push(points[i]);
            }
        }
        
        return res.status(200).send({success: true, pointInfos});
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// 사용자 아이디로 포인트 정보 가져오기
router.post('/list', async (req, res) => {
    const userId = req.body.userId;

    try {
        Point.find({ "userId": userId }).sort({ "seq": 1, "subSeq": 1 })
        .then((pointInfos) => {
            return res.status(200).send({success: true, pointInfos});
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;