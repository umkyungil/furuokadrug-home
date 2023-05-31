const { Schema, model } = require('mongoose');

const SaleHistorySchema = new Schema(
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
    type: String
  },
  validTo: {
    type: String
  },
  sendMail: {
    type: Boolean
  },
  // 세일을 사용한 사용자ID
  saleUserId: {
    type: String
  }
}, { timestamps: true })

const SaleHistory = model('SaleHistory', SaleHistorySchema);
module.exports = { SaleHistory };