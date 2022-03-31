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
	lastName: {
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
	address1: {
		type: String,
		minglength: 100
	},
	address2: {
		type: String,
		minglength: 100
	},
	address3: {
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

customerSchema.index({
  name: 'text',
  lastName: 'text',
	salesman: 'text'
}, {
  weights: {
    name: 5,
    lastName: 1,
		salesman: 1
  }
})

const Customer = mongoose.model('Customer', customerSchema);
module.exports = { Customer }