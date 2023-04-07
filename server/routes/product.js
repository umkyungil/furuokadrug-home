const express = require('express');
const router = express.Router();
const { Product } = require('../models/Product');
const { AmazonWebService } = require('../models/AmazonWebService');
const multer = require('multer');
const multerS3 = require('multer-s3')
const AWS_SDK = require('aws-sdk');
const { MAIN_CATEGORY, AWS_S3, AWS_BUCKET_NAME } = require("../config/const");

//=================================
//             Product
//=================================

// 파일 업로드에서 AWS에 이미지 등록하기
router.post('/image', async (req, res) => {
  // AWS정보 가져오기
  const s3Infos = await AmazonWebService.findOne({ type: AWS_S3 });
  const s3Object = new AWS_SDK.S3({
    accessKeyId: s3Infos.access,
    secretAccessKey: s3Infos.secret,
    region: s3Infos.region
  });

  // AWS 이미지 등록
  const s3Upload = multer({
    storage: multerS3({
      s3: s3Object,
      bucket: AWS_BUCKET_NAME,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname});
      },
      key: function (req, file, cb) {
        cb(null, `${ Date.now()}_${file.originalname }`);
      },
    }),
  });
  
  const uploadSingle = s3Upload.single("file");
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

// 상품 가져오기(카테고리 또는 키워드 검색)
router.post('/list', async (req, res) => {
  try {
    // 화면 표시 갯수 정의
    let limit = req.body.limit ? parseInt(req.body.limit) : 20;
    let skip  = req.body.skip ? parseInt(req.body.skip)  : 0;
    // 검색어
    let term = req.body.searchTerm;

    // findArgs: find로 검색할때 객체 형태로 만들어 Query의 조건식으로 사용
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

    // 키워드 검색
    if (term) {
      // Product.find(findArgs)
      // //.find({ $text: { $search: term } })
      // .find({ 'title': { '$regex': term }})
      // .populate('writer')
      // .skip(skip)
      // .limit(limit)
      // .exec((err, productInfo) =>{
      //   if (err) return res.status(400).json({ success: false, err });
      //   return res.status(200).json({ success: true, productInfo, postSize: productInfo.length })
      // })
      
      // 중국어 타이틀 검색
      const chineseProductInfo = await Product.find(findArgs).find({ 'chineseTitle': { '$regex': term }}).populate('writer').skip(skip).limit(limit);
      if (chineseProductInfo.length > 0) {
        return res.status(200).json({ success: true, productInfo: chineseProductInfo, postSize: chineseProductInfo.length });
      }
      // 영어타이틀 검색
      const englishProductInfo = await Product.find(findArgs).find({ 'englishTitle': { '$regex': term }}).populate('writer').skip(skip).limit(limit);
      if (englishProductInfo.length > 0) {
        return res.status(200).json({ success: true, productInfo: englishProductInfo, postSize: englishProductInfo.length });
      }
      // 일본어 타이틀 검색
      const japaneseProductInfo = await Product.find(findArgs).find({ 'title': { '$regex': term }}).populate('writer').skip(skip).limit(limit);
      if (japaneseProductInfo.length > 0) {
        return res.status(200).json({ success: true, productInfo: japaneseProductInfo, postSize: japaneseProductInfo.length });
      }
    } else {
      // 카테고리 검색
      const productInfo = await Product.find(findArgs).populate('writer').skip(skip).limit(limit);
      return res.status(200).json({ success: true, productInfo, postSize: productInfo.length });
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

// Landing page, Product list page 에서 조건별 상품가져오기 
// type:1 now on airt, type:2 recording, type:3 추천상품, type:4 세일상품
router.post('/products_by_type', async (req, res) => {
  try {
    // 화면 표시 갯수 정의
    let limit = req.body.limit ? parseInt(req.body.limit) : 20;
    let skip  = req.body.skip ? parseInt(req.body.skip)  : 0;
    let type = req.body.type;

    const productInfos = await Product.find({exposureType: { $in: type }}).skip(skip).limit(limit);
    return res.status(200).json({ success: true, productInfos });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// 상품삭제
router.post('/delete', async (req, res) => {
  try {
    // AWS 정보가져오기
    const s3Infos = await AmazonWebService.findOne({ type: AWS_S3 });
    const s3Object = new AWS_SDK.S3({
      accessKeyId: s3Infos.access,
      secretAccessKey: s3Infos.secret,
      region: s3Infos.region
    });

    // AWS S3 이미지 삭제
    let images = req.body.images;
    for (let i=0; i<images.length; i++) {
      let str = images[i];
      let words = str.split('/');
      let fileName = words[words.length-1];
      const params = { Bucket: AWS_BUCKET_NAME, Key: fileName };

      s3Object.deleteObject(params, (err, data) => {
        if (err) {
          console.log(err, err.stack);
          return res.json({success: false, err});
        }
      })
    }

    // DataBase 삭제
    await Product.findOneAndDelete({_id: req.body.id});
    return res.status(200).json({success: true});
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// 상품 등록에서 이미지를 클릯했을때 이미지 삭제
router.post('/delete_image', async (req, res) => {
  try {
    // AWS 정보가져오기
    const s3Infos = await AmazonWebService.findOne({ type: AWS_S3 });
    const s3Object = new AWS_SDK.S3({
      accessKeyId: s3Infos.access,
      secretAccessKey: s3Infos.secret,
      region: s3Infos.region
    });
    
    let str = req.body.image;
    let words = str.split('/');
    let fileName = words[words.length-1];
    const params = { Bucket: AWS_BUCKET_NAME, Key: fileName };

    s3Object.deleteObject(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
        return res.json({success: false, err});
      } else {
        return res.status(200).json({success: true});
      }
    })
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// 상품수정(이미지 경로포함)
router.post('/update', async (req, res) => {
  try {
    // AWS 정보가져오기
    const s3Infos = await AmazonWebService.findOne({ type: AWS_S3 });
    const s3Object = new AWS_SDK.S3({
      accessKeyId: s3Infos.access,
      secretAccessKey: s3Infos.secret,
      region: s3Infos.region
    });

    // 기존 이미지 삭제
    const oldImages = req.body.oldImages
    // AWS S3 이미지 삭제
    // for (let i = 0; i < oldImages.length; i++) {
    //   let str = oldImages[i];
    //   let words = str.split('/');
    //   let fileName = words[words.length-1];
    //   const params = { Bucket: AWS_BUCKET_NAME, Key: fileName };

    //   s3Object.deleteObject(params, (err, data) => {
    //     if (err) {
    //       console.log(err, err.stack);
    //       return res.json({success: false, err});
    //     }
    //   })
    // }

    // 업데이트 처리
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
    product.englishUrl = req.body.englishUrl;
    product.chineseUrl = req.body.chineseUrl;
    product.japaneseUrl = req.body.japaneseUrl;

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