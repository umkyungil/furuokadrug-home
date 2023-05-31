const { Schema, model } = require('mongoose');

const CustomerSchema = new Schema(
{
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

const Customer = model('Customer', CustomerSchema);
module.exports = { Customer };