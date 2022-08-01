const mongoose = require('mongoose');
const counterSchema = mongoose.Schema({
  name: {
    type: String
  },
  seq: {
    type: Number,
    default: 0
  }
}, { timestamps: true })

counterSchema.index({
  name: 'text'
}, {
  weights: {
    name: 6
  }
})

const Counter = mongoose.model('Counter', counterSchema);
module.exports = { Counter }