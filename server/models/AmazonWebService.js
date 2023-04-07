const { Schema, model } = require('mongoose');

const AmazonWebServiceSchema = new Schema(
{
  type: {
    type: String,
    required: true
  },
  access: {
    type: String,
    required: true
  },
  secret: {
    type: String,
    required: true
  },
  region: {
    type:String,
    required: true
  }
}, { timestamps: true })

const AmazonWebService = model('AmazonWebService', AmazonWebServiceSchema);
module.exports = { AmazonWebService }