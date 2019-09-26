var express = require("express");
var ejs = require("ejs");
var path = require("path");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var compression = require("compression");

if (process.env.NODE_ENV === "development") {
  ejs.debug = true;
}

var config = require("./back/config");
var router = require("./back/router");

var app = express();
// node层存储 未登录时跳转页面、基本路径
app.locals.xhb = config.XHB_ADDRESS;
app.locals.base = config.BASE;
// view engine setup 设置模板引擎支持ejs文件
app.engine(".ejs", ejs.__express);
app.set("views", "./static/tpls");
app.set("view engine", "ejs");

// 使用body-parser获取前端传送过来的数据 使用bodyParser.urlencoded(),
// 使node后台支持了第一种请求体. 使用bodyParser.json(),使node后台支持了第二种请求体.
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false
  })
);

app.use(cookieParser());

// 但是还是无比高效的降低了网络传输文件大小。优化网页内容的加载。
app.use(compression());
app.use(
  ["/static", config.BASE + "/static"],
  express.static(path.join(__dirname, "static"))
);
app.use("/", router);

// 404
app.use(function(req, res, next) {
  var err = new Error("NOT Found");
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  if (process.env.NODE_ENV === "development") {
    var status = 500;
    if (err.message && err.message.toLowerCase() == "not found") {
      status = 404;
    }
    res.status(status).render("error", {
      message: err.message,
      error: err,
      status: status
    });
  } else {
    if (err.message.toLowerCase() == "not found") {
      res.status(404).render("404");
    } else {
      res.status(500).render("500");
    }
  }
});
var server = app.listen(config.PORT, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log("whale listening at http://%s:%s", host, port);
});

module.exports = app;
