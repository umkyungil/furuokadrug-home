const { Schema, model } = require('mongoose');

const ImagesSchema = new Schema(
{
  image: {
    type: String,
    required: true
  },
  // 0:logo, 1:Banner, 2:pharmaceuticals 3:cosmetics, 4:daily necessaries, 5:Food, 
  type: {
    type: Number,
    required: true
  },
  // 0: 비노출, 1: 노출
  visible: {
    type:Number,
    required: true
  },
  // 0: JP, 1: CP, 2: EN
  language: {
    type:Number,
    required: true
  },
  // 카테고리 이미지인 경우 설명
  description: {
    type:String
  }
}, { timestamps: true })

const Images = model('Images', ImagesSchema);
module.exports = { Images }