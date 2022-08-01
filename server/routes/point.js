const express = require('express');
const router = express.Router();
const { Point } = require("../models/Point");
const { User } = require("../models/User");


//=================================
//             Point
//=================================

const getUserInfo = async (userId) => {
    const userInfo = await User.findOne({ _id: userId });
    if (!userInfo) {
        console.log("err: ", err);
        return res.status(400).json({success: false, err});
    }

    return userInfo;
}

const getPointByCondition = async (userId, tmpFromDate) => {
    let pointInfo;

    if (tmpFromDate) {
        pointInfo = await Point.find({ "userId": userId, "createdAt":{ $gte: tmpFromDate }})
        .sort({ "seq": 1, "subSeq": 1 })
    } else {
        pointInfo = await Point.find({ "userId": userId })
        .sort({ "seq": 1, "subSeq": 1 })
    }   

    if (!pointInfo) {
        console.log("err: ", err);
        return res.status(400).json({success: false, err});
    }

    return pointInfo;
}

router.post('/list', async (req, res) => {
    let term = req.body.searchTerm;
    const userId = req.body.userId;
    
    try {
        getUserInfo(userId).then((userInfo) => {
            // 관리자인 경우
            if (userInfo.role === 2) {
                // 조건이 있는경우
                if (term.length > 0) {
                    // 유효기간To 조건이 있는경우
                    if (term[0] !== "") {
                        let tmpFromDate = new Date(term[0]);

                        getPointByCondition(userId, tmpFromDate).then((pointInfos) => {
                            return res.status(200).send({success: true, pointInfos});
                        })
                    // 검색을 지웠을때
                    } else if (term[0] === "") {
                        getPointByCondition(userId).then((pointInfos) => {
                            return res.status(200).send({success: true, pointInfos});
                        })
                    }
                } else {
                    getPointByCondition(userId).then((pointInfos) => {
                        return res.status(200).send({success: true, pointInfos});
                    })
                }
            // 사용자인 경우
            } else if (userInfo.role === 0) {
                // 조건이 있는경우
                if (term.length > 0) {
                    // 유효기간To 조건이 있는경우
                    if (term[0] !== "") {
                        let tmpFromDate = new Date(term[0]);

                        getPointByCondition(userId, tmpFromDate).then((pointInfos) => {
                            return res.status(200).send({success: true, pointInfos});
                        })
                    } else {
                        getPointByCondition(userId).then((pointInfos) => {
                            return res.status(200).send({success: true, pointInfos});
                        })
                    }
                } else {
                    getPointByCondition(userId).then((pointInfos) => {
                        return res.status(200).send({success: true, pointInfos});
                    })
                }
            }
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;