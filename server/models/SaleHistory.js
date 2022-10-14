const mongoose = require('mongoose');

const saleHistorySchema = mongoose.Schema({
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

saleHistorySchema.index({
  validFrom: 'text',
  code: 'text'
}, {
  weights: {
    validFrom: 5,
    code: 1
  }
})

const SaleHistory = mongoose.model('SaleHistory', saleHistorySchema);
module.exports = { SaleHistory }