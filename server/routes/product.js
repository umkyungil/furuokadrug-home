const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Product } = require('../models/Product');

//=================================
//             Product
//=================================

// 이미지파일 등록 라이브러리 정의
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    //const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `${Date.now()}_${file.originalname}`); //file.fieldname + '-' + uniqueSuffix)
  }
})

const upload = multer({ storage: storage }).single("file");

// 이미지파일 등록
router.post('/image', (req, res) => {
  // 가져온 이미지를 저장한다
  upload(req, res, err => {
    if(err) {
      return res.json({success: false, err});
    }
    return res.json({ success: true, filePath: res.req.file.path, fileName: res.req.file.filename});
  })
})

// 상품 등록(이미지 포함)
router.post('/', (req, res) => {
  // 받아온 정보들을 디비에 넣어준다
  const product = new Product(req.body)
  product.save((err) => {
    if (err) return res.status(400).json({success: false, err})
    return res.status(200).json({success: true});
  })
})

// 상품 검색
router.post('/products', (req, res) => {

  // product collection에 들어 있는 모든 상품 정보 가져오기
  let limit = req.body.limit ? parseInt(req.body.limit) : 20;
  let skip  = req.body.skip  ? parseInt(req.body.skip)  : 0;

  Product.find()
    .populate("writer")
    .skip(skip)
    .limit(limit)
    .exec((err, productInfo) =>{
      if (err) return res.status(400).json({ success: false, err });
      return res.status(200).json({ success: true, productInfo, postSize: productInfo.length })
    })
  
})

module.exports = router;
