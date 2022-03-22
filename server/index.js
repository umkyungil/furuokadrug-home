const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const config = require("./config/key");
const mongoose = require("mongoose");
const connect = mongoose.connect(config.mongoURI,
  { useNewUrlParser: true, useUnifiedTopology: true, })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// CORS 설정
const cors = require('cors')
app.use(cors({ origin: true, credentials: true }));

// 아래 주소로 오면 해당 라우터로 가라는 지정
app.use('/api/users', require('./routes/users'));
app.use('/api/product', require('./routes/product'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/csv', require('./routes/csv'));
app.use('/api/sendmail', require('./routes/sendmail'));
app.use('/api/payment', require('./routes/payment'));
app.use('/api/order', require('./routes/order'));
app.use('/uploads', express.static('uploads'));

if (process.env.NODE_ENV === "production") {
  // 모든 자바스크립트와 css 파일 같은 static한 파일들은 이 폴더에서 처리한다고 지정
  app.use(express.static("client/build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
  });
}

const port = process.env.PORT || 5000

app.listen(port, () => {
  console.log(`Server Listening on ${port}`)
});