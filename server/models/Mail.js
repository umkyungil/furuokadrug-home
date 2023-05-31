const { Schema, model } = require('mongoose');

const MailSchema = new Schema(
{
	// 메일종류(메일발송 페이지)
	type: {
		type:String
	},
	// 제목
	subject: {
		type:String
	},
	// 메일전송자(userId)
	to: {
		type:String
	},
	// 메일수진자(userId)
	from: {
		type:String
	},
	// 메일내용
	message: {
		type:String,
	},
	
}, { timestamps: true })

const Mail = model('Mail', MailSchema);
module.exports = { Mail };