const express = require('express');
const router = express.Router();
const { User } = require("../models/User");
const { auth } = require("../middleware/auth");

//=================================
//             User
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
        address1: req.user.address1,
        address2: req.user.address2,
        address3: req.user.address3,
        role: req.user.role,
        image: req.user.image,
        cart: req.user.cart,
        history: req.user.history,
        room: req.user.room,
    });
});

// 사용자 등록
router.post("/register", (req, res) => {
    const user = new User(req.body);

    user.save((err, doc) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({
            success: true
        });
    });
});

// Login
router.post("/login", (req, res) => {
    User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {
            return res.json({
                loginSuccess: false,
                message: "Auth failed, email not found"
            });
        }
        // 요청된 이메일이 DB에 있다면 비밀번호가 만즌 비밀번호 인지 확인
        user.comparePassword(req.body.password, (err, isMatch) => {
            if (!isMatch)
                return res.json({ loginSuccess: false, message: "Wrong password" });

            // 비밀번호 까지 맞다면 토큰을 생성하기
            user.generateToken((err, user) => {
                if (err) return res.status(400).send(err);

                // 토큰을 저장한다
                res.cookie("w_authExp", user.tokenExp);
                res.cookie("w_auth", user.token).status(200).json({
                    loginSuccess: true, userId: user._id
                });
            });
        });
    });
});

// Logout
router.get("/logout", auth, (req, res) => {
    User.findOneAndUpdate({ _id: req.user._id }, { token: "", tokenExp: "" }, (err, doc) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).send({
            success: true
        });
    });
});

// 로그인 유저 상세조회
router.get('/users_by_id', (req, res) => {
    let userId = req.query.id;
    
    // userId를 이용해서 DB에서 userId와 같은 고객의 정보를 가져온다
    User.find({ _id: userId })
        .exec((err, user) => {
            if (err) return res.status(400).send(err);
            return res.status(200).send({success: true, user});
        })
})

// 카트에 상품담기
router.post("/addToCart", auth, (req, res) => {
    // auth 미들웨어에서 사용자 정보를 request에 담아주기 때문에 req.user.id에 id정보가 담아져 있다
    // User Collection에서 해당 사용자 정보를 가져오기
    User.findOne({_id: req.user._id}, 
        (err, userInfo) => {
            // 가져온 정보에서 카트에다 넣으려 하는 상품이 이미 들어 있는지 확인
            let duplicate = false; 
            userInfo.cart.forEach((item) => {
                if (item.id === req.body.productId) {
                    duplicate = true;
                }
            })

            // 상품이 이미 있을때
            if (duplicate) {
                // 상품을 찾아서 갯수를 증가시킨다
                User.findOneAndUpdate(
                    { _id: req.user._id, "cart.id": req.body.productId }, // 사용자를 찾고 사용자의 카트에서 상품을 찾는 조건
                    { $inc: { "cart.$.quantity": 1 } }, // 1을 증가
                    { new: true }, // 아래 userInfo에서 업데이트 된 사용자 정보를 받기 위한 구문
                    (err, userInfo) => { // 쿼리를 실행한다
                        if(err) return res.status(400).json({ success: false, err })
                        res.status(200).send(userInfo.cart) // 카트 정보만 보낸다
                    }
                )
            // 상품이 없을때
            } else {
                User.findOneAndUpdate(
                    { _id: req.user._id },
                    { $push: { // 배열에 값을 추가
                        cart: { // cart에 push를 하겠다고 지정
                            id: req.body.productId,
                            quantity: 1, 
                            date: Date.now()
                            }
                        }
                    },
                    { new: true },
                    (err, userInfo) => { // 쿼리를 실행한다
                        if (err) return res.status(400).json({ success: false, err })
                        res.status(200).send(userInfo.cart) // 카트 정보만 보낸다
                    }
                )
            }
        })

    // 상품이 이미 있을때

    // 상품이 이미 있지 않을때
});

module.exports = router;