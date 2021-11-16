const mongoose = require('mongoose');

const customerSchema = mongoose.Schema({
	smaregiId: {
		type:String,
		maxlength:50
	},
	name: {
		type:String,
		maxlength:50
	},
	lastname: {
		type:String,
		maxlength: 50
	},
	tel: {
		type:String,
		maxlength:20
	},
	email: {
		type:String,
		trim:true
		//unique: 1 
	},    
	address: {
		type: String,
		minglength: 100
	},
	salesman : {
		type:String,
		maxlength:50
	},
	point : {
		type:Number,
		default: 0 
	}
})

const Customer = mongoose.model('Customer', customerSchema);
module.exports = { Customer }