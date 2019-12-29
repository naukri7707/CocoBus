// !! NOT USING
// import
const express = require('express');
const router = express.Router();
const session = require('express-session');
const bodyParser = require('body-parser');

// const
const SECRET_KEY = "secret"
const EXPIRES = 14 * 24 * 60 * 60 * 1000

// variables
var uid = -1;

// initial
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(session({
    secret: SECRET_KEY,
    cookie: { maxAge: EXPIRES }
}))

//系統管理員登入 
app.post('/login', (req, res) => {
    dbUser.findOne({ 'username': req.body.username }, (err, doc) => {
        if (err) {
            req.send("奇怪的錯誤");
        } else if (doc) {
            if (doc.password === req.body.password) {
                if (doc.level == 100) {
                    req.session.regenerate(function (err) {
                        if (err) {
                            res.send("奇怪的錯誤");
                        } else {
                            req.session.loginUser = doc._id;
                            res.redirect("/sysop");
                        }
                    });
                } else {
                    res.send("此帳號權限不足");
                }
            } else {
                res.send("密碼錯誤")
            }
        } else {
            res.send("無此帳號")
        }
    });
});

// 攔截所有 sysop 下除了登入以外所有的網頁檢查權限
app.get('/*', (req, res, next) => {
    dbUser.findOne({ '_id': req.session.loginUser }, (err, doc) => {
        if (err) {
            req.send("奇怪的錯誤");
        } else if (doc) {
            if (doc.level == 100) {
                next();
            } else {
                res.redirect("/sysop/login.html");
            }
        } else {
            res.redirect("/sysop/login.html");
        }
    });
});

module.exports = router;
