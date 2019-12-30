// import
const express = require('express');
const DataStore = require('nedb');

const router = express.Router();
const db = new DataStore({ filename: require.main.path + '\\bus.db', autoload: true });

// Get
router.get('/', function (req, res) {
    res.render('layout', { main: 'ticket' });
});

// Post
router.get('/search', function (req, res) {
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
        res.render('layout', { main: 'ticket', search: search, results: doc });
    });
});

module.exports = router;