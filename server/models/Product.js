const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = mongoose.Schema({
    writer: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    title: {
      type: String,
      mongoose: 50
    },
    chineseTitle: {
      type: String,
      mongoose: 50
    },
    englishTitle: {
      type: String,
      mongoose: 50
    },
    description: {
      type: String,
    },
    chineseDescription: {
      type: String,
    },
    englishDescription: {
      type: String,
    },
    usage: {
      type: String,
    },
    chineseUsage: {
      type: String,
    },
    englishUsage: {
      type: String,
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
    pickUp: {
        type: Boolean,
        default: false
    },
    featured : {
        type: Boolean,
        default: false
    },
    onAir: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

// 어떠한 것을 더 강조하며 검색기능을 실행할지 더 자세하게 설정 하는 부분
productSchema.index({
  title: 'text',
  description: 'text'
}, {
  weights: {
    title: 5,
    description: 1
  }
})

const Product = mongoose.model('Product', productSchema);

module.exports = { Product }