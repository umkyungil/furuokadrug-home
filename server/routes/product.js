const express = require('express');
const router = express.Router();
const multer = require('multer');
const { Product } = require('../models/Product');
const fs = require('fs');

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

// 상품 가져오기
router.post('/products', (req, res) => {
  // product collection에 들어 있는 모든 상품 정보 가져오기
  let limit = req.body.limit ? parseInt(req.body.limit) : 20;
  let skip  = req.body.skip  ? parseInt(req.body.skip)  : 0;
  let term = req.body.searchTerm;
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
    // findArgs: find에 객체 형태로 주면 조건식이 된다
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
  let productIds = req.query.id;

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
  // Image 삭제
  if (req.body.images.length > 0) {
    let images = req.body.images;
    for (let i=0; i<images.length; i++) {
      let path = images[i];
      try {
        fs.unlinkSync(path);
      } catch(err) {
        return res.json({ success: false}, err);
      }
    } 
  }

  if (req.body.id) {
    // DataBase 삭제
    Product.deleteOne({_id: req.body.id})
    .then((r)=>{
      console.log(r.result);
      return res.json({ success: true});
    }, (err)=>{
      if(err) console.log(err);
      return res.json({success: false, err});
    });
  }
})

// Image 삭제
router.post('/delete_image', (req, res) => {
  let path = req.body.image;
  try {
    fs.unlinkSync(path);
    return res.json({ success: true});
  } catch(err) {
    return res.json({ success: false}, err);
  }
})


module.exports = router;
