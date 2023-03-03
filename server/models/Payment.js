const { Schema, model } = require('mongoose');

const PaymentSchema = new Schema(
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
}, { timestamps: true })

const Payment = model('Payment', PaymentSchema);
module.exports = { Payment };