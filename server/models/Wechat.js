const { Schema, model } = require('mongoose');

const WechatSchema = new Schema(
{
	// 決済番号
	pid: {
		type:String,
		maxLength:9
	},
	// 処理結果 1＝処理成功 2＝処理失敗
	rst: {
		type:String,
		maxLength:1
	},
	// 管理番号
	ap: {
		type:String,
		maxLength: 8
	},
	// 決済システムが発行したエラーコード（成功時：ER000000000）
	ec: {
		type:String,
		maxLength:11
	},
	// 決済時にsodで指定した値(店舗オーダー番号)
	sod: {
		type:String,
		maxLength:50
	},
	// 決済時に指定した決済金額の合計
	ta: {
		type:String,
		maxLength:9
	},
	// 処理時に指定したジョブコード
	job: {
		type:String,
		maxLength:12
	},
	// 処理時に指定したジョブコード
	bank_type : {
		type:String,
		maxLength:16
	},
	// 商品1に対し決済システムが発行した決済側オーダー番号
	pod1: {
		type:String,
		maxLength:9
	},
	// QRCode内容
	qrcode: {
		type:String,
		maxLength:100
	},
	// 任意の追加フィールド
	uniqueField: {
		type:String,
		maxLength:50
	}
}, { timestamps: true })

const Wechat = model('Wechat', WechatSchema);
module.exports = { Wechat };