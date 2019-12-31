// import
const express = require('express');
const DataStore = require('nedb');

const router = express.Router();
const db = new DataStore({ filename: `${__root}/bus.db`, autoload: true });

// Get
router.get('/', (req, res) => {
    res.render('layout', { main: 'ticket' });
});

// Post
router.get('/search', (req, res) => {
    const query = req.query;
    const search = {};
    if (query.from !== undefined) {
        search.from = query.from;
    }
    if (query.to !== undefined) {
        search.to = query.to;
    }
    if (query.through !== undefined) {
        search.through = query.through;
    }
    db.find(search).exec(function (err, doc) {
        if (req.session.userdata && req.session.userdata.level === 100) {
            res.render('layout', { main: 'ticket', search: search, results: doc, scripts: ['_script/sysop'] });
        } else {
            res.render('layout', { main: 'ticket', search: search, results: doc });
        }
    });
});

router.post('/remove', (req, res) => {
    db.remove({ serial: req.body.serial }, (err, ret) => {
        if (ret === 0) {
            res.json({ code: -1, msg: "刪除失敗" });
        } else {
            res.json({ code: 0, msg: "刪除成功" });
        }
    });
});

router.post('/add', (req, res) => {
    if (req.body.serial.length != 4) {
        res.json({ code: -1, msg: "路線代碼須為4碼" });
    } if (req.body.from === "") {
        res.json({ code: -1, msg: "起站不可為空" });
    } else if (req.body.to === "") {
        res.json({ code: -1, msg: "迄站不可為空" });
    } else if (req.body.through === "") {
        res.json({ code: -1, msg: "經站不可為空" });
    } else if (req.body.startTime === "") {
        res.json({ code: -1, msg: "首班時間不可為空" });
    } else if (req.body.endTime === "") {
        res.json({ code: -1, msg: "末班時間不可為空" });
    } else if (req.body.invert === "") {
        res.json({ code: -1, msg: "間隔時間不可為空" });
    } else {
        db.findOne({ serial: req.body.serial }, (err, doc) => {
            if (err) {
                res.json({ code: 1, msg: "奇怪的錯誤" });
            } else if (doc) {
                res.json({ code: -1, msg: "該序號已註冊" });
            } else {
                db.insert(req.body, (err, doc) => {
                    if (err) {
                        res.json({ code: 2, msg: "奇怪的錯誤" });
                    } else if (doc) {
                        res.json({ code: 0, msg: "新增成功" });
                    } else {
                        res.json({ code: -1, msg: "新增失敗，請重試" });
                    }
                });
            }
        });
    }
});

module.exports = router;