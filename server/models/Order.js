const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    type: {
        type: String,
        trim: true,
    },
	userId: {
		type:String,
        trim: true,
	},
    name: {
        type: String,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    tel: {
        type: String,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
    },
    address: {
		type: String,
        trim: true,
	},
    sod: {
        type: String,
        trim: true,
    },
    uniqueField: {
        type: String,
        trim: true,
    },
    amount: {
        type: String,
        trim: true,
    },
    confirm: {
        type: String,
        trim: true,
    },
}, { timestamps: true })

orderSchema.index({
    name: 'text',
    lastName: 'text',
    email: 'text'
}, {
    weights: {
        name: 5,
        lastName: 1,
        uniqueField: 1
    }
})

const Order = mongoose.model('Order', orderSchema);
module.exports = { Order }