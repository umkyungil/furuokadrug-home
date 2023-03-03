const { Schema, model } = require('mongoose');

const TmpPaymentSchema = new Schema(
  {
    user: {
      type: Array,
      default: []
    },
    data: {
      type: Array,
      default: []
    },
    product: {
      type: Array,
      default: []
    }
  }, { timestamps: true }
)

const TmpPayment = model('TmpPayment', TmpPaymentSchema);
module.exports = { TmpPayment };