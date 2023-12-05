const express = require('express');
const router = express.Router();
const { Code } = require('../models/Code');

//=================================
//             Code
//=================================

// 코드등록
router.post('/register', async (req, res) => {
  try {
    const codeInfo = new Code(req.body)
    await codeInfo.save();
    return res.status(200).json({success: true});
  } catch (err) {
    console.log("Code register err: ", err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

// 코드가져오기
router.get("/list", async (req, res) => {
  try {
    const codeInfos = await Code.find();
    return res.status(200).json({ success: true, codeInfos });
  } catch (err) {
    console.log("Code list err: ", err);
    return res.status(500).json({ success: false, message: err.message });
  }   
});

// 코드ID로 가져오기
router.get('/code_by_id', async (req, res) => {
  try {
    const codeInfo = await Code.findOne({ _id: req.query.id });
    return res.status(200).json({ success: true, codeInfo });
  } catch (err) {
    console.log("Code code_by_id err: ", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 코드이름으로 가져오기(findOne은 검색한 결과의 첫번째 데이타만 가져온다 즉 데이타는 하나만 존재하기 때문에 가능하다)
router.get('/code_by_code', async (req, res) => {
  try {
    const codeInfo = await Code.findOne({ code: req.query.code });
    return res.status(200).json({ success: true, codeInfo });
  } catch (err) {
    console.log("Code code_by_code err: ", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// 코드수정
router.post("/update", async (req, res) => {
  try {
      let code = await Code.findById(req.body.id);
      code.name = req.body.name;
      code.code = req.body.code;
      code.value1 = req.body.value1;
      code.value2 = req.body.value2;
      code.value3 = req.body.value3;

      await code.save();
      return res.status(200).send({ success: true });
  } catch (err) {
      console.log("Code update err: ", err);
      return res.status(500).json({ success: false, message: err.message });
  }
});

// 코드삭제
router.post('/delete', async (req, res) => {
  try {
    // DataBase 삭제
    await Code.findOneAndDelete({_id: req.body.id});
    return res.json({success: true});
  } catch (err) {
    console.log("Code delete err: ", err);
    return res.status(500).json({ success: false, message: err.message });
  }
})

module.exports = router;