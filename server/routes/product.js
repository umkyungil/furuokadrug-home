const express = require('express');
const router = express.Router();
const { Product } = require('../models/Product');

const multer = require('multer');
const multerS3 = require('multer-s3')
const AWS = require('aws-sdk');
const awsConfig = require("../config/awsConfig");

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
  const product = new Product(req.body)
  product.save((err) => {
    if (err) return res.status(400).json({success: false, err})
    return res.status(200).json({success: true});
  })
})

// 상품 가져오기(LandingPage)
router.post('/products', (req, res) => {
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
      .find({ 
        "title": { '$regex': term }
      })
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
})

// 상품상세(상품정보 가져오기), 카트페이지에서 상폼정보 가져오기
router.get('/products_by_id', (req, res) => {
  let type = req.query.type;
  let productId = req.query.id;

  if (type === "array") {
    let ids = req.query.id.split(',')
  }
  // productId를 이용해서 DB에서 productId와 같은 상품의 정보를 가져온다
  Product.find({ _id: productId })
    .populate('writer')
    .exec((err, product) => {
      if (err) return res.status(400).send(err)
      return res.status(200).send({success: true, product});
    })
})

// 상품삭제
router.post('/delete', (req, res) => {  
  let isErr = false;

  if (req.body.images.length > 0) {
    let images = req.body.images;
    
    console.log("images: ", images);

    // AWS S3 이미지 삭제
    for (let i=0; i<images.length; i++) {
      let str = images[i];
      let words = str.split('/');
      let fileName = words[words.length-1]

      console.log("fileName: ", fileName);

      s3.deleteObject({
        Bucket: "furuokadrug-bucket", // 사용자 버켓 이름
        Key: fileName // 버켓 내 경로
      }, (err, data) => {
        if (err) { 
          isErr = true;
          console.log(err, err.stack);
        }
        console.log("image delete: ", data);
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

  console.log("isErr3: ", isErr);
  if (!isErr) {
    return res.json({success: true});
  } else {
    return res.json({success: false});
  }
})

// 상품 등록에서 이미지삭제
router.post('/delete_image', (req, res) => {
  let str = req.body.image;
  let words = str.split('/');
  let fileName = words[words.length-1]

  s3.deleteObject({
    Bucket: "furuokadrug-bucket", // 사용자 버켓 이름
    Key: fileName // 버켓 내 경로
  }, (err, data) => {
    if (err) { 
      console.log(err, err.stack);
      return res.json({ success: false }) 
    }
    return res.json({ success: true});    
  })
})

module.exports = router;