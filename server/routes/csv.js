const express = require('express');
const router = express.Router();
const { UnivaPayCast } = require("../models/UnivaPayCast");
const { auth } = require("../middleware/auth");

//=================================
//             CSV
//=================================

router.get("/auth", auth, (req, res) => {

    // 여기까지 미들웨어를 통과해 왔다는 거는 Authentication이 True라는 말
    // role : 0 일반유저 role : 0이 아니면 관리자
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 0 ? false : true,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastname: req.user.lastname,
        role: req.user.role,
        image: req.user.image,
    });
});

// UNIVA PAY CAST CSV 등록
router.post("/univaPayCast/register", (req, res) => {

    UnivaPayCast.insertMany(req.body).
    then(function(){
        console.log("Data inserted")
        return res.status(200).json({success: true})
    }).catch(function(error){
        console.log(error)
        return res.json({success: false, err})
    });
});




module.exports = router;
