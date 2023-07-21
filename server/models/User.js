const { Schema, model } = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
const { Code } = require('./Code');
const moment = require("moment");

const UserSchema = new Schema(
{
    name: {
        type: String,
        trim: true
    },
    lastName: {
        type: String,
        trim: true
    },
    birthday: {
        type: String,
        trim: true
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
        trim: true
	},
    zip1: {
		type: String,
        trim: true,
        default: ""
	},
    receiver1: {
		type: String,
        trim: true
	},
    tel1: {
        type: String,
        trim: true
    },    
    address2: {
		type: String,
		trim: true
	},
    zip2: {
		type: String,
        trim: true,
        default: ""
	},
    receiver2: {
		type: String
	},
    tel2: {
        type: String,
        trim: true
    },    
    address3: {
		type: String,
		trim: true
	},
    zip3: {
		type: String,
        trim: true,
        default: ""
	},
    receiver3: {
		type: String
	},
    tel3: {
        type: String,
        trim: true
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
    language: {
		type: String
	},
    token : {
        type: String,
    },
    tokenExp :{
        type: Number
    },
    lastLogin :{
        type: Date,
    },
    deletedAt :{
        type: Date,
    },
    passwordChangedAt :{
        type: Date,
    },
    myPoint: {
        type: Number,
        default: 0
    }
}, { timestamps: true })

// 사용자 정보 등록(save)전의 처리
UserSchema.pre('save', function( next ) {
    // 위의 스키마를 가져온다
    var user = this;
    // 위의 모델안의 비밀번호 필드가 변경할때만 암호화를 한다
    if(user.isModified('password')){    
        bcrypt.genSalt(saltRounds, function(err, salt){
            if(err) return next(err);
    
            // 스키마 User에는 이미 텍스트 비밀번호가 들어가 있다
            bcrypt.hash(user.password, salt, function(err, hash){
                if(err) return next(err);
                // hash를 스키마에 대입한다
                user.password = hash;
                // 원래 save메소드로 넘긴다
                next();
            })
        })
    } else {
        next();
    }
});

// 로그인 할때 암호 비교
UserSchema.methods.comparePassword = function(plainPassword, cb) {
    // 기존 DB의 암호화된 비밀번호는 복화화 할수 없기 때문에 plan password를 암호화 해서 비교한다: compare메소드 
    bcrypt.compare(plainPassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    })
}

// jsonwebtoken을 이용해서 token생성및 lastLogin저장
UserSchema.methods.genTokenAndLastLogin = async function(cb) {
    let user = this;

    // 로그인한 시간을 업데이트
    user.lastLogin = new Date();

    let token =  jwt.sign(user._id.toHexString(),'secret');
    // User스키마의 token필드에 생성된 token을 넣어준다
    user.token = token;

    // 토큰 유효기간 가져오기
    const val = await getTokenExp();
    // 기본 유효기간(DB에서 가져오는데 실패 한 경우)
    let tmpExp = "";
    if (val) {
        tmpExp = parseInt(val);
    } else {
        tmpExp = 0;
    }
    // 서버시간(new Date)으로 로컬시간을 구해서 연장시간을 더해준다
    // 그냥 new Date안하고 moment만 사용해도 로컬 날짜를 구하는데 혹시 몰라서 서버날짜(new Date)를 대입했다.
    let expiration = moment(new Date()).add(tmpExp, 'm').valueOf(); // valueOf(): moment 객체를 숫자(밀리세컨드)로 변환
    
    // User스키마의 tokenExp필드에 생성된 token유효기간을 넣어준다
    user.tokenExp = expiration;
    user.save(function (err, user){
        if(err) return cb(err);
        // save가 정상적으로 종료되면 에러는 null, 그리고 user정보를 넘긴다
        cb(null, user);
    })
}

// UserSchema.methods와는 틀리게 statics을 지정
UserSchema.statics.findByToken = function (token, cb) {
    let user = this;
    // 토큰을 decode 한다
    // 콜백함수는 비동기로 호출되며 에러와 디코딩된 결과(user정보)를 받는다
    jwt.verify(token,'secret', function(err, decode){
        // user id를 이용해서 user를 찾은 다음에
        // 클라이언트에서 가져온 token과 DB에서 보관된 토큰이 일치하는지 확인
        user.findOne({"_id":decode, "token":token}, function(err, user){

            if(err) return cb(err);
            cb(null, user);
        })
    })
}

// 토큰유효시간 가져오기
const getTokenExp = async () => {
    try {
        const codeInfo = await Code.findOne({ code: "TOKEN" });
        if (codeInfo.value1) {
            return codeInfo.value1;
        } else {
            return null;
        }
    } catch (error) {
        console.log("err: ", err);
        return null;
    }
}

const User = model('User', UserSchema);
module.exports = { User };