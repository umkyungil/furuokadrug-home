const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const moment = require("moment");

const userSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        maxlength: 50
    },
    lastName: {
        type: String,
        trim: true,
        maxlength: 50
    },
    email: {
        type: String,
        trim: true,
        unique: 1 // 이메일 중복을 허용 안한다 
    },
    tel: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        minglength: 5
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
    role : {
        type: Number,
        default: 0 
    },
    cart: {
        type: Array,
        default: []
    },
    history: {
        type: Array,
        default: []
    },
    image: String,
    token : {
        type: String,
    },
    tokenExp :{
        type: Number
    },
    lastLogin :{
        type: String,
    }
})

userSchema.pre('save', function( next ) {
    var user = this;    
    if(user.isModified('password')){    
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err);
    
            bcrypt.hash(user.password, salt, function(err, hash){
                if(err) return next(err);
                user.password = hash 
                next()
            })
        })
    } else {
        next()
    }
});

// 암호 비교
userSchema.methods.comparePassword = function(plainPassword,cb){
    // plan password를 암호화 해서 비교한다, 기존 DB의 암호를 복화화 할수 없다
    bcrypt.compare(plainPassword, this.password, function(err, isMatch){
        if (err) return cb(err);
        cb(null, isMatch);
    })
}

// jsonwebtoken을 이용해서 token생성
userSchema.methods.generateToken = function(cb) {
    var user = this;
    var token =  jwt.sign(user._id.toHexString(),'secret')
    var oneHour = moment().add(1, 'hour').valueOf();

    user.tokenExp = oneHour;
    user.token = token;
    user.save(function (err, user){
        if(err) return cb(err);
        cb(null, user);
    })
}

userSchema.statics.findByToken = function (token, cb) {
    var user = this;
    // 토큰을 decode 한다
    jwt.verify(token,'secret', function(err, decode){
        // 유저 아이드를 이용해서 유저를 찾은 다음에
        // 클라이언트에서 가져온 token과 DB에서 보관된 토큰이 일치하는지 확인
        user.findOne({"_id":decode, "token":token}, function(err, user){
            if(err) return cb(err);
            cb(null, user);
        })
    })
}

const User = mongoose.model('User', userSchema);

module.exports = { User }