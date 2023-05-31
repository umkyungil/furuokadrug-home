const { User } = require('../models/User');

// 인증처리를 한다 
let auth = (req, res, next) => {
  // 클라이언트 쿠키에서 토큰을 가져온다
  // index.js에 import한 cookie-parser가 해더의 쿠키를 분석한 후에 req.cookies에 분석된 것을 넣어주기 때문에 쿠키값을 가져올수 있다
  let token = req.cookies.w_auth;

  // 토큰을 복호화 한 후 유저를 찾는다
  // 유저 모델에서 메소드를 만들어서 처리한다
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    // 유저가 있으면 인증 Okay, 없으면 No
    if (!user) return res.json({ isAuth: false, error: true });
    // req에 token과 user정보를 넣으면 next한 곳에서 사용할수 있다
    req.token = token;
    req.user = user;
    // 호출한 곳으로 처리를 돌려준다다
    next();
  });
};

module.exports = { auth };