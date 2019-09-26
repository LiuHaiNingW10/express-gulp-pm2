var express = require("express");
var router = new express.Router();
var config = require("../config");
var myUtil = require("../util");
var request = require("request");

// multer、superagent 结合使用 实现 upload上传

var multer = require("multer");
var superagent = require("superagent");
var upload = multer();

// 统一设置编码
router.use(function(req, res, next) {
  res.append("content-type", "application/json;charset=UTF-8");
  next();
});
/**
 * @description 图谱自动登录
 */
router.get("/grahp/auto", function(req, res, next) {
  var reqUrl = myUtil.makeGetQueryUrl(
    config.GRAHP_ADDRESS + "/api/user/login",
    req.query
  );
  request(
    {
      url: reqUrl,
      method: "POST",
      header: {
        cookie: "access_token=" + req.cookie.access_token,
        "content-type": "application/json;charset=utf-8;"
      },
      body: JSON.stringify({
        username: "demo",
        password: "kJu1mhYzmgY="
      })
    },
    function(error, response, body) {
      if (!error && response.statusCode == 200) {
        try {
          var user = JSON.parse(body);
          res.cookie("access_token", user.access_token, {
            path: "/",
            httpOnly: true
          });
          res.send({ status: 0, msg: "success" });
        } catch (error) {
          res.status(500).send(body);
        }
      } else {
        res.status(500).send(body);
      }
    }
  );
});

/**
 * @description execl 上传
 */
router.post("/importExecl/upload", upload.single("file"), function(
  req,
  res,
  next
) {
  var reqUrl = myUtil.makeGetQueryUrl(
    config.API_ADDRESS + req.path + req.query
  );
  var sa = superagent
    .post(reqUrl)
    .set("Cookie", "acrm_token=" + req.cookie.acrm_token);
  sa.attach("file", req.file.buffer, req.file.originalname);
  var keys = Object.keys(req.body);
  keys.forEach(function(i) {
    sa.field(i, req.body[i]);
  });
  sa.pipe(res);
});

/**
 * @description 通用接口
 */

router.all("*", function(req, res, next) {
  proxy(req, res, next);
});

function proxy(req, res, next, params) {
  var url = req.path;
  var method = req.method.toLowerCase();
  var reqUrl = myUtil.makeGetQueryUrl(config.API_ADDRESS + url, query);
  var requestParam = Object.assign(
    {
      url: reqUrl,
      method: method,
      header: {
        Cookie: "acrm_token=" + req.Cookie["acrm_token"],
        "Content-Type": "application/json;charset=utf-8"
      },
      body: JSON.stringify(req.body)
    },
    params || {}
  );
  request(requestParam)
    .on("error", function(err) {
      next(err);
    })
    .pipe(res);
}

module.exports = router;
