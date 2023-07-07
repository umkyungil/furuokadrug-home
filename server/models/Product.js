const { Schema, model } = require('mongoose');

const ProductSchema = new Schema(
{
  writer: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: true
  },
  chineseTitle: {
    type: String,
    required: true
  },
  englishTitle: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  chineseDescription: {
    type: String,
    required: true
  },
  englishDescription: {
    type: String,
    required: true
  },
  usage: {
    type: String,
    default: ""
  },
  chineseUsage: {
    type: String,
    default: ""
  },
  englishUsage: {
    type: String,
    default: ""
  },
  price: {
    type: Number,
    default: 0
  },
  images: {
    type: Array,
    default: []
  },
  contents: {
    type: String,
    required: true
  },
  sold: {
    type: Number,
    default: 0
  },
  continents: {
    type: Number,
    default: 0
  },
  point: {
    type: Number,
    default: 0
  },
  // 회원 : true, 회원, 비회원 모두: false
  member: {
    type: Boolean,
    default: false
  },
  // 노출상품 구분: 일반상품: 0, 방송상품: 1, 동영상 존재 상품: 2, 추천상품: 3, 세일상품: 4
  exposureType: { 
    type: Array, 
    default: [] 
  },
  japaneseUrl: {
    type: String,
    default: ""
  },
  englishUrl: {
    type: String,
    default: ""
  },
  chineseUrl: {
    type: String,
    default: ""
  }
}, { timestamps: true })

const Product = model('Product', ProductSchema);
module.exports = { Product };