const express = require('express');
const router = express.Router();
const { Images } = require('../models/Images');
const { AmazonWebService }  = require('../models/AmazonWebService');
const multer = require('multer');
const multerS3 = require('multer-s3')
const AWS_SDK = require('aws-sdk');
const { AWS_S3, AWS_BUCKET_NAME } = require("../config/const");

//=================================
//             Images
//=================================

// 파일 업로드에서 AWS 이미지 등록하기
router.post('/image', async (req, res) => {
  // AWS 정보가져오기(환경변수가 아닌 DB에서 가져오기)
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

// 이미지 등록(이미지 경로포함)
router.post('/register', async (req, res) => {
  try {
    const imageInfo = new Images(req.body)
    await imageInfo.save();
    return res.status(200).json({success: true});
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// 이미지 가져오기
router.get("/list", async (req, res) => {
  try {
    const imageInfos = await Images.find();
    return res.status(200).json({ success: true, imageInfos });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }   
});

// 이미지 가져오기
router.post('/images_by_type', async (req, res) => {
  try {
    // type0: 비노출, type1: 노출
    const imageInfo = await Images.find({ type: req.body.type, visible: req.body.visible, language: req.body.language });
    return res.status(200).json({ success: true, imageInfo });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// 이미지 조회
router.get('/images_by_id', async (req, res) => {
  try {
      const imageInfo = await Images.findOne({ _id: req.query.id });
      return res.status(200).send({success: true, imageInfo});
  } catch (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: err.message });
  }
});

// 이미지 수정(이미지 파일은 수정이 안된다)
router.post("/update", async (req, res) => {
  try {
      let imageInfo = await Images.findById(req.body.id);
      imageInfo.image = req.body.image;
      imageInfo.visible = req.body.visible;
      imageInfo.language = req.body.language;
      imageInfo.description = req.body.description;

      await imageInfo.save();
      return res.status(200).send({ success: true });
  } catch (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: err.message });
  }
});

// 이미지 삭제
router.post('/delete', async (req, res) => {
  try {
    // AWS 정보가져오기(환경변수가 아닌 DB에서 가져오기)
    const s3Infos = await AmazonWebService.findOne({ type: AWS_S3 });
    const s3Object = new AWS_SDK.S3({
      accessKeyId: s3Infos.access,
      secretAccessKey: s3Infos.secret,
      region: s3Infos.region
    });    

    // AWS S3 이미지 삭제
    let words = req.body.image.split('/');
    let fileName = words[words.length-1];
    const params = { Bucket: AWS_BUCKET_NAME, Key: fileName };
    
    s3Object.deleteObject(params, (err, data) => {
      if (err) {
        console.log(err, err.stack);
        return res.json({success: false, err});
      }
    })

    // DataBase 삭제
    await Images.findOneAndDelete({_id: req.body.id});
    return res.json({success: true});
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

module.exports = router;