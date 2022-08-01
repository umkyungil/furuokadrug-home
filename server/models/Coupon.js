const mongoose = require('mongoose');

const couponSchema = mongoose.Schema({
  code: {
    type: String
  },
  type: {
    type: String
  },
  value: {
    type: Number,
    default: 0
  },
  description: {
    type: String
  },
  active: {
    type: String,
  },
  validFrom: {
    type: String,
  },
  validTo: {
    type: String,
  }
}, { timestamps: true })

couponSchema.index({
  active: 'text',
  type: 'text'
}, {
  weights: {
    active: 5,
    type: 1
  }
})

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = { Coupon }