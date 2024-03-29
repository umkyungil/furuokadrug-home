const { Schema, model } = require('mongoose');

const PointSchema = new Schema(
{
  seq: {
    type: Number,
    default: 0
  },
  subSeq: {
    type: Number,
    default: 0
  },
  // 사용자 아이디
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  // 사용자 이름
  userName: {
    type: String,
    trim: true
  },
  // 사용자 성
  userLastName: {
      type: String,
      trim: true
  },
  // 포인트
  point: {
    type: Number
  },
  // 남은 포인트
  remainingPoints: {
    type: Number
  },
  // 사용할 포인트
  usePoint: {
    type: Number
  },
  // 사용할 포인트(화면에 노출)
  dspUsePoint: {
    type: Number
  },
  // 유효기간 From(포인트 획득일)
  validFrom: {
    type: Date
  },
  // 유효기간 To(유효기간)
  validTo: {
    type: Date
  },
  // 사용한 날짜
  dateUsed: {
    type: Date
  }
}, { timestamps: true })

const Point = model('Point', PointSchema);
module.exports = { Point };