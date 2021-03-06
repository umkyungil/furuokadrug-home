const mongoose = require('mongoose');

const MailSchema = mongoose.Schema({
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

MailSchema.index({
  to: 'text',
	from: 'text'
}, {
  weights: {
    to: 5,
    from: 1
  }
})

const Mail = mongoose.model('Mail', MailSchema);
module.exports = { Mail }