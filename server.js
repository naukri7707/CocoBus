const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const server = express();


server.use(express.static(path.join(__dirname, 'public')));
server.use(bodyParser.urlencoded({ extended: false }))
server.use(bodyParser.json());
server.use(cookieParser('745981362'));
server.listen(9000); //port no is 80 usually

var DataBase = require('nedb');
var dbUser = new DataBase({ filename: __dirname + '/users.db', autoload: true });

// insert width uid (auto increment)
DataBase.prototype.insertWithUid = function (value, func) {
  const db = Object(this);
  db.findOne({ _id: '__autoid__' }, (err, doc) => {
    if (err) {
      console.log("error while find autoid");
    } else {
      // 檢查是否有 autoid
      if (doc) {
        // 如果有就新增資料並將 autoid+1
        value._id = doc.uid
        db.insert(value, (err, ret) => {
          if (!err) {
            db.update({ _id: '__autoid__' }, { $set: { uid: ++doc.uid } }, {});
          }
          func(err, ret)
        });
      } else {
        // 如果沒有則先新增 autoid 再新增資料
        db.insert({ '_id': '__autoid__', 'uid': 0 }, function (err, ret) {
          if (!err) {
            value._id = 0
            db.insert(value, (err, ret) => {
              if (!err) {
                db.update({ _id: '__autoid__' }, { $set: { uid: 1 } }, {});
              }
              func(err, ret)
            });
          }
        });
      }
    }
  });
}

server.post('/user/login', (req, res) => {
  dbUser.find({ 'account': body.account }, function (err, users) {
    if (!err) {
      users.sort(function (a, b) { return Math.random() - 0.5; });
      res.send(users);
    }
  });
});

// extension functions for express
server.use(function (req, res, next) {

  res.jsonFail = function (users) {
    return res.json({
      success: false,
      payload: users
    })
  };

  res.jsonSuccess = function (users) {
    return res.json({
      success: true,
      payload: users
    });
  };
  next();
});

server.post('/user/log-in', (req, res) => {
  const body = req.body;
  dbUser.findOne({ 'account': body.account }, (err, doc) => {
    if (err) {
      res.send("奇怪的錯誤");
    } else if (doc) {
      if (body.password === doc.password) {
        res.send("登入成功！\n\n歡迎回來, " + doc.nickname);
      } else {
        res.send("密碼錯誤");
      }
    } else {
      res.send("無此帳號");
    }
  });
});

server.post('/user/sign-up', (req, res) => {
  const body = req.body;
  const reg = /^[a-zA-Z0-9~!@#$%^&*()_+`\-={}\[\]:\";\'<>?,.\/]+$/;
  const pwdreg = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*\W)/;
  // throw error
  if (body.account.length < 8 || body.account.length > 32) {
    res.send("帳號長度需介於8至32之間");
  } else if (!reg.test(body.account)) {
    res.send("帳號含有非法字元");
  } else if (body.password.length < 8 || body.password.length > 32) {
    res.send("密碼長度需介於8至32之間");
  } else if (!reg.test(body.password)) {
    res.send("密碼含有非法字元");
  } else if (!pwdreg.test(body.password)) {
    res.send("密碼需包含英文、數字及特殊符號");
  } else {
    dbUser.findOne({ 'account': body.account }, (err, doc) => {
      if (err) {
        res.send("奇怪的錯誤");
      } else if (doc) {
        res.send("該帳號已被註冊");
      } else {
        dbUser.insertWithUid(body, (err, ret) => {
          if (err) {
            res.send("奇怪的錯誤");
          } else {
            res.send("註冊成功！\n\n歡迎加入顆顆客運");
            res.cookie("user", { account: account }, { maxAge: 600000, httpOnly: false });
          }
        });
      }
    });
  }
});

server.post('/cookie/log-in', (req, res) => {
  const body = req.body;
  res.cookie('name', 'tobi', { signed: true });
  res.cookie("user", { account: body.account, password: body.password }, { maxAge: 600000, httpOnly: false });
  console.log(res.cookie)
});

server.get('/get-cookie', function (req, res) {
  // Cookies that have not been signed
  console.log('Cookies: ', req.cookies)

  // Cookies that have been signed
  console.log('Signed Cookies: ', req.signedCookies)
})