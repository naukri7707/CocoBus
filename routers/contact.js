// import
const express = require('express');
const verify = require(`${__root}verify`);
const DataStore = require('nedb');

const router = express.Router();
const db = new DataStore({ filename: `${__root}/feedback.db`, autoload: true });

var fid = 1;

db.find({}).sort({ _id: -1 }).limit(1).exec((err, doc) => {
    if (err) {
        console.log("Feedback ID 初始化失敗");
    }
    if (doc.length > 0) {
        fid = doc[0]._id + 1;
    }
});

// Get
router.get('/station', (req, res) => {
    res.render('layout', { main: 'contact/station' });
});

router.get('/feedback', (req, res) => {
    req.session.verify = verify.makeVerify();
    res.render('layout', { main: 'contact/feedback' });
});

router.get('/jobs', (req, res) => {
    res.render('layout', { main: 'contact/jobs' });
});

router.get('/*', (req, res) => {
    res.render('layout', { main: '404' });
});

// Post
router.post('/feedback', (req, res) => {
    const emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    const body = req.body;
    if (body.name === "") {
        res.json({ code: -1, msg: "姓名不可為空" });
    } else if (body.email !== undefined && !emailReg.test(body.email)) {
        res.json({ code: -1, msg: "無效的信箱" });
    } else if (body.title === "") {
        res.json({ code: -1, msg: "標題不可為空" });
    } else if (body.content.length < 10) {
        res.json({ code: -1, msg: "內文不可少於10字" });
    } else if (req.session.verify === undefined) {
        res.json({ code: -2, msg: "驗證碼已過期為您重新整理頁面" });
    } else if (!verify.auditVerify(req.session.verify, req.body.verifyAns)) {
        res.json({ code: -1, msg: "驗證碼錯誤" });
    } else {
        let date = new Date();
        body.time = `${date.getFullYear()}年${date.getMonth()}月${date.getDate()}日${date.getHours()}:${date.getMinutes()}`
        body.reply = false;
        body._id = fid++;
        db.insert(body, (err, doc) => {
            if (err) {
                res.json({ code: 1, msg: "奇怪的錯誤" });
            } else {
                res.json({ code: 0, msg: "寄送完成\n\n感謝您的回覆 :)" });
                req.session.verify = verify.makeVerify();
            }
        });
    }
});

router.post('/refresh', (req, res) => {
    req.session.verify = verify.makeVerify();
    res.json(req.session.verify);
});

module.exports = router;