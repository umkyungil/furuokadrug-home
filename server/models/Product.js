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
    required: true
  },
  chineseUsage: {
    type: String,
    required: true
  },
  englishUsage: {
    type: String,
    required: true
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
  // 일반상품: 0, 방송상품: 1, 동영상 존재 상품: 2, 추천상품: 3, 세일상품: 4
  exposureType: {
    type: Array,
    default: []
  }
}, { timestamps: true })

// 어떠한 것을 더 강조하며 검색기능을 실행할지 더 자세하게 설정 하는 부분
ProductSchema.index({
  title: 'text',
  description: 'text'
}, {
  weights: {
    title: 5,
    description: 1
  }
})

const Product = model('Product', ProductSchema);
module.exports = { Product };