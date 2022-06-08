const express = require('express');
const router = express.Router();
const { User } = require("../models/User");
const { Product } = require('../models/Product');
const { Payment } = require('../models/Payment');

const { auth } = require("../middleware/auth");
const async = require('async');

//=================================
//             User
//=================================

router.get("/auth", auth, (req, res) => {

    // 여기까지 미들웨어를 통과해 왔다는 거는 Authentication이 True라는 말
    // role : 0 일반유저 role : 0이 아니면 관리자
    res.status(200).json({
        _id: req.user._id,
        isAdmin: req.user.role === 2 ? true : false,
        isAuth: true,
        email: req.user.email,
        name: req.user.name,
        lastName: req.user.lastName,
        tel: req.user.tel,
        address1: req.user.address1,
        address2: req.user.address2,
        address3: req.user.address3,
        receiver1: req.user.receiver1,
        receiver2: req.user.receiver2,
        receiver3: req.user.receiver3,
        tel1: req.user.tel1,
        tel2: req.user.tel2,
        tel3: req.user.tel3,
        role: req.user.role,
        language: req.user.language,
        image: req.user.image,
        cart: req.user.cart,
        history: req.user.history,
        room: req.user.room,
    });
});

// Login
router.post("/login", (req, res) => {
    try {
        User.findOne({ email: req.body.email }, (err, user) => {
            if (!user) {
                return res.json({ loginSuccess: false, message: "Auth failed, email not found" });
            }
            // 요청된 이메일이 DB에 있다면 비밀번호가 맞는 비밀번호 인지 확인
            user.comparePassword(req.body.password, (err, isMatch) => {
                if (!isMatch)
                    return res.json({ loginSuccess: false, message: "Wrong password" });
    
                // 비밀번호 까지 맞다면 토큰을 생성하기
                user.generateToken((err, user) => {
                    if (err) return res.status(400).send(err);
    
                    // 토큰을 쿠키에 저장한다
                    res.cookie("w_authExp", user.tokenExp);
                    res.cookie("w_auth", user.token).status(200).json({
                        //loginSuccess: true, userId: user._id
                        loginSuccess: true, userInfo: user
                    });
                });
    
                // 로그인한 시간을 업데이트
                User.findOneAndUpdate({ email: req.body.email }, { lastLogin: new Date() }, (err, doc) => {
                    if (err) return res.json({ success: false, err });
                });
            });
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// Logout
router.get("/logout", auth, (req, res) => {
    try {
        User.findOneAndUpdate({ _id: req.user._id }, { token: "", tokenExp: "" }, (err, doc) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).send({
                success: true
            });
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
});

// 사용자 등록
router.post("/register", (req, res) => {
    try {
        const user = new User(req.body);        
        user.save((err, doc) => {
            console.log("err: ", err);
            if (err) return res.json({ success: false, err });
            return res.status(200).json({ success: true });
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message })
    }   
});

// 사용자 조회
router.post("/list", (req, res) => {
    try {
        let term = req.body.searchTerm;

        if (term) {
            User.find({ "name": { '$regex': term, $options: 'i' }})
            .sort({ "lastLogin": 1 })
            .skip(req.body.skip)
            .exec((err, userInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, userInfo})
            });
        } else {
            User.find()
            .sort({ "lastLogin": 1 })
            .exec((err, userInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, userInfo})
            });
        }    
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message })
    }
});

// 사용자 수정
router.post("/update", (req, res) => {
    try {
        User.updateMany(
            { _id: req.body.id },
            {   
                name: req.body.name,
                lastName: req.body.lastName, 
                tel: req.body.tel,
                address1: req.body.address1,
                receiver1: req.body.receiver1,
                tel1: req.body.tel1,
                address2: req.body.address2,
                receiver2: req.body.receiver2,
                tel2: req.body.tel2,
                address3: req.body.address3,
                receiver3: req.body.receiver3,
                tel3: req.body.tel3,
                role: req.body.role,
                language: req.body.language,
            }, (err, doc) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).send({
                success: true
            });
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message })
    }
});

// 사용자 삭제
router.post('/delete', (req, res) => {
    try {
        let userId = req.body.userId;
    
        User.remove({ _id: userId })
        .exec((err, user) => {
            if (err) return res.status(400).send(err);
            return res.status(200).send({success: true, user});
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// 사용자 상세조회
router.get('/users_by_id', (req, res) => {
    try {
        let userId = req.query.id;
    
        // userId를 이용해서 DB에서 userId와 같은 고객의 정보를 가져온다
        User.find({ _id: userId })
            .exec((err, user) => {
                if (err) return res.status(400).send(err);
                return res.status(200).send({success: true, user});
            })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// 카트에 상품담기
router.post("/addToCart", auth, (req, res) => {
    try {
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
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
    
});

// 카트의 상품삭제
router.get('/removeFromCart', auth, (req, res) => {
    try {
        // 카트안의 내가 지우려는 상품을 삭제
        User.findOneAndUpdate(
            {_id: req.user._id},
            {
                "$pull":
                {"cart":{"id" : req.query.id}}
            },
            { new: true },
            (err, userInfo) => {
                let cart = userInfo.cart;
                // 최신 상품정보에서 상품아이디만 배열에 담는다
                let array = cart.map(item => {
                    return item.id;
                })

                // 위의 배열에 담긴 상품아이디로 상품디비에서 최신 상품정보를 가져오기
                Product.find({ _id: { $in: array } })
                .populate("writer")
                .exec((err, productInfo) => {
                    // cartDetail정보를 만들기 위해 productInfo, cart정보를 반환한다
                    // cart: 사용자의 카트 정보
                    // productInfo: 사용자의 카트 정보의 상품아이디로 취득한 상품정보
                    return res.status(200).json({
                        productInfo,
                        cart
                    })
                })
            }
        )
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
})

// Paypal 결제정보 및 history 저장, 상품판매 카운트 업데이트
router.post('/successBuy', auth, (req, res) => {
    try {
        let history = [];
        let transactionData = {};

        let date = new Date();
        const dateInfo = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
        // 결제한 카트에 담겼던 상품정보를 history에 넣어줌
        req.body.cartDetail.forEach((item) => {
            history.push({
                dateOfPurchase: dateInfo,
                name: item.title,
                id: item._id,
                price: item.price,
                quantity: item.quantity,
                paymentId: req.body.paymentData.paymentID
            })
        })

        // Payment에 자세한 결제정보 저장
        // (Payment의 컬럼이 user, data, product로 구성 되어 있다)
        // user정보
        transactionData.user = {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,        
        }
        // data정보(Paypal정보를 저장)
        transactionData.data = req.body.paymentData;
        // product정보
        transactionData.product = history;

        // User에 history정보 저장 및 Cart정보 삭제
        User.findOneAndUpdate(
            {_id: req.user._id},
            { $push: { history: history }, $set: {cart: []}},
            { new: true },
            (err, user) => {
                if(err) return res.json({ success: false, err })

                // Payment에 transactionData정보 저장
                const payment = new Payment(transactionData)
                payment.save((err, doc) => {
                    if(err) return res.json({ success: false, err })

                    // Product의 sold 필드 정보 업데이트
                    // 상품당 몇개를 샀는지 파악 
                    let products = [];
                    doc.product.forEach(item => {
                        products.push({ id: item.id, quantity: item.quantity })
                    })
                    // Product에 업데이트
                    async.eachSeries(products, (item, callback) => {
                        Product.updateOne(
                            {_id: item.id },
                            {
                                $inc: {
                                    "sold": item.quantity
                                }
                            },
                            { new: false },
                            callback
                        )
                    }, (err) => {
                        if(err) return res.status(400).json({success: false})
                        res.status(200).json({
                            success: true,
                            cart: user.cart,
                            cartDetail: [],
                            payment: doc
                        })
                    })
                });            
            }
        )
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
})

module.exports = router;