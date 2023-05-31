const { Schema, model } = require('mongoose');

const SaleSchema = new Schema(
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
  // 최소금액(할인형태: 2 인경우)
  minAmount: {
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
  // 유효기간 시작
  validFrom: {
    type: String,
  },
  // 유효기간 종료
  validTo: {
    type: String,
  },
  // 상품 아이디
  productId: {
    type: String
  },
  // 일본어 메일 Comment
  jpMailComment: {
    type: String
  },
  // 중국어 메일 Comment
  cnMailComment: {
    type: String
  },
  // 영어 메일 Comment
  enMailComment: {
    type: String
  },
  // 메일전송 유무
  sendMail: {
    type: Boolean,
    default: false
  },
  // 세일대상 제외 유무
  except: {
    type: Boolean,
    default: false
  }
}, { timestamps: true })

const Sale = model('Sale', SaleSchema);
module.exports = { Sale };