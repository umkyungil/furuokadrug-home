const express = require('express');
const router = express.Router();
const { Sale } = require("../models/Sale");
const { SaleHistory } = require("../models/SaleHistory");

//=================================
//             Sale
//=================================

// 세일정보 가져오기
router.get("/list", async (req, res) => {
    try {
        Sale.find()
            .sort({ "createdAt": -1 })
            .exec((err, saleInfos) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).send({ success: true, saleInfos });
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// 현재 날짜가 포함된 세일정보 가져오기
router.get("/listOfAvailable", async (req, res) => {
    try {
        let saleInfos = [];
        let dt = new Date();
        let tmpCur = new Date(dt.getTime() - (dt.getTimezoneOffset() * 60000)).toISOString();
        let currentDate = new Date(tmpCur.substring(0, 10));

        const sales = await Sale.find().sort({ "createdAt": 1 })

        for (let i=0; i<sales.length; i++) {
            let tmpFrom = new Date(sales[i].validFrom);
            let tmpTo = new Date(sales[i].validTo);
            let validFrom = new Date(tmpFrom.toISOString().substring(0, 10));
            let validTo = new Date(tmpTo.toISOString().substring(0, 10) + " 23:59:59");

            // 현재일자가 유효기간내에 있는 세일정보
            if ((validFrom <= currentDate && currentDate <=  validTo)) {
                saleInfos.push(sales[i]);
            }
        }
        
        return res.status(200).send({success: true, saleInfos});
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// 카테고리, 상품이 같고 기간이 겹치는 세일정보 존재파악
// 카테고리, 상품이 같고 기간이 겹치는 세일제외정보 존재파악
router.post("/exist", async (req, res) => {
    try {
        let saleInfos = [];

        const code = req.body.code; // 세일코드
        const item = Number(req.body.item); // 카테고리
        const productId = req.body.productId; // 상품 아이디
        
        let tmpF1 = new Date(req.body.validFrom);
        let tmpT1 = new Date(req.body.validTo);
        let conditionFrom = new Date(tmpF1.toISOString().substring(0, 10));
        let conditionTo = new Date(tmpT1.toISOString().substring(0, 10) + " 23:59:59");

        // 모든 세일정보에서 세일코드가 중복되는지 체크(세일대상외 정보도 포함)
        let sales = await Sale.find().sort({ "createdAt": 1 });
        for (let i=0; i<sales.length; i++) {
            // 세일정보가 있으면 강제종료
            if (code === sales[i].code) {
                return res.status(200).send({ success: false });
            }
        }

        sales = [];
        if (req.body.except) {
            // 모든 세일제외정보 가져오기
            sales = await Sale.find({ 'except': true, 'active': "1" }).sort({ "createdAt": 1 })
        } else {
            // 모든 세일정보 가져오기
            sales = await Sale.find({ 'except': false, 'active': "1" }).sort({ "createdAt": 1 })
        }

        for (let i=0; i<sales.length; i++) {
            // 카테고리가 같은지
            if (item === sales[i].item) {
                let tmpF2 = new Date(sales[i].validFrom);
                let tmpT2 = new Date(sales[i].validTo);
                let validFrom = new Date(tmpF2.toISOString().substring(0, 10));
                let validTo = new Date(tmpT2.toISOString().substring(0, 10) + " 23:59:59");
            
                // 지정된 상품이 있다면
                if (productId !== "") {
                    // 상품이 같은지
                    if (productId === sales[i].productId) {
                        // 유효기간이 등록된 세일정보의 유효기간 안에 포함되는지
                        if ((validFrom <=  conditionFrom && conditionFrom <= validTo) || (validFrom <=  conditionTo && conditionTo <= validTo)) {
                            saleInfos.push(sales[i]);
                        }
                        // 유효기간이 등록된 세일정보의 유효기간을 포함하는지
                        if (conditionFrom < validFrom && validTo < conditionTo) {
                            saleInfos.push(sales[i]);
                        }
                    }
                } else {
                    if (sales[i].productId === "") {
                        // 카테고리가 같은 세일정보에서 검색기간 시작일 또는 종료일이 유효기간 내에 있는지
                        if ((validFrom <=  conditionFrom && conditionFrom <= validTo) || (validFrom <=  conditionTo && conditionTo <= validTo)) {
                            saleInfos.push(sales[i]);
                        }
                        // 카테고리가 같은 세일정보에서 검색기간이 유효기간을 포함하는지
                        if (conditionFrom < validFrom && validTo < conditionTo) {
                            saleInfos.push(sales[i]);
                        }
                    }
                }
            }
        }
        
        return res.status(200).send({success: true, saleInfos});
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// 세일등록
router.post("/register", (req, res) => {
    try {
        const sale = new Sale(req.body);
        sale.save((err, doc) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).json({ success: true });
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }   
});

// 세일정보 가져오기(code)
router.get('/sales_by_cd', (req, res) => {
    try {
        let cd = req.query.cd;
        
        Sale.find({ code: cd })
        .exec((err, couponInfo) => {
            if (err) return res.status(400).send(err);
            return res.status(200).send({success: true, saleInfo});
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// 세일정보 가져오기(id)
router.get('/sales_by_id', (req, res) => {
    try {
        let saleId = req.query.id;
        
        Sale.find({ _id: saleId })
        .exec((err, saleInfo) => {
            if (err) return res.status(400).send(err);
            return res.status(200).send({success: true, saleInfo});
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }
});

// 세일정보 업데이트
router.post("/update", (req, res) => {
    try {
        Sale.findOneAndUpdate(
            { _id: req.body.id },
            { active: req.body.active },
            (err, doc) => {
                if(err) return res.status(400).json({ success: false, message: err.message })
                return res.status(200).send({ success: true });
            }
        );
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message })
    }
});

// 사용자 삭제
router.post('/delete', (req, res) => {
    try {
        let saleId = req.body.id;
    
        Sale.deleteOne({_id: saleId})
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

// 세일이력 등록
router.post("/history/register", (req, res) => {
    try {
        const history = new SaleHistory(req.body);
        history.save((err, doc) => {
            if (err) return res.json({ success: false, err });
            return res.status(200).json({ success: true });
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }   
});

// 세일이력 가져오기(get)
router.get("/history/list", (req, res) => {
    try {
        // 세일정보 가져오기
        SaleHistory.find()
            .sort({ "createdAt": -1 })
            .exec((err, saleInfos) => {
                if (err) return res.status(400).json({success: false, err});
                return res.status(200).send({ success: true, saleInfos });
        })
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: err.message });
    }   
});

module.exports = router;