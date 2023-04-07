const express = require('express');
const router = express.Router();
const { AmazonWebService } = require('../models/AmazonWebService');

//=================================
//             AWS
//=================================

// AWS등록
router.post('/register', async (req, res) => {
  try {
    const awsInfos = new AmazonWebService(req.body)
    await awsInfos.save();
    return res.status(200).json({success: true});
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// 전체 서비스 가져오기
router.get("/list", async (req, res) => {
  try {
    const awsInfos = await AmazonWebService.find();
    return res.status(200).json({ success: true, awsInfos });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }   
});

// 서비스 타입으로 가져오기
router.post('/aws_by_type', async (req, res) => {
  try {
    const awsInfo = await AmazonWebService.find({ type: req.body.type });
    return res.status(200).json({ success: true, awsInfo });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// id로 가져오기
router.get('/aws_by_id', async (req, res) => {
  try {
    const awsInfo = await AmazonWebService.findOne({ _id: req.query.id });
    return res.status(200).json({ success: true, awsInfo });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// AWS 삭제
router.post('/delete', async (req, res) => {
  try {
    // DataBase 삭제
    await AmazonWebService.findOneAndDelete({_id: req.body.id});
    return res.json({success: true});
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

module.exports = router;