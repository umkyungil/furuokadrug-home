const { Schema, model } = require('mongoose');

const CounterSchema = new Schema(
{
  name: {
    type: String
  },
  seq: {
    type: Number,
    default: 0
  }
}, { timestamps: true })

const Counter = model('Counter', CounterSchema);
module.exports = { Counter };