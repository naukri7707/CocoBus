// import
const express = require('express');
const DataStore = require('nedb');

const router = express.Router();
const db = new DataStore({ filename: `${__root}/bus.db`, autoload: true });

// Get
router.get('/', (req, res) => {
    res.render('layout', { main: 'ticket' });
});

var a = Date("2019-03-08");
var dateStart = new Date();
var dateEnd = new Date("2020/01/03");
var difValue = (dateEnd - dateStart) / (1000 * 60 * 60 * 24);
var b = a;

db.find({}, (err, doc) => {
    if (err) {
        console.log("update ticket failed");
    } else {
        doc.forEach(it => {
            updateTicket(it);
        });
    }
})

router.get('/book', (req, res) => {
    res.render('layout', { main: 'ticket/book', search: {} });
})

router.post('/book', (req, res) => {
    const body = req.body;
    if (body.from === undefined) {
        res.json({ code: -1, msg: "起站不可為空" });
    } else if (body.to === undefined) {
        res.json({ code: -1, msg: "迄站不可為空" });
    } else if (body.date === "") {
        res.json({ code: -1, msg: "日期不可為空" });
    }
    db.find({
        $where: function () {
            for (const day of this.ticket) {
                if (day.date === body.date) {
                    return body.from === this.from && (body.to === this.to || body.to === this.through)
                }
            }
        }
    }, (err, doc) => {
        if (doc) {
            let targetDate = new Date(body.date) / 60000;
            let taretTime = targetDate + parseInt(body.timeHour, 10) * 60 + parseInt(body.timeMinute, 10);
            let results = [{}, {}, {}]
            let distance = [Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE]
            // 每個符合條件的車
            doc.forEach(bus => {
                // 7 天
                for (const day of bus.ticket) {
                    // 今天凌晨
                    let dayDate = new Date(day.date) / 60000;
                    day.run.forEach(it => {
                        let dis = Math.abs(taretTime - dayDate - it.time)
                        if (it.remain > 0 && dis < distance[2]) {
                            let obj = Object.assign({}, bus);
                            obj.day = day.date
                            obj.time = it.time
                            obj.remain = it.remain
                            if (dis < distance[0]) {
                                results[2] = results[1];
                                results[1] = results[0];
                                results[0] = obj
                                distance[2] = distance[1]
                                distance[1] = distance[0]
                                distance[0] = dis
                            } else if (dis < distance[1]) {
                                results[2] = results[1];
                                results[1] = obj
                                distance[2] = distance[2]
                                distance[1] = dis
                            } else {
                                results[2] = obj
                                distance[2] = dis
                            }
                        }
                    });
                }
            });
            results.sort();
            res.render('layout', { main: 'ticket/book-result', results: results });
        } else {
            res.render('layout', { main: 'ticket/book', search: body });
        }
    })
});

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
        res.render('layout', { main: 'ticket/search', search: search, results: doc });
    });
});

// Post
router.post('/remove', (req, res) => {
    db.remove({ _id: req.body._id }, (err, ret) => {
        if (ret === 0) {
            res.json({ code: -1, msg: "刪除失敗" });
        } else {
            res.json({ code: 0, msg: "刪除成功" });
        }
    });
});

router.post('/add', (req, res) => {
    const body = req.body;
    const cost = parseInt(body.cost, 10);
    if (body._id.length != 4) {
        res.json({ code: -1, msg: "路線代碼須為4碼" });
    } else if (isNaN(cost) || cost < 0) {
        res.json({ code: -1, msg: "無效的價位" });
    } else if (body.from === "") {
        res.json({ code: -1, msg: "起站不可為空" });
    } else if (body.to === "") {
        res.json({ code: -1, msg: "迄站不可為空" });
    } else {
        db.findOne({ _id: body._id }, (err, doc) => {
            if (err) {
                res.json({ code: 1, msg: "奇怪的錯誤" });
            } else if (doc) {
                res.json({ code: -1, msg: "該班次已註冊" });
            } else {
                db.insert({
                    _id: body._id,
                    type: body.type,
                    cost: parseInt(body.cost, 10),
                    from: body.from,
                    to: body.to,
                    through: body.through,
                    startTime: parseInt(body.startHour, 10) * 60 + parseInt(body.startMinute, 10),
                    endTime: parseInt(body.endHour, 10) * 60 + parseInt(body.endMinute, 10),
                    interval: parseInt(body.interval, 10),
                    ticket: []
                }, (err, doc) => {
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

// ticket = [
//     {
//         date: '',
//         run: [
//             {
//                 time: '', // time = hour * 60 + min
//                 remain: 0
//             }
//         ]
//     }
// ];

function updateTicket(bus) {
    let isDelete = false;
    let date = new Date();
    const today = date.today();
    // 刪除昨天以前的票
    for (let i = 0; i < bus.ticket.length; i++) {
        let ticket = bus.ticket[i];
        if (ticket.date < today) {
            bus.ticket.splice(0, t);
            isDelete = true;
        }
    }
    if (isDelete || bus.ticket.length === 0) {
        // 每日售票預製
        let run = [];
        for (let i = bus.startTime; i < bus.endTime; i += bus.interval) {
            run.push({ time: i, remain: 32 })
        }
        // 新增票至 7 天後
        for (let i = bus.ticket.length; i < 7; i++) {
            bus.ticket.push({ date: date.getNearDate(i), run: run });
        }
        db.update({ '_id': bus._id }, { $set: { ticket: bus.ticket } }, (err) => {
            if (err) {
                console.log("ticket update failed");
            }
        });
    }
}

// yyyy/mm/dd
Date.prototype.today = function () {
    let mm = (this.getMonth() + 1).toString().padStart(2, '0');
    let dd = this.getDate().toString().padStart(2, '0');
    return `${this.getFullYear()}/${mm}/${dd}`
};

// yyyy/mm/dd
Date.prototype.getNearDate = function (addDays) {
    let date = new Date();
    date.setDate(this.getDate() + addDays);
    let mm = (date.getMonth() + 1).toString().padStart(2, '0');
    let dd = date.getDate().toString().padStart(2, '0');
    return `${date.getFullYear()}/${mm}/${dd}`;
}

// hh:mm
Date.prototype.time = function () {
    let hh = this.getHours().toString().padStart(2, '0');
    let mm = this.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`
};

module.exports = router;