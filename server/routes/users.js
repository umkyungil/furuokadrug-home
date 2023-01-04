const express = require('express');
const router = express.Router();
const { User } = require("../models/User");
const { Product } = require('../models/Product');
const { Payment } = require('../models/Payment');
const { TmpPayment } = require('../models/TmpPayment');
const { Point } = require('../models/Point');
const { Counter } = require('../models/Counter');

const { auth } = require("../middleware/auth");
const async = require('async');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

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
        birthday: req.user.birthday,
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
        deletedAt: req.user.deletedAt,
        myPoint: req.user.myPoint,
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
                if (!isMatch) {
                    return res.json({ loginSuccess: false, message: "Wrong password" });
                }
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
            return res.status(200).send({ success: true });
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
            if (err) {
                console.log("err: ", err);
                return res.json({ success: false, err });
            }
            
            return res.status(200).json({ success: true });
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }   
});

// 사용자 등록
router.post("/anyRegister", (req, res) => {
    try {
        const user = new User(req.body);
        user.save((err, doc) => {
            if (err) {
                console.log("err: ", err);
                return res.json({ success: false, err });
            }
            
            return res.status(200).json({ success: true });
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }   
});

// 비밀번호 변경
router.post("/passwordConfirm", async (req, res) => {
    const saltRounds = 10;
    try {
        // 사용자정보 가져오기
        let userId = req.body.userId;
        const userInfo = await User.find({ _id: userId });

        // 시간경과 확인
        if(!userInfo[0].passwordChangedAt) {
            return res.status(400).json({ success: false });
        }

        let orgDate = new Date(userInfo[0].passwordChangedAt);
        let curDate = new Date();

        // 임시사용자 정보를 저장한 시간에서 한시간후의 시간을 구한다
        let chgDate = new Date(Date.parse(orgDate) + 1000 * 60 * 60); // 한시간 후
        // let chgDate = new Date(Date.parse(orgDate) + 1000 * 60); // 1분 후

        // 임시사용자 메일 수신후 1시간이상 경과 확인
        if (curDate > chgDate) {
            return res.status(400).json({ success: false });
        }

        // 비밀번호 변경일자 삭제
        const user = await User.findOneAndUpdate(
            { _id: req.body.userId }, 
            { passwordChangedAt: "" },
            { new: true }
        )
        if (!user) {
            return res.status(400).json({ success: false });
        }

        // 비밀번호 암호화 후 저장
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err);
    
            bcrypt.hash(req.body.password, salt, function(err, hash){
                if(err) return next(err);

                User.findOneAndUpdate(
                    { _id: req.body.userId }, 
                    { password: hash }, 
                    { new: true },
                    (err, user) => {
                    if (err) return res.json({ success: false, err });

                    return res.status(200).send({ success: true, user });
                });
            })
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// 임시사용자 확인등록
router.post("/preregisterConfirm", async (req, res) => {
    try {
        let userId = req.body.userId;

        const userInfo = await User.find({ _id: userId });
        let orgDate = new Date(userInfo[0].createdAt);
        let curDate = new Date();
        
        // 임시사용자 정보를 저장한 시간에서 한시간후의 시간을 구한다
        let chgDate = new Date(Date.parse(orgDate) + 1000 * 60 * 60); // 한시간 후
        // 임시사용자 메일 수신후 시간과 관계없이 기존 데이터는 삭제
        await User.deleteOne({ _id: userId });
        // 임시사용자 메일 수신후 1시간이상 경과 확인
        if (curDate > chgDate) {
            return res.status(400).json({ success: false });
        }

        let dataToSubmit = {
            name: req.body.name,
            lastName: req.body.lastName,
            email: req.body.email,
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
            password: req.body.password,
            language: req.body.language,
            deletedAt: req.body.deletedAt
        }
        const user = new User(dataToSubmit);
        user.save((err, doc) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).json({ success: true });
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }   
});

// 임시사용자 등록
router.post("/preregister", (req, res) => {
    try {
        const user = new User(req.body);
        user.save((err, doc) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).json({ success: true, doc });
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }   
});

// 사용자 조회
router.post("/list", (req, res) => {
    try {
        let term = req.body.searchTerm;

        if (term) {
            User.find({ "name": {'$regex': term, $options: 'i'}})
            .sort({ "lastLogin": 1 })
            .skip(req.body.skip)
            .exec((err, userInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, userInfo})
            });
        } else {
            User.find({ "password": {$exists: true}, "deletedAt": null , "role": 0 })
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

// 사용자 조회
router.get("/list", (req, res) => {
    try {
        User.find({ "password": {$exists: true}, "deletedAt": null , "role": 0 })
        .exec((err, userInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, userInfo})
        });  
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message })
    }
});

// 불특정 사용자 조회
router.post("/anonymous/list", (req, res) => {    
    let term = req.body.searchTerm;

    try {
        // 논리삭제가 된 사용자도 포함
        User.find({ "name": {'$regex': term, $options: 'i'}})
        .exec((err, userInfo) => {
            if (err) return res.status(400).json({success: false, err});
            return res.status(200).json({ success: true, userInfo});
        });  
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message })
    }
});

// 쿠폰 사용자 조회
router.post("/coupon/list", (req, res) => {
    try {
        let term = req.body.searchTerm;

        if (term) {
            User.find({ "name": { '$regex': term, $options: 'i' }, "password": {$exists: true}, "deletedAt": null , "role": 0 })
            .sort({ "lastLogin": 1 })
            .skip(req.body.skip)
            .exec((err, userInfo) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).json({ success: true, userInfo})
            });
        } else {
            User.find({ "password": {$exists: true}, "deletedAt": null , "role": 0 })
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
    // 삭제여부 확인
    let deletedAt;
    if (req.body.deletedAt) {
        deletedAt = new Date();
    } else {
        deletedAt = '';
    }

    try {
        User.updateMany(
            { _id: req.body.id },
            {   
                name: req.body.name,
                lastName: req.body.lastName, 
                birthday: req.body.birthday,
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
                deletedAt: deletedAt
            }, (err, doc) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).send({ success: true });
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// 사용자 논리삭제
router.post("/logicalDelete", (req, res) => {
    let deletedAt = new Date();
    try {
        User.updateMany(
            { _id: req.body.userId }, 
            { deletedAt: deletedAt}
            , (err, doc) => {
                if (err) return res.json({ success: false, err });
                return res.status(200).send({ success: true });
            })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// 사용자 삭제
router.post('/delete', (req, res) => {
    try {
        let userId = req.body.userId;

        User.deleteOne({_id: userId})
        .then((deletedCount)=>{
            return res.status(200).send({success: true, deletedCount});
        }, (err)=>{
            if (err) return res.status(400).send(err);
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// 사용자 상세조회(id)
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

// 사용자 상세조회(token)
router.post('/w_auth', (req, res) => {
    try {
        let token = req.body.w_auth;
        
        User.find({ token: token })
        .exec((err, user) => {
            if (err) return res.status(400).send(err);
            return res.status(200).send({success: true, user});
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// 사용자 상세조회(email)
router.get('/users_by_email', async (req, res) => {
    try {
        // 패스워드 시간을 업데이트
        User.findOneAndUpdate(
            { email: req.query.email }, 
            { passwordChangedAt: new Date() },
            { new: true },
            (err, user) => {
                if(err) return res.status(400).json({ success: false, err })
                res.status(200).json({ success: true, user })
            }
        );
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

// Cart 결제정보 및 history 저장, 상품판매 카운트 업데이트
router.post('/successBuy', auth, (req, res) => {
    try {
        let history = [];
        let transactionData = {};
        
        let dt1 = new Date();
		let currentDate = new Date(dt1.getTime() - (dt1.getTimezoneOffset() * 60000)).toISOString();
        let dt2 = new Date(dt1.setFullYear(dt1.getFullYear() + 1));
        let oneYearDate = new Date(dt2.getTime() - (dt2.getTimezoneOffset() * 60000)).toISOString();

        // 결제한 카트에 담겼던 상품정보를 history에 넣어줌
        req.body.cartDetail.forEach((item) => {
            history.push({
                dateOfPurchase: currentDate,
                name: item.title,
                id: item._id,
                price: item.price,
                quantity: item.quantity,
                paymentId: req.body.paymentData.paymentID
            })
        })

        // Payment의 user정보
        transactionData.user = {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
        }
        // Payment의 data정보(Paypal정보를 저장)
        transactionData.data = req.body.paymentData;
        // Payment의 product정보
        transactionData.product = history;

        // User에 history저장 및 포인트 누적, Cart삭제
        User.findOneAndUpdate(
            { _id: req.user._id },
            { $push: { history: history }, $set: { cart: [], myPoint: req.body.totalPoint }},
            // { $push: { history: history }, $set: { cart: [] }},
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
                            { _id: item.id },
                            { $inc: { "sold": item.quantity }},
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
        
        // 사용자가 입력한 포인트가 있는지 확인 (입력한 포인트는 기본값이 화면단에서 0으로 설정되어 있다)
        const pointToUse = Number(req.body.pointToUse); 
        if(pointToUse > 0) {
            // 포인트 누적할 항목 설정
            let dataToSubmit = {
                userId: req.user._id,
                userName: req.user.name,
                userLastName: req.user.lastName,
                point: req.body.productPoint, // 취득한 포인트
                remainingPoints: req.body.productPoint, // 취득한 포인트
                usePoint: 0,
                dspUsePoint: 0,
                validFrom: currentDate,
                validTo: oneYearDate,
                dateUsed:''
            }

            // 포인트 등록
            savePoint(dataToSubmit);

            // 사용자가 보유하는 포인트 가져오기 (남은 포인트가 0보다 큰 데이타)
            Point.find({ "userId": req.user._id, "remainingPoints": { $gt: 0 }})
                .sort({ "validTo": 1 }) // 유효기간To가 가까운것부터 정렬(내림차순)
                .exec((err, points) => {
                    if (err) {
                        console.log("Point calculation failed when paying with AliPay: ", err);
                        return res.status(400).json({ success: false });
                    }

                    // 유효기간 내의 사용할수 있는 포인트만 추출
                    let pointInfos = [];
                    let current = new Date(currentDate.substring(0, 10));
                    
                    for (let i=0; i<points.length; i++) {
                        let from = points[i].validFrom;
                        let to = points[i].validTo;
                        let validFrom = new Date(from.toISOString().substring(0, 10))
                        let validTo = new Date(to.toISOString().substring(0, 10))

                        if ((validFrom <= current) && (current <=  validTo)) {
                            pointInfos.push(points[i]);
                        }
                    }

                    for (let i=0; i<pointInfos.length; i++) {
                        // 첫번째 레코드는 사용자가 입력한 포인트로 계산을 한다
                        if (i===0) {
                            // 한번도 사용하지 않은 포인트인 경우
                            if (!pointInfos[i].dateUsed) {
                                const remainingPoints = pointInfos[i].remainingPoints;

                                // 기존 포인트 - 사용자가 입력한 포인트(항상 [양수 - 양수] 이기에 그대로 계산 가능)
                                let tmp = remainingPoints - pointToUse;

                                if(tmp < 0) {
                                    // ****다음 레코드에서 포인트를 계산을 하기 위해 pointInfos[i] 배열에 값을 대입한다. **** //
                                    // 포인트를 계산한 값
                                    pointInfos[i].usePoint = tmp;
                                    // 포인트를 전부 사용했기에 원래 가지고 있던 포인트 대입(화면 노출)
                                    pointInfos[i].dspUsePoint = remainingPoints;
                                    // 포인트 업데이트
                                    updatePoint(pointInfos[i]._id, remainingPoints, tmp, 0, currentDate);
                                } else {
                                    // 포인트 업데이트
                                    updatePoint(pointInfos[i]._id, pointToUse, tmp, tmp, currentDate);
                                    // [기존 포인트 > 사용자가 입력한 포인트] 인 경우 포인트계산 종료
                                    break;
                                }
                            // 한번이상 사용하고 남은 잔포인트가 있는경우
                            } else {
                                // 기존 레코드의 나머지 금액을 0으로 업데이트
                                Point.findOneAndUpdate(
                                    { _id: pointInfos[i]._id },
                                    { $set: { remainingPoints: 0 }},
                                    { new: true },
                                    (err, pointInfo) => {
                                        if(err) {
                                            console.log(err);
                                            return res.status(400).json({ success: false, err });
                                        }
                                    }
                                )

                                // 기존 레코드를 복사
                                let dataToSubmit = {
                                    seq: pointInfos[i].seq,
                                    subSeq: pointInfos[i].subSeq + 1,
                                    userId: pointInfos[i].userId,
                                    userName: pointInfos[i].userName,
                                    userLastName: pointInfos[i].userLastName,
                                    point: pointInfos[i].point,
                                    validFrom: pointInfos[i].validFrom,
                                    validTo: pointInfos[i].validTo
                                }
                                
                                const remainingPoints = pointInfos[i].remainingPoints;
                                // 기존 포인트 - 사용자가 입력한 포인트
                                let tmp = remainingPoints - pointToUse; 

                                if(tmp < 0) {
                                    // 가지고 온 포인트 정보의 사용자 포인트를 계산된 값으로 수정
                                    pointInfos[i].usePoint = tmp;

                                    dataToSubmit.usePoint = tmp;
                                    dataToSubmit.dspUsePoint = remainingPoints;
                                    dataToSubmit.remainingPoints = 0;
                                    dataToSubmit.dateUsed = currentDate;

                                    // 포인트 등록
                                    const point = new Point(dataToSubmit);
                                    point.save((err, doc) => {
                                        if (err) {
                                            console.log(err);
                                            return res.status(400).json({ success: false, err });
                                        }
                                    });
                                } else {
                                    dataToSubmit.usePoint = tmp;
                                    dataToSubmit.dspUsePoint = pointToUse;
                                    dataToSubmit.remainingPoints = tmp;
                                    dataToSubmit.dateUsed = currentDate;

                                    // 포인트 등록
                                    const point = new Point(dataToSubmit);
                                    point.save((err, doc) => {
                                        if (err) {
                                            console.log(err);
                                            return res.status(400).json({ success: false, err });
                                        }
                                    });

                                    // [기존 포인트 > 사용자가 입력한 포인트] 인 경우 포인트계산 종료
                                    break;
                                }    
                            }
                        } else {
                            let usePoint = Math.abs(pointInfos[i-1].usePoint);
                            let remainingPoints = pointInfos[i].remainingPoints;

                            let tmp = 0;
                            // 전 레코드의 usePoint: 음수, 현재 레코드의 point: 양수 <- 이 조건만 있을수 있다  
                            if (usePoint <= remainingPoints) {
                                tmp = remainingPoints - usePoint; // 포인트가 남거나 0이 되기때문에 현재 레코드에서 계산이 종료되는 경우
                            } else {
                                tmp = (usePoint - remainingPoints) * -1; // 포인트가 부족해서 다음 레코드에서 계산을 해야 하는경우
                            }
                            
                            if(tmp < 0) {
                                // 전 레코드의 계산된 포인트로 가지고 온 포인트 정보의 사용자 포인트를 계산된 값으로 수정
                                pointInfos[i].usePoint = tmp;
                                // 포인트 업데이트
                                updatePoint(pointInfos[i]._id, remainingPoints, tmp, 0, currentDate);
                            } else {
                                // 포인트 업데이트
                                updatePoint(pointInfos[i]._id, usePoint, tmp, tmp, currentDate);
                                // [기존 포인트 > 사용자가 입력한 포인트] 인 경우 포인트계산 종료
                                break;
                            }
                        }
                    }
                });
        } else {
            // 포인트 누적할 항목 설정
            let dataToSubmit = {
                userId: req.user._id,
                userName: req.user.name,
                userLastName: req.user.lastName,
                point: req.body.productPoint, // 구매상품 포인트 합계
                remainingPoints: req.body.productPoint,// 구매상품 포인트 합계
                usePoint: 0,
                dspUsePoint: 0,
                validFrom: currentDate,
                validTo: oneYearDate,
                dateUsed:''
            }

            // 포인트 등록
            savePoint(dataToSubmit)
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
})

const savePoint  = (dataToSubmit)  => {
    // 카운트를 증가시키고 포인트 저장
    Counter.findOneAndUpdate(
        { name: "point" },
        { $inc: { "seq": 1 }},
        { new: true },
        (err, countInfo) => {
            if (err) return res.status(400).json({ success: false, err });
            
            // 포인트의 seq에 카운트에서 가져온 일련번호를 대입해서 포인트를 생성 
            dataToSubmit.seq = countInfo.seq; 
            const point = new Point(dataToSubmit);
            point.save((err, doc) => {
                if (err) return res.status(400).json({ success: false, err });
            });
        }
    )
}

const updatePoint = (tmp1, tmp2, tmp3, tmp4, tmp5) => {
    Point.findOneAndUpdate(
        { _id: tmp1 },
        { $set: { dspUsePoint: tmp2, usePoint: tmp3, remainingPoints: tmp4, dateUsed: tmp5 }},
        { new: true },
        (err, pointInfo) => {
            if(err) return res.status(400).json({ success: false, err });
        }
    )
}

router.post('/successBuyTmp', auth, (req, res) => {
    try {
        let history = [];
        let transactionData = {};

        let date = new Date();
        const dateInfo = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString();
        // 결제한 카트에 담겼던 상품정보를 TmpPayment의 product정보에 넣기위해 history 배열에 셋팅
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

        // TmpPayment에 자세한 결제정보 저장
        // user정보
        transactionData.user = {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email,
        }
        // data정보
        transactionData.data = req.body.paymentData;
        // product정보(cart정보)
        transactionData.product = history;

        // 사용자의 Cart정보 삭제
        User.findOneAndUpdate(
            { _id: req.user._id },
            { $set: { cart: [] }},
            { new: true },
            (err, user) => {
                if(err) return res.status(400).json({ success: false, err });

                // TmpPayment에 transactionData정보 저장
                const tmpPayment = new TmpPayment(transactionData);
                tmpPayment.save((err, doc) => {
                    if(err) return res.status(400).json({ success: false, err });

                    return res.status(200).json({
                        success: true,
                        cart: user.cart,
                        cartDetail: [],
                        payment: doc
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