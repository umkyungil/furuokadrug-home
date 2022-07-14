const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tmpPaymentSchema = mongoose.Schema({
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

const TmpPayment = mongoose.model('TmpPayment', tmpPaymentSchema);
module.exports = { TmpPayment }