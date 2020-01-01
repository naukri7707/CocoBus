// import
const express = require('express');
const DataStore = require('nedb');
const verify = require(`${__root}verify`);

// const
const router = express.Router();
const db = new DataStore({ filename: require.main.path + '\\user.db', autoload: true });

// variables
var uid = 1;

db.find({}).sort({ uid: -1 }).limit(1).exec((err, doc) => {
    if (err) {
        console.log("User ID 初始化失敗");
    }
    if (doc) {
        uid = doc[0].uid + 1;
    }
});

// Get
router.get('/login', (req, res) => {
    if (req.session.userdata) {
        res.redirect('/');
    } else {
        res.render('layout', { main: 'user/login' });
    }
});

router.get('/sign-up', (req, res) => {
    req.session.verify = verify.makeVerify();
    res.render('layout', { main: 'user/sign-up', verify: req.session.verify });
});

// 攔截登入、註冊外的所有請求，若尚未登入則引導至 login
router.get('/*', (req, res, next) => {
    if (req.session.userdata) {
        next();
    } else {
        res.redirect('login');
    }
});

router.get('/home', (req, res) => {
    res.render('layout', { main: 'user/home' });
});


router.get('/mileage', (req, res) => {
    res.render('layout', { main: 'user/mileage' });
});


router.get('/common', (req, res) => {
    res.render('layout', { main: 'user/common' });
});

router.get('/setting', (req, res) => {
    res.render('layout', { main: 'user/setting' });
});

router.get('/logout', (req, res) => {
    req.session.destroy(function (err) {
        if (err) {
            res.json({ code: 1, msg: '退出登入失敗' });
        } else {
            res.redirect('login');
        }
    });
});

// Post
router.post('/login', (req, res) => {
    const body = req.body;
    if (body.username === "") {
        res.json({ code: -1, msg: "帳號為不可為空" });
    } else if (body.password === "") {
        res.json({ code: -1, msg: "密碼為不可為空" });
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
                            req.session.userdata = doc;
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
    const pwdReg = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*\W)/;
    const emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    const phoneReg = /^[09]{2}[0-9]{8}$/

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
    } else if (!pwdReg.test(body.password)) {
        res.json({ code: -1, msg: "密碼需包含英文、數字及特殊符號" });
    } else if (body.phoneReg !== undefined && !phoneReg.test(body.email)) {
        res.json({ code: -1, msg: "無效的手機號碼" });
    } else if (body.email !== undefined && !emailReg.test(body.email)) {
        res.json({ code: -1, msg: "無效的信箱" });
    } else if (req.session.verify === undefined) {
        res.json({ code: -2, msg: "驗證碼已過期為您重新整理頁面" });
    } else if (!verify.auditVerify(req.session.verify, req.body.verifyAns)) {
        res.json({ code: -1, msg: "驗證碼錯誤" });
    } else {
        db.findOne({ 'username': body.username }, (err, doc) => {
            if (err) {
                res.json({ code: 1, msg: "奇怪的錯誤" });
            } else if (doc) {
                res.json({ code: -1, msg: "該帳號已被註冊" });
            } else {
                body.level = 1
                delete body.verifyAns
                if (body.nickname === "") {
                    body.nickname = body.username;
                }
                db.insertWithUid(body, (err, doc) => {
                    if (err) {
                        res.json({ code: 2, msg: "奇怪的錯誤" });
                    } else {
                        req.session.regenerate(function (err) {
                            if (err) {
                                res.json({ code: 3, msg: "Session Error" });
                            } else {
                                req.session.userdata = doc;
                                res.json({ code: 0, msg: "註冊成功！\n\n歡迎加入顆顆客運, " + body.nickname })
                            }
                        });
                    }
                });
            }
        });
    }
});

// 攔截登入、註冊外的所有請求，若尚未登入則引導至 login
router.post('/*', (req, res, next) => {
    if (req.session.userdata) {
        next();
    } else {
        res.json({ code: -9, msg: "請先登入" });
    }
});

router.post('/set-info', (req, res) => {
    const body = req.body;
    const emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    const phoneReg = /^[09]{2}[0-9]{8}$/
    var a = phoneReg.test("a");
    if (body.nickname === undefined || body.nickname === "") {
        res.json({ code: -1, msg: "暱稱不可為空" });
    } else if (body.phone !== undefined && body.phone !== "" && !phoneReg.test(body.phone)) {
        res.json({ code: -1, msg: "無效的手機號碼" });
    } else if (body.email !== undefined && body.email !== "" && !emailReg.test(body.email)) {
        res.json({ code: -1, msg: "無效的信箱" });
    } else {
        db.update({ 'username': req.session.userdata.username }, { $set: body }, function (err, num) {
            if (err) {
                res.json({ code: 1, msg: "奇怪的錯誤" });
            } if (num === 0) {
                res.json({ code: -1, msg: "找不到使用者，請嘗試重新登錄後再試一次" });
            } else if (num == 1) {
                req.session.userdata.nickname = body.nickname;
                req.session.userdata.cellphone = body.cellphone;
                req.session.userdata.email = body.email;
                res.json({ code: 0, msg: "資料更新完成" });
            } else {
                console.log("oops," + req.session.userdata.username + "update other people's data");
                res.json({ code: -1, msg: "你更新到別人的資料了 :/" });
            }
        });
    }
});

router.post('/set-password', (req, res) => {
    const body = req.body;
    const reg = /^[a-zA-Z0-9~!@#$%^&*()_+`\-={}\[\]:\";\'<>?,.\/]+$/;
    const pwdReg = /^(?=.*\d)(?=.*[a-zA-Z])(?=.*\W)/;
    const emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    const phoneReg = /^[09]{2}[0-9]{8}$/
    if (body.oldPassword !== req.session.userdata.password) {
        res.json({ code: -1, msg: "舊的密碼不正確" });
    } else if (body.password === undefined) {
        res.json({ code: -1, msg: "密碼不可為空" });
    } else if (body.password.length < 8 || body.password.length > 32) {
        res.json({ code: -1, msg: "密碼長度需介於8至32之間" });
    } else if (!reg.test(body.password)) {
        res.json({ code: -1, msg: "密碼含有非法字元" });
    } else if (!pwdReg.test(body.password)) {
        res.json({ code: -1, msg: "密碼需包含英文、數字及特殊符號" });
    } else {
        db.update({ 'username': req.session.userdata.username }, { $set: body }, function (err, num) {
            if (err) {
                res.json({ code: 1, msg: "奇怪的錯誤" });
            } if (num === 0) {
                res.json({ code: -1, msg: "找不到使用者，請嘗試重新登錄後再試一次" });
            } else if (num == 1) {
                req.session.destroy((err) => {
                    res.json({ code: -9, msg: "密碼更新完成，請重新登入" });
                });
            } else {
                console.log("oops," + req.session.userdata.username + "update other people's data");
                res.json({ code: -1, msg: "你更新到別人的資料了 :/" });
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