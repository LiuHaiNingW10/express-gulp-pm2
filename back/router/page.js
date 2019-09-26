var express = require('express');
var router = new express.Router();
var config = require('../config');

/**
 * @description 
 */
router.get('/', function (req, res, next) {
    res.render('layout');
})


module.exports = router;