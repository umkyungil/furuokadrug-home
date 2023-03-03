const { Schema, model } = require('mongoose');

const AlipaySchema = new Schema(
{
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
		maxlength: 8
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
	// 商品1に対し決済システムが発行した決済側オーダー番号
	pod1: {
		type:String,
		maxlength:9
	},
	// 任意の追加フィールド
	// 任意の値（本ドキュメントに定めのないフィールド名のみ有効）
	uniqueField: {
		type:String,
		maxlength:50
	}
}, { timestamps: true })

AlipaySchema.index({
  uniqueField: 'text',
	rst: 'text'
}, {
  weights: {
    uniqueField: 5,
    rst: 1
  }
})

const Alipay = model('Alipay', AlipaySchema);
module.exports = { Alipay };