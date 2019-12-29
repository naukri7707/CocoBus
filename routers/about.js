// import
const express = require('express');
const router = express.Router();
const DataStore = require('nedb');

// const
const db = new DataStore({ filename: require.main.path + '\\bus.db', autoload: true });

// Get
router.get('/bus', function (req, res) {
    db.find({}).exec((err, doc) => {
        res.render('layout', { main: 'about/bus', data: doc });
    });
});

router.get('/philosophy', function (req, res) {
    res.render('layout', { main: 'about/philosophy' });
});

router.get('/terms', function (req, res) {
    res.render('layout', { main: 'about/terms' });
});

router.get('/*', (req, res) => {
    res.render('layout', { main: '404' });
});

module.exports = router;