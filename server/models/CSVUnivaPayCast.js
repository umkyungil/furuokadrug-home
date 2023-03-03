const { Schema, model } = require('mongoose');

const CSVUnivaPayCastSchema = new Schema(
{
	// 決済番号
	paymentNumber: {
		type:String,
		maxlength:50
	},
	// サービス種別
	serviceType: {
		type:String,
		maxlength:50
	},
	// 決済ジョブ
	settlementJob: {
		type:String,
		maxlength: 50
	},
	// 結果
	result: {
		type:String,
		maxlength:50
	},
	// 店舗オーダー番号
	storeOrderNumber: {
		type:String,
		maxlength:50
		//unique: 1 
	},
	// カードブランド
	cardBrand: {
		type:String,
		maxlength:50
	},
	// 名前
	name: {
		type:String,
		maxlength:50
	},
	// 電話番号
	telephoneNumber: {
		type:String,
		maxlength:50
	},
	// メールアドレス
	email: {
		type:String,
		maxlength:50
	},
	// 合計金額
	totalAmount: {
		type:String,
		maxlength:50,
	},
	// 決済日
	settlementDate: {
		type:String,
		maxlength:50
	},
	// 実売日
	actualSaleDate: {
		type:String,
		maxlength:50
	},
	// 取消日
	cancellationDate: {
		type:String,
		maxlength:50
	},
	// 発行ID
	IssueId: {
		type:String,
		maxlength:50
	},
	// 発行パスワード
	issuePassword: {
		type:String,
		maxlength:50
	},
	// カード有効期限
	cardExpirationDate: {
		type:String,
		maxlength:50
	},
	// 名前(日本語)
	nameJapanese: {
		type:String,
		maxlength:50
	},
	// 名前(フリガナ)
	nameFurigana: {
		type:String,
		maxlength:50
	},
	// 住所 1
	address: {
		type:String,
		maxlength:50
	},
	// 住所(フリガナ)
	addressFurigana: {
		type:String,
		maxlength:50
	},
	// 携帯電話番号
	mobileNumber: {
		type:String,
		maxlength:50
	},
	// ＦＡＸ番号
	faxNumber: {
		type:String,
		maxlength:50
	},
	// 生年月日
	birthday: {
		type:String,
		maxlength:50
	},
	// 質問
	question: {
		type:String,
		maxlength:50
	},
	// 郵送先名前
	mailingName: {
		type:String,
		maxlength:50
	},
	// 郵送先名前(フリガナ)
	mailingNameFurigana: {
		type:String,
		maxlength:50
	},
	// 郵送先住所
	mailingAddress: {
		type:String,
		maxlength:50
	},
	// 郵送先住所(フリガナ)
	mailingFurigana: {
		type:String,
		maxlength:50
	},
	// 郵送電話番号
	mailingPhoneNumber: {
		type:String,
		maxlength:50
	},
	// 郵送先携帯電話番号
	mailingMobileNumber: {
		type:String,
		maxlength:50
	},
	// 郵送先ＦＡＸ番号
	mailingFaxNumber: {
		type:String,
		maxlength:50
	},
	// 郵送先メールアドレス
	mailingEmail: {
		type:String,
		maxlength:50
	},
	// 商品コード
	productCode: {
		type:String,
		maxlength:50
	},
	// 商品名
	productName: {
		type:String,
		maxlength:50
	},
	// 支払方法
	paymentMethod: {
		type:String,
		maxlength:50
	},
	// 支払回数
	numberOfPayments: {
		type:String,
		maxlength:50
	},
	// その他パラメータ
	otherParameters: {
		type:String,
		maxlength:50
	}
})

CSVUnivaPayCastSchema.index({
  nameJapanese: 'text',
	email: 'text'
}, {
  weights: {
    nameJapanese: 5,
    email: 1
  }
})

const CSVUnivaPayCast = model('CSVUnivaPayCast', CSVUnivaPayCastSchema);
module.exports = { CSVUnivaPayCast };