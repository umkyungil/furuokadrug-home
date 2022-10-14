const express = require('express');
const router = express.Router();
const { Product } = require('../models/Product');
const multer = require('multer');
const multerS3 = require('multer-s3')
const AWS = require('aws-sdk');
const awsConfig = require("../config/aws");

//=================================
//             Product
//=================================

// AWS S3 접속 Key
const s3 = new AWS.S3({
  accessKeyId: awsConfig.accessKeyId,
  secretAccessKey: awsConfig.secretAccessKey,
  region: awsConfig.region
});

// 이미지파일 등록 AWS 정의
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: "furuokadrug-bucket",
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, `${ Date.now()}_${file.originalname }`);
    },
  }),
});

// 이미지 등록
router.post('/image', (req, res) => {
  const uploadSingle = upload.single("file");
  uploadSingle(req, res, err => {
    if(err) return res.json({success: false, err});
    return res.json({ success: true, filePath: res.req.file.location});
  })
})

// 상품 등록(이미지 경로포함)
router.post('/', (req, res) => {
  try {
    const product = new Product(req.body)
    product.save((err) => {
      if (err) return res.status(400).json({success: false, err})
      return res.status(200).json({success: true});
    })
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// 상품 가져오기(LandingPage)
router.post('/products', (req, res) => {
  try {
    // 화면 표시 갯수 정의
    let limit = req.body.limit ? parseInt(req.body.limit) : 20;
    let skip  = req.body.skip ? parseInt(req.body.skip)  : 0;

    let term = req.body.searchTerm;
    // findArgs: find에 객체 형태로 만들어 Query의 조건식으로 사용
    let findArgs = {};
    
    for (let key in req.body.filters) {
      if (req.body.filters[key].length > 0) {
        // key -> continent 또는 price
        if (key === "price") {
          findArgs[key] = {
            //greater then equal -> MongoDB
            $gte: req.body.filters[key][0], 
            //less than equal
            $lte: req.body.filters[key][1]
          }
        } else {
          findArgs[key] = req.body.filters[key];
        }
      }
    }

    if (term) {
      Product.find(findArgs)
      //.find({ $text: { $search: term } })
      .find({ "title": { '$regex': term }})
      .populate("writer")
      .skip(skip)
      .limit(limit)
      .exec((err, productInfo) =>{
        if (err) return res.status(400).json({ success: false, err });
        return res.status(200).json({ success: true, productInfo, postSize: productInfo.length })
      })
    } else {
      Product.find(findArgs)
      .populate("writer")
      .skip(skip)
      .limit(limit)
      .exec((err, productInfo) =>{
        if (err) return res.status(400).json({ success: false, err });
        return res.status(200).json({ success: true, productInfo, postSize: productInfo.length })
      })
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// 상품상세(상품정보 가져오기), 카트페이지에서 상폼정보 가져오기
router.get('/products_by_id', (req, res) => {
  try {
    let type = req.query.type;
    let productIds = req.query.id;

    // 카트의 상품정보들 처리
    if (type === "array") {
      // id=1234,1234,1234 로 되어 있는걸 
      // productIds=['1234','1234']로 배열에 담는다
      let ids = req.query.id.split(',')
      productIds = ids.map(item => {
        return item;
      })
    }
    // 하나 이상의 productId로 상품의 정보들을 가져온다
    Product.find({ _id: { $in: productIds } })
    .populate('writer')
    .exec((err, product) => {
      if (err) {
        console.log("err: ", err);
        return res.status(400).send(err)
      }
      return res.status(200).send(product);
    })
  } catch (error) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// 상품삭제
router.post('/delete', (req, res) => {
  try {
    let isErr = false;

    if (req.body.images.length > 0) {
      let images = req.body.images;

      // AWS S3 이미지 삭제
      for (let i=0; i<images.length; i++) {
        let str = images[i];
        let words = str.split('/');
        let fileName = words[words.length-1]

        s3.deleteObject({
          Bucket: "furuokadrug-bucket", // 사용자 버켓 이름
          Key: fileName // 버켓 내 경로
        }, (err, data) => {
          if (err) { 
            isErr = true;
            console.log(err, err.stack);
          }
        })
      } 
    }

    if (!isErr) {
      // DataBase 삭제
      if (req.body.id) {
        Product.deleteOne({_id: req.body.id})
        .then((r)=>{
          console.log("DB delete: ", r.result);
        }, (err)=>{
          if(err) {
            console.log(err);
            isErr = true;
          }
        });
      }
    }

    if (!isErr) {
      return res.json({success: true});
    } else {
      return res.json({success: false});
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// 상품 등록에서 이미지삭제
router.post('/delete_image', (req, res) => {
  try {
    let str = req.body.image;
    let words = str.split('/');
    let fileName = words[words.length-1]

    s3.deleteObject({
      Bucket: "furuokadrug-bucket", // 사용자 버켓 이름
      Key: fileName // 버켓 내 경로
    }, (err, data) => {
      if (err) {
        return res.json({ success: false }) 
      }
      return res.json({ success: true});    
    })
  } catch (error) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// 상품수정(이미지 경로포함)
router.post('/update', (req, res) => {
  try {
    // 기존 이미지 취득
    const oldImages = req.body.oldImages
    // AWS S3 이미지 삭제
    for (let i=0; i<oldImages.length; i++) {
      let str = oldImages[i];
      let words = str.split('/');
      let fileName = words[words.length-1]

      s3.deleteObject({
        Bucket: "furuokadrug-bucket", // 사용자 버켓 이름
        Key: fileName // 버켓 내 경로
      }, (err, data) => {
        if (err) { 
          isErr = true;
          console.log(err, err.stack);
        }
      })
    }
    // 데이타 삭제
    Product.deleteOne({_id: req.body.id})
    .then((r)=>{
      console.log("Database delete success");
    }, (err)=>{
      if(err) {
        console.log(err);
      }
    });
    // 데이타 저장
    const product = new Product(req.body)
    product.save((err) => {
      if (err) return res.status(400).json({success: false, err})
      return res.status(200).json({success: true});
    })
  } catch (error) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// 상품 가져오기(Coupon)
router.post('/coupon/list', (req, res) => {
  try {
    let item = Number(req.body.item);
    let term = req.body.searchTerm;

    if (item === 0) {
      if (term) {
        Product.find({ "title": { '$regex': term }})
        .populate("writer")
        .exec((err, productInfo) =>{
          if (err) return res.status(400).json({ success: false, err });
          return res.status(200).json({ success: true, productInfo })
        })
      } else {
        Product.find({})
        .populate("writer")
        .exec((err, productInfo) =>{
          if (err) return res.status(400).json({ success: false, err });
          return res.status(200).json({ success: true, productInfo })
        })
      }
    } else {
      if (term) {
        Product.find({ "title": { '$regex': term }, "continents": item })
        .populate("writer")
        .exec((err, productInfo) =>{
          if (err) return res.status(400).json({ success: false, err });
          return res.status(200).json({ success: true, productInfo })
        })
      } else {
        Product.find({ "continents": item })
        .populate("writer")
        .exec((err, productInfo) =>{
          if (err) return res.status(400).json({ success: false, err });
          return res.status(200).json({ success: true, productInfo })
        })
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// 상품 가져오기(Coupon)
router.get('/coupon/products_by_id', (req, res) => {
  try {
    let id = req.query.id;

    Product.find({ "_id": id })
    .exec((err, productInfo) =>{
      if (err) return res.status(400).json({ success: false, err });
      return res.status(200).json({ success: true, productInfo })
    })
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

module.exports = router;