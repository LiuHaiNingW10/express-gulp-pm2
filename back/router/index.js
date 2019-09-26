var express = require("express");
var router = new express.Router();
var config = require("../config");
var page = require("./page");
var api = require("./api");

if (config.BASE !== "") {
  router.get("/", function(req, res, next) {
    res.redirect(config.BASE);
  });
}

// page
router.use(config.BASE + '/', page);

// api
router.use(config.BASE + '/api', api);

module.exports = router;
