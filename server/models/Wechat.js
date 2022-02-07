const mongoose = require('mongoose');

const WechatSchema = mongoose.Schema({
	// 決済番号
	pid: {
		type:String,
		maxlength:9
	},
	// 処理結果 1＝処理成功 2＝処理失敗
	rst: {
		type:String,
		maxlength:1
	},
	// 管理番号
	ap: {
		type:String,
		maxlength: 7
	},
	// 決済システムが発行したエラーコード（成功時：ER000000000）
	ec: {
		type:String,
		maxlength:11
	},
	// 決済時にsodで指定した値(店舗オーダー番号)
	sod: {
		type:String,
		maxlength:50
	},
	// 決済時に指定した決済金額の合計
	ta: {
		type:String,
		maxlength:9
	},
	// 処理時に指定したジョブコード
	job: {
		type:String,
		maxlength:12
	},
	// 処理時に指定したジョブコード
	bank_type : {
		type:String,
		maxlength:16
	},
	// 商品1に対し決済システムが発行した決済側オーダー番号
	pod1: {
		type:String,
		maxlength:9
	},
	// QRCode内容
	qrcode: {
		type:String,
		maxlength:100
	},
	// 任意の追加フィールド
	uniqueField: {
		type:String,
		maxlength:50
	}
})

WechatSchema.index({
  uniqueField: 'text',
	rst: 'text'
}, {
  weights: {
    uniqueField: 5,
    rst: 1
  }
})

const Wechat = mongoose.model('Wechat', WechatSchema);
module.exports = { Wechat }