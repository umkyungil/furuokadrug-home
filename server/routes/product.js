const express = require('express');
const router = express.Router();
const { Product } = require('../models/Product');
const multer = require('multer');
const multerS3 = require('multer-s3')
const AWS = require('aws-sdk');
const { S3_CONFIG } = require("../config/aws");
const { MAIN_CATEGORY, BUCKET_NAME } = require('../config/const');

//=================================
//             Product
//=================================

// AWS S3 접속 Key
const s3 = new AWS.S3({
  accessKeyId: S3_CONFIG.access,
  secretAccessKey: S3_CONFIG.secret,
  region: S3_CONFIG.region
});

// 이미지파일 등록 AWS 정의
const uploadS3Object = multer({
  storage: multerS3({
    s3: s3,
    bucket: BUCKET_NAME,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, `${ Date.now()}_${file.originalname }`);
    },
  }),
});

const deleteS3Object = async (params) => {
  s3.deleteObject(params, (err, data) => {
    if (err) {
      console.log('AWS S3 file delete error');
      console.log(err, err.stack);
      return false;
    } else {
      console.log('AWS S3 file delete success' + data);
      return true;
    }
  })
}

// 파일 업로드에서 AWS에 이미지 등록하기
router.post('/image', (req, res) => {
  const uploadSingle = uploadS3Object.single("file");
  uploadSingle(req, res, err => {
    if(err) return res.json({success: false, err});
    return res.json({ success: true, filePath: res.req.file.location});
  })
})

// 상품 등록(이미지 경로포함)
router.post('/register', (req, res) => {
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
    
    // 카트에 표시할 상품정보 취득시 array로 들어온다(user_action)
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
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// 메인페이지에서 now on airt, recording, 추천상품, 세일상품 가져오기
router.post('/products_by_type', async (req, res) => {
  try {
    let type = req.body.type;
    const productInfos = await Product.find({exposureType: { $in: type }});
    return res.status(200).json({ success: true, productInfos });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// 상품삭제
router.post('/delete', async (req, res) => {
  try {
    if (req.body.images.length > 0) {
      let images = req.body.images;

      // AWS S3 이미지 삭제
      for (let i=0; i<images.length; i++) {
        let str = images[i];
        let words = str.split('/');
        let fileName = words[words.length-1]

        const params = {
          Bucket: BUCKET_NAME,
          Key: fileName
        }

        await deleteS3Object(params);
      } 
    }

    // DataBase 삭제
    await Product.findOneAndDelete({_id: req.body.id});
    return res.json({success: true});
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// 상품 등록에서 이미지삭제
router.post('/delete_image', async (req, res) => {
  try {
    let str = req.body.image;
    let words = str.split('/');
    let fileName = words[words.length-1]

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName
    }

    await deleteS3Object(params);
    return res.json({ success: true});
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// 상품수정(이미지 경로포함)
router.post('/update', async (req, res) => {
  try {
    // 기존 이미지 취득
    const oldImages = req.body.oldImages
    // AWS S3 이미지 삭제
    for (let i=0; i<oldImages.length; i++) {
      let str = oldImages[i];
      let words = str.split('/');
      let fileName = words[words.length-1]

      const params = {
        Bucket: BUCKET_NAME,
        Key: fileName
      }
      await deleteS3Object(params);
    }

    let product = await Product.findById(req.body.id);
    product.writer = req.body.writer;
    product.title = req.body.title;
    product.englishTitle = req.body.englishTitle;
    product.chineseTitle = req.body.chineseTitle;
    product.description = req.body.description;
    product.englishDescription = req.body.englishDescription;
    product.chineseDescription = req.body.chineseDescription;
    product.usage = req.body.usage;
    product.englishUsage = req.body.englishUsage;
    product.chineseUsage = req.body.chineseUsage;
    product.contents = req.body.contents;
    product.price = req.body.price;
    product.point = req.body.point;
    product.images = req.body.images;
    product.oldImages = req.body.oldImages;
    product.continents = req.body.continents;
    product.exposureType = req.body.exposureType;

    // 데이타 저장
    await product.save();
    return res.status(200).json({success: true});
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// 상품 가져오기(Coupon)
router.post('/coupon/list', (req, res) => {
  try {
    let item = Number(req.body.item);
    let term = req.body.searchTerm;

    if (item === MAIN_CATEGORY[0].key) {
      if (term) {
        Product.find({ "title": { '$regex': term }})
        .populate("writer")
        .exec((err, productInfo) =>{
          if (err) return res.status(400).json({ success: false, err });
          return res.status(200).json({ success: true, productInfo })
        })
      } else {
        Product.find()
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