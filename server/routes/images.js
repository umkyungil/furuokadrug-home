const express = require('express');
const router = express.Router();
const { Images } = require('../models/Images');
const multer = require('multer');
const multerS3 = require('multer-s3')
const AWS = require('aws-sdk');
const { S3_CONFIG } = require("../config/aws");
const { BUCKET_NAME } = require('../config/const');

//=================================
//             Images
//=================================

// AWS S3 접속 Key
const s3 = new AWS.S3({
  accessKeyId: S3_CONFIG.access,
  secretAccessKey: S3_CONFIG.secret,
  region: S3_CONFIG.region
});
// AWS 이미지 등록
const s3upload = multer({
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
// AWS 이미지 삭제
const s3delete = (params) => {
  s3.deleteObject(params, (err, data) => {
    if (err) {
      console.log('aws file delete error');
      console.log(err, err.stack);
      return false;
    } else {
      console.log('aws video delete success' + data);
      return true
    }
  })
}
// 파일 업로드에서 AWS 이미지 등록하기
router.post('/image', (req, res) => {
  const uploadSingle = s3upload.single("file");
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

// 이미지 수정
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
    // AWS S3 이미지 삭제
    let words = req.body.image.split('/');
    let fileName = words[words.length-1]
    const params = {
      Bucket: BUCKET_NAME,
      Key: fileName
    }        
    s3delete(params);

    // DataBase 삭제
    await Images.findOneAndDelete({_id: req.body.id});
    return res.json({success: true});
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

module.exports = router;