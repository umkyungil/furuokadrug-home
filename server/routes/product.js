const express = require('express');
const router = express.Router();
const { Product } = require('../models/Product');
const { Code } = require('../models/Code');
const multer = require('multer');
const multerS3 = require('multer-s3')
const AWS_SDK = require('aws-sdk');
const { MAIN_CATEGORY, AWS_S3, AWS_BUCKET_NAME } = require("../config/const");

//=================================
//             Product
//=================================

// 파일 업로드에서 AWS에 이미지 등록하기
router.post('/image', async (req, res) => {
  try {
    // AWS정보 가져오기
    const s3Info = await Code.findOne({ code: AWS_S3 });
    const s3Object = new AWS_SDK.S3({
      accessKeyId: s3Info.value1,
      secretAccessKey: s3Info.value2,
      region: s3Info.value3
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
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
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
    const limit = req.body.limit ? parseInt(req.body.limit) : 20;
    const skip  = req.body.skip ? parseInt(req.body.skip)  : 0;
    const userId = req.body.id;
    const term = req.body.searchTerm; // 검색어
    const category = req.body.continents // 카테고리

    // 키워드 검색
    if (term && !category) {
      // 중국어 타이틀 검색
      let chineseTitleProducts;
      if (userId) {
        chineseTitleProducts = await Product.find({'chineseTitle': {'$regex': term}}).sort({"englishTitle": 1, "price": 1}).skip(skip);
      } else {
        chineseTitleProducts = await Product.find({'chineseTitle': {'$regex': term}, $or: [{'member': {$exists: false}}, {'member': false}]})
        .sort({"englishTitle": 1, "price": 1}).skip(skip);
      }

      // 지정된 데이타 갯수만큼 추출
      let _20ChineseTitleProducts = [];      
      if (chineseTitleProducts.length > 0) {
        for (let i = 0; i < chineseTitleProducts.length; i++) {
          // 0부터 시작하니까 [i < limit]로 조건을 준다
          if (i < limit) {
            _20ChineseTitleProducts.push(chineseTitleProducts[i]);
          }
        }
        return res.status(200).json({ success: true, productInfo: _20ChineseTitleProducts, postSize: chineseTitleProducts.length });
      }

      // 영어 타이틀 검색
      let englishTitleProducts;
      if (userId) {
        englishTitleProducts = await Product.find({'englishTitle': {'$regex': term}}).sort({"englishTitle": 1, "price": 1}).skip(skip);
      } else {
        englishTitleProducts = await Product.find({'englishTitle': {'$regex': term}, $or: [{'member': {$exists: false}}, {'member': false}]})
        .sort({"englishTitle": 1, "price": 1}).skip(skip);
      }

      // 지정된 데이타 갯수만큼 추출
      let _20EnglishTitleProducts = [];
      if (englishTitleProducts.length > 0) {
        for (let i = 0; i < englishTitleProducts.length; i++) {
          if (i < limit) {
            _20EnglishTitleProducts.push(englishTitleProducts[i]);
          }
        }
        return res.status(200).json({ success: true, productInfo: _20EnglishTitleProducts, postSize: englishTitleProducts.length });
      }

      // 일본어 타이틀 검색
      let japaneseTitleProducts;
      if (userId) {
        japaneseTitleProducts = await Product.find({'title': {'$regex': term}}).sort({"englishTitle": 1, "price": 1}).skip(skip);
      } else {
        japaneseTitleProducts = await Product.find({'title': {'$regex': term}, $or: [{'member': {$exists: false}}, {'member': false}]})
        .sort({"englishTitle": 1, "price": 1}).skip(skip);
      }
      
      // 지정된 데이타 갯수만큼 추출
      let _20JapaneseTitleProducts = [];
      if (japaneseTitleProducts.length > 0) {
        for (let i = 0; i < japaneseTitleProducts.length; i++) {
          if (i < limit) {
            _20JapaneseTitleProducts.push(japaneseTitleProducts[i]);
          }
        }
        return res.status(200).json({ success: true, productInfo: _20JapaneseTitleProducts, postSize: japaneseTitleProducts.length });
      }

      // 데이타가 없는경우
      return res.status(200).json({ success: true });
      
    // 카테고리 검색
    } else if (!term && category) {
      const numCategory = Number(category);

      let categoryProduct;
      if (userId) {
        categoryProduct = await Product.find({'continents': numCategory}).sort({"englishTitle": 1, "price": 1}).skip(skip);
      } else {
        categoryProduct = await Product.find({'continents': numCategory, $or: [{'member': {$exists: false}}, {'member': false}]})
        .sort({"englishTitle": 1, "price": 1}).skip(skip);
      }
      
      // 지정된 데이타 갯수만큼 추출
      let _20CategoryProducts = [];
      for (let i = 0; i < categoryProduct.length; i++) {
        // 0부터 시작하니까 [i < limit]로 조건을 준다
        if (i < limit) {
          _20CategoryProducts.push(categoryProduct[i]);
        }
      }
      return res.status(200).json({ success: true, productInfo: _20CategoryProducts, postSize: categoryProduct.length });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// 상품정보 가져오기(관리자용 상품일람)
router.get("/list", async (req, res) => {
  try {
      const productInfos = await Product.find().sort({ "createdAt": -1 });
      return res.status(200).send({ success: true, productInfos });
  } catch (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: err.message });
  }
});

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

// Product list page 에서 조건별 상품가져오기 
// type:1 now on airt, type:2 recording, type:3 추천상품, type:4 세일상품
router.post('/products_by_type', async (req, res) => {
  try {
    // 화면 표시 갯수 정의
    const limit = req.body.limit ? parseInt(req.body.limit) : 20;
    const skip  = req.body.skip ? parseInt(req.body.skip)  : 0;
    const type = req.body.type;
    const userId = req.body.id;

    let typeProducts;
    if (userId) {
      // 로그인 한 사용자의 상품검색(회원): More버튼 표시를 위해 상품전체를 구한다
      typeProducts = await Product.find({exposureType: {$in: type}}).sort({"englishTitle": 1, "price": 1}).skip(skip);
    } else {
      // 로그인하지 않은 사용자의 상품검색(비회원): More버튼 표시를 위해 상품전체를 구한다
      typeProducts = await Product.find(
        {exposureType: {$in: type}, $or: [{'member': {$exists: false}}, {'member': false}]}).sort({"englishTitle": 1, "price": 1}).skip(skip);
    }
    
    // 지정된 데이타 갯수만큼 추출
    let _20TypeProducts = [];
    for (let i = 0; i < typeProducts.length; i++) {
      if (i < limit) {
        _20TypeProducts.push(typeProducts[i]);
      }      
    }
    return res.status(200).json({ success: true, productInfos: _20TypeProducts, postSize: typeProducts.length });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// Landing page 
// type:1 now on airt, type:2 recording, type:3 추천상품, type:4 세일상품
router.get('/all_products_by_type', async (req, res) => {
  try {
    const userId = req.query.id;
    
    let recdTypeProducts; // now on air, 레코딩상품 가져오기
    let recTypeProducts; // 추천상품 가져오기
    let saleTypeProducts; // 세일상품 가져오기

    // 로그인하지 않은 사용자의 상품검색(비회원)
    if (userId === "null" || userId === "") {
      recdTypeProducts = await Product.find(
        {exposureType: {$in: [1,2]}, $or: [{'member': {$exists: false}}, {'member': false}]}).sort({"englishTitle": 1, "price": 1}).limit(10);
      recTypeProducts = await Product.find(
        {exposureType: {$in: [3]}, $or: [{'member': {$exists: false}}, {'member': false}]}).sort({"englishTitle": 1, "price": 1 }).limit(10);
      saleTypeProducts = await Product.find(
        {exposureType: {$in: [4]}, $or: [{'member': {$exists: false}}, {'member': false}]}).sort({ "englishTitle": 1, "price": 1 }).limit(10);
    } else {
      // 로그인 한 사용자의 상품검색(회원)
      recdTypeProducts = await Product.find({exposureType: {$in: [1,2]}}).sort({ "englishTitle": 1, "price": 1 }).limit(10);
      recTypeProducts = await Product.find({exposureType: {$in: [3]}}).sort({ "englishTitle": 1, "price": 1 }).limit(10);
      saleTypeProducts = await Product.find({exposureType: {$in: [4]}}).sort({ "englishTitle": 1, "price": 1 }).limit(10);
    }

    let products = [];
    products.push(recdTypeProducts);
    products.push(recTypeProducts);
    products.push(saleTypeProducts);

    return res.status(200).json({ success: true, productInfos: products });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// 상품삭제
router.post('/delete', async (req, res) => {
  try {
    // AWS 정보가져오기
    const s3Info = await Code.findOne({ code: AWS_S3 });
    const s3Object = new AWS_SDK.S3({
      accessKeyId: s3Info.value1,
      secretAccessKey: s3Info.value2,
      region: s3Info.value3
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
    const s3Info = await Code.findOne({ code: AWS_S3 });
    const s3Object = new AWS_SDK.S3({
      accessKeyId: s3Info.value1,
      secretAccessKey: s3Info.value2,
      region: s3Info.value3
    });
    
    let str = req.body.image;
    let words = str.split('/');
    let fileName = words[words.length-1];

    const params = { Bucket: AWS_BUCKET_NAME, Key: fileName };

    s3Object.deleteObject(params, (err, data) => {
      if (err) {
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
    product.images = req.body.images;
    product.oldImages = req.body.oldImages;
    product.continents = req.body.continents;
    product.member = req.body.member;
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

// 상품재고 가져오기
router.post("/inventory/list", async (req, res) => {
  
  let term = req.body.searchTerm;
  try {
    // term[0] = 0은 전체 검색
    if (term[0] === '0' && term[1] === "") {
      Product.find()
        .sort({ "updatedAt": -1 })
        .skip(req.body.skip)
        .exec((err, productInfos) => {
          if (err) return res.status(400).json({ success: false, err });
          return res.status(200).json({ success: true, productInfos});
      });
    }

    // 상품명 검색
    if (term[0] === '0' && term[1] !== "") {
      Product.find({ "title":{ '$regex':term[1], $options: 'i' }})
        .sort({ "updatedAt": -1 })
        .skip(req.body.skip)
        .exec((err, productInfos) => {
          if (err) return res.status(400).json({ success: false, err });
          return res.status(200).json({ success: true, productInfos})
      });
    }

    //  재고관리 대상 상품중에서 품절된 모든상품 검색
    if (term[0] === '1' && term[1] === "") {
      Product.find({ "quantity": 0, "inventoryExcept": false })
        .sort({ "updatedAt": -1 })
        .skip(req.body.skip)
        .exec((err, productInfos) => {
          if (err) return res.status(400).json({ success: false, err });
          return res.status(200).json({ success: true, productInfos})
      });
    }

    // 재고관리 대상 상품중에서 품절된 상품의 상품명 검색
    if (term[0] === '1' && term[1] !== "") {
      Product.find({ "quantity":0, "inventoryExcept": false, "title":{ '$regex':term[1], $options: 'i' }})
        .sort({ "updatedAt": -1 })
        .skip(req.body.skip)
        .exec((err, productInfos) => {
          if (err) return res.status(400).json({ success: false, err });
          return res.status(200).json({ success: true, productInfos})
      });
    }

    // 재고관리 대상이 아닌 모든상품 검색
    if (term[0] === '2' && term[1] === "") {
      Product.find({ "inventoryExcept": true }) 
        .sort({ "updatedAt": -1 })
        .skip(req.body.skip)
        .exec((err, productInfos) => {
          if (err) return res.status(400).json({ success: false, err });
          return res.status(200).json({ success: true, productInfos})
      });
    }

    // 재고관리 대상이 아닌 상품의 상품명 검색
    if (term[0] === '2' && term[1] !== "") {
      Product.find({ "inventoryExcept": true, "title":{ '$regex':term[1], $options: 'i' }})
        .sort({ "updatedAt": -1 })
        .skip(req.body.skip)
        .exec((err, productInfos) => {
          if (err) return res.status(400).json({ success: false, err });
          return res.status(200).json({ success: true, productInfos})
      });
    }
  } catch (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: err.message });
  }
});

// 상품재고 수정
router.post('/inventory/update', async (req, res) => {
  try {
    // 상품 재고수량 수정
    if (req.body.type === 'quantity') {
      // 재고관리 대상 상품인지 확인
      const productInfo = await Product.findOne({ _id: req.body._id });
      if (productInfo.inventoryExcept) return res.status(200).json({ success: false });

      await Product.findOneAndUpdate({ _id: req.body._id }, { quantity: parseInt(req.body.quantity)});
      return res.status(200).send({ success: true });
    }
    // 상품 구매한도 수량 수정
    if (req.body.type === 'maxQuantity') {
      // 재고관리 대상 상품인지 확인
      const productInfo = await Product.findOne({ _id: req.body._id });
      if (productInfo.inventoryExcept) return res.status(200).json({ success: false });
      
      await Product.findOneAndUpdate({ _id: req.body._id }, { maxQuantity: parseInt(req.body.maxQuantity)});
      return res.status(200).send({ success: true });
    }
    // 재고관리 대상외 상품
    if (req.body.type === 'except') {
      await Product.findOneAndUpdate({ _id: req.body._id }, { inventoryExcept: true, quantity: 0, maxQuantity: 0});
      return res.status(200).send({ success: true });
    }
    // 재고관리 대상외 상품에서 대상상품으로 변경시 상품재고수량 및 최대구매량을 9999에서 10으로 수정
    if (req.body.type === 'include') {
      await Product.findOneAndUpdate({ _id: req.body._id }, { inventoryExcept: false, quantity: 10, maxQuantity: 10});
      return res.status(200).send({ success: true });
    }
  } catch (err) {
      console.log("err: ", err);
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