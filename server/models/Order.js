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
    staffName: {
        type: String,
        trim: true,
    },
    paymentStatus: {
        type: String,
        trim: true,
    },    
    deliveryStatus: {
        type: String,
        trim: true,
    },
}, { timestamps: true })

orderSchema.index({
    name: 'text',
    email: 'text',
    staffName: 'text'
}, {
    weights: {
        name: 5,
        email: 1,
        staffName: 1
    }
})

const Order = mongoose.model('Order', orderSchema);
module.exports = { Order }