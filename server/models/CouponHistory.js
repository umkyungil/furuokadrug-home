const { Schema, model } = require('mongoose');

const CouponHistorySchema = new Schema(
{
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

const CouponHistory = model('CouponHistory', CouponHistorySchema);
module.exports = { CouponHistory };