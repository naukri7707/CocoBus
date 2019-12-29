// import
const express = require('express');
const router = express.Router();
const session = require('express-session');
const bodyParser = require('body-parser');
const DataStore = require('nedb');

// const
const SECRET_KEY = "secret"
const EXPIRES = 14 * 24 * 60 * 60 * 1000
const db = new DataStore({ filename: require.main.path + '\\users.db', autoload: true });

// variables
var uid = -1;

// initial
router.use(bodyParser.urlencoded({ extended: true }))
router.use(bodyParser.json());
router.use(session({
    secret: SECRET_KEY,
    cookie: { maxAge: EXPIRES }
}))

db.find({}).sort({ uid: -1 }).limit(1).exec(function (err, doc) {
    uid = doc[0].uid
});

router.get('/*', (req, res, next) => {
    if (req.session) {
        next();
    } else {
        res.redirect('login');
    }
});

// Get
router.get('/login', function (req, res) {
    res.render('layout', { main: 'user/login', scripts: ['/js/user.js'] });
});

router.get('/sign-up', function (req, res) {
    res.render('layout', { main: 'user/sign-up', scripts: ['/js/user.js'] });
});

router.get('/data', function (req, res) {
    res.render('layout', { main: 'user/data' });
});


router.get('/mileage', function (req, res) {
    res.render('layout', { main: 'user/mileage' });
});


router.get('/common', function (req, res) {
    res.render('layout', { main: 'user/common' });
});

router.get('/setting', function (req, res) {
    res.render('layout', { main: 'user/setting' });
});

// Post
router.post('/login', (req, res) => {
    const body = req.body;
    if (body.username === "") {
        res.json({ code: -1, msg: "帳號為空" });
    } else if (body.password === "") {
        res.json({ code: -1, msg: "密碼為空" });
    } else {
        db.findOne({ 'username': body.username }, (err, doc) => {
            if (err) {
                res.json({ code: 1, msg: "奇怪的錯誤" });
            } else if (doc) {
                if (body.password === doc.password) {
                    // set session
                    req.session.regenerate(function (err) {
                        if (err) {
                            res.json({ code: 2, msg: "Session Error" });
                        } else {
                            req.session.loginUser = doc.username;
                            res.cookie('username', doc.username, EXPIRES);
                            res.json({ code: 0, msg: "登入成功！\n\n歡迎回來, " + doc.nickname });
                        }
                    });
                } else {
                    res.json({ code: -1, msg: "密碼錯誤" });
                }
            } else {
                res.json({ code: -1, msg: "無此帳號" });
            }
        });
    }
});

router.post('/sign-up', (req, res) => {
    const body = req.body;
    const reg = /^[a-zA-Z0-9~!@#$%^&*()_+`\-={}\[\]:\";\'<>?,.\/]+$/;
    const pwdreg = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*\W)/;
    if (body.username === undefined) {
        res.json({ code: -1, msg: "帳號不可為空" });
    } else if (body.username.length < 8 || body.username.length > 32) {
        res.json({ code: -1, msg: "帳號長度需介於8至32之間" });
    } else if (!reg.test(body.username)) {
        res.json({ code: -1, msg: "帳號含有非法字元" });
    } else if (body.password === undefined) {
        res.json({ code: -1, msg: "密碼不可為空" });
    } else if (body.password.length < 8 || body.password.length > 32) {
        res.json({ code: -1, msg: "密碼長度需介於8至32之間" });
    } else if (!reg.test(body.password)) {
        res.json({ code: -1, msg: "密碼含有非法字元" });
    } else if (!pwdreg.test(body.password)) {
        res.json({ code: -1, msg: "密碼需包含英文、數字及特殊符號" });
    } else {
        db.findOne({ 'username': body.username }, (err, doc) => {
            if (err) {
                res.json({ code: 1, msg: "奇怪的錯誤" });
            } else if (doc) {
                res.json({ code: -1, msg: "該帳號已被註冊" });
            } else {
                body.level = 1
                if (body.nickname === undefined) {
                    body.nickname = body.username;
                }
                db.insertWithUid(body, (err, ret) => {
                    if (err) {
                        res.json({ code: 2, msg: "奇怪的錯誤" });
                    } else {
                        res.json({ code: 0, msg: "註冊成功！\n\n歡迎加入顆顆客運" });
                    }
                });
            }
        });
    }
});

// extension methods
DataStore.prototype.insertWithUid = function (value, func) {
    let db = Object(this);
    value.uid = uid
    db.insert(value, (err, ret) => {
        if (!err) {
            uid++
        }
        func(err, ret)
    });
}

router.get('/*', (req, res) => {
    res.render('layout', { main: '404' });
});

module.exports = router;