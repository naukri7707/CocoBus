// import
const express = require('express');
const router = express.Router();

// Get
router.get('/', function (req, res) {
    res.render('layout', { main: 'ticket' });
});

module.exports = router;