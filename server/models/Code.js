const { Schema, model } = require('mongoose');
const CodeSchema = new Schema(
{
    // 코드설명
    name: {
        type: String,
        trim: true,
        required: true
    },
    code: {
        type: String,
        trim: true,
        required: true
    },    
    value1: {
        type: String,
        trim: true,
        required: true
    },
    value2: {
        type: String,
        trim: true,
        default: ""       
    },
    value3: {
        type: String,
        trim: true,
        default: ""
    },
    value4: {
        type: String,
        trim: true,
        default: ""
    },
    value5: {
        type: String,
        trim: true,
        default: ""
    },
    value6: {
        type: String,
        trim: true,
        default: ""
    },
    value7: {
        type: String,
        trim: true,
        default: ""
    }
}, { timestamps: true })

CodeSchema.index({code: 1});
const Code = model('Code', CodeSchema);
module.exports = { Code };