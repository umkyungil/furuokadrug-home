const { Schema, model } = require('mongoose');

const TmpOrderSchema = new Schema(
{
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
    receiver: {
        type: String,
        trim: true,
    },
    receiverTel: {
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
    }
}, { timestamps: true })

TmpOrderSchema.index({
    deliveryStatus: 'text',
    sod: 'text',
    staffName: 'text'
}, {
    weights: {
        deliveryStatus: 5,
        sod: 1,
        staffName: 1
    }
})

const TmpOrder = model('TmpOrder', TmpOrderSchema);
module.exports = { TmpOrder };