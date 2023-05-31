const { Schema, model } = require('mongoose');

const CouponSchema = new Schema(
{
  code: {
    type: String
  },
  // 할인형태
  // 0: Gross Percentage(총 금액의 몇 퍼센트 할인)
  // 1: Granting points(포인트 부여)
  // 2: Discount amount(할인 금액)
  type: {
    type: String
  },
  // 할인금액
  amount: {
    type: String
  },
  // 상품 카테고리
  // 0: 전 상품
  // 1: Cosmetic
  // 2: Drug
  // 3: Food/Supplement
  // 4: Home appliances
  // 5: Goods
  // 6: Etc
  item: {
    type: Number,
    default: 0
  },
  // 사용가능 유무(0:사용불가능, 1:사용가능)
  active: {
    type: String
  },
  validFrom: {
    type: Date,
  },
  validTo: {
    type: Date,
  },
  // 사용횟수
  // "": 무제한
  count: {
    type: String
  },
  // 0: 쿠폰코드 입력하면 세일은 사용못함
  // 1: 쿠폰코드와 세일 중복으로 사용가능
  // 2: 세일만 사용가능
  useWithSale: {
    type: Number,
    default: 0
  },
  // 사용자 아이디
  userId: {
    type: String
  },
  // 상품 아이디
  productId: {
    type: String
  },
  sendMail: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

const Coupon = model('Coupon', CouponSchema);
module.exports = { Coupon };