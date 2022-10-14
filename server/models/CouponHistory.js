const mongoose = require('mongoose');

const couponHistorySchema = mongoose.Schema({
  code: {
    type: String
  },
  type: {
    type: String
  },
  amount: {
    type: String
  },
  item: {
    type: Number
  },
  active: {
    type: String
  },
  validFrom: {
    type: Date
  },
  validTo: {
    type: Date
  },
  count: {
    type: String,
  },
  useWithSale: {
    type: Number
  },
  userId: {
    type: String
  },
  productId: {
    type: String
  },
  sendMail: {
    type: Boolean
  },
  // 쿠폰을 사용한 사용자ID
  couponUserId: {
    type: String
  }
}, { timestamps: true })

couponHistorySchema.index({
  targetUserId: 'text',
  code: 'text'
}, {
  weights: {
    targetUserId: 5,
    code: 1
  }
})

const CouponHistory = mongoose.model('CouponHistory', couponHistorySchema);
module.exports = { CouponHistory }