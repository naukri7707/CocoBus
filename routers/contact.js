// import
const express = require('express');
const router = express.Router();

// Get
router.get('/location', function (req, res) {
    res.render('layout', { main: 'contact/location' });
});

router.get('/feedback', function (req, res) {
    res.render('layout', { main: 'contact/feedback' });
});

router.get('/jobs', function (req, res) {
    res.render('layout', { main: 'contact/jobs' });
});

router.get('/*', (req, res) => {
    res.render('layout', { main: '404' });
});

module.exports = router;