var gulp = require("gulp");
var plugins = require("gulp-load-plugins")();
var browserify = require("browserify");
var through2 = require("through2");
var path = require("path");
var config = require("./back/config");

/**
 * @description browerify 打包 xxx.entry.js 文件 支持在浏览器使用；
 */

function swallowError(error) {
  console.log(error.toString());
  this.emit("end");
}
// 清除
gulp.task("clean", function() {
  return gulp
    .src(["static", "src_tmp"], {
      read: false
    })
    .pipe(plugins.clean())
    .on("error", swallowError);
});

// 复制库
function copyFile(paths, distPath, base) {
  return gulp
    .src(paths, { base: base || "src" })
    .pipe(gulp.dest(distPath))
    .on("error", swallowError);
}

// 处理公用包
var exposeMap;

function buildJsCommon(distPath) {
  exposeMap = {
    external: []
  };
  return (
    gulp
      .src("src/**/*.common.js", { base: "src" })
      // browserify提取公用包
      .pipe(
        through2
          .obj(function(chunk, enc, callback) {
            var key = chunk.path.match(/([^\/\\]+)\.common.js/)[1];
            if (exposeMap[key]) {
              console.log(chunk.path, "公用包取名重复，请调整");
              process.exit();
              return;
            } else {
              // 记录公用包列表
              exposeMap[key] = chunk.path;
              exposeMap.external.push(key);
              var b = browserify();
              b.require(chunk.path, { expose: key });
              b.bundle(function(err, res) {
                if (err) {
                  console.log(err.stack);
                  return;
                }
                chunk.contents = res;
                callback(null, chunk);
              });
            }
          })
          .on("error", swallowError)
      )
      .pipe(gulp.dest(distPath))
      .on("error", swallowError)
  );
}

//处理入口包
function buildJsEntry(distPath) {
  // browerify 打包
  return gulp
    .src("src/**/*.entry.js", { base: "src" })
    .pipe(
      through2
        .obj(function(chunk, enc, callback) {
          browserify(chunk.path)
            .external(exposeMap.external)
            .bundle(function(err, res) {
              if (err) {
                console.log(err.stack);
                return;
              }
              chunk.contents = res;
              callback(null, chunk);
            });
        })
        .on("error", swallowError)
    )
    .pipe(gulp.dest(distPath))
    .on("error", swallowError);
}

// 处理less

function buildLess(distPath) {
  return gulp
    .src("src/**/*.less")
    .pipe(plugins.less().on("error", swallowError))
    .pipe(replacePath())
    .pipe(gulp.dest(distPath))
    .on("error", swallowError);
}

// 替换路径
function replacePath() {
  return plugins.replace(
    /\/static\/(styles|imgs|scripts|fonts)/g,
    config.BASE + "/static/$1"
  );
}

// 替换ejs、css 路径
function replaceEjsCss(distPath) {
  return gulp
    .src("src/**/*.*(ejs|css)")
    .pipe(replacePath())
    .pipe(gulp.dest(distPath))
    .on("error", swallowError);
}

/**
 * @description 开发
 */

// 雪碧图
function buildSprite(distPath) {
  var spriteData = gulp
    .src(["src/imgs/**/*.png", "!src/imgs/sprite*.png", "!src/imgs/static/**"])
    .pipe(
      plugins
        .spritesmith({
          imgName: "imgs/sprite.png",
          cssName: "style/common/sprite.css",
          padding: 20,
          imgPath: config.BASE + "static/imgs/sprite.png",
          retinaImgName: "imgs/sprite@2x.png",
          retinaSrcFilter: ["src/imgs/**/*@2x.png"],
          retinaImgPath: config.BASE + "/static/imgs/sprite@2x.png",
          cssVarMap: function(sprite) {
            var arr = [];
            sprite.name = sprite.name.replace(/\_/g, "-");
            if (sprite.name.indexOf("-hover") !== -1) {
              sprite.name = sprite.name.replace("-hover", ":hover");
            }
            if (sprite.name.indexOf("!") > -1) {
              arr = sprite.name.split("!");
              sprite.name =
                arr[1] + " " + ",.icon-" + arr[0] + ".icon-" + arr[1];
            }
          }
        })
        .on("error", swallowError)
    );
  return spriteData.pipe(gulp.dest(distPath)).on("error", swallowError);
}

var dist = "static";
var tmp = "src_tmp";

/**
 * @description 开发
 */

gulp.task("sprite", function() {
  return buildSprite(dist);
});
// 处理js
gulp.task("js-common", function() {
  return buildJsCommon(dist);
});
gulp.task("js-entry", ["js-common"], function() {
  return buildJsEntry(dist);
});
gulp.task("js", ["js-entry"]);
//less
gulp.task("less", function() {
  return buildLess(dist);
});
gulp.task("replace", function() {
  return replaceEjsCss(dist);
});
//ejs/css 路径
gulp.task("other", function() {
  return copyFile(
    [
      "src/**/*",
      "!src/**/*.entry.js",
      "!src/**/*.common.js",
      "!src/**/*.*(less|css|ejs)"
    ],
    dist
  );
});

gulp.task("dev",plugins.sync(gulp).sync(["clean", "sprite", "js", "less", "replace", "other"]));
gulp.task("watch", ["dev"], function() {
  gulp.watch("src/**/*", function(event) {
    var filePath = event.path;
    console.log(
      "file: " + event.path.replace(__dirname, "") + "was " + event.type
    );
    if (event.type == "delete") {
      return false;
    }
    if (/\.js$/.test(filePath)) {
      // 先复制过去
      copyFile(event.path, dist);
      // 整体打包一遍
      buildJsCommon(dist).on("end", function() {
        console.log("Finshed dev:js-common");
        buildJsEntry(dist).on("end", function() {
          console.log("Finshed dev:js-entry");
        });
      });
    } else if (/\.less$/.test(filePath)) {
      buildLess(dist).on("end", function() {
        console.log("Finshed dev:js-entry");
      });
    } else if (/\.css$/.test(filePath)) {
      gulp
        .src(filePath, { base: "src" })
        .pipe(replacePath())
        .pipe(gulp.dest(dist))
        .on("end", function() {
          console.log("Finshed");
        });
    } else if (/\.ejs$/.test(filePath)) {
      gulp
        .src(filePath, { base: "src" })
        .pipe(replacePath())
        .pipe(gulp.dest(dist))
        .on("end", function() {
          console.log("Finshed");
        });
    } else {
      copyFile(filePath, dist).on("end", function() {
        console.log("Finshed");
      });
    }
  });
});

/**
 * @description 生产
 */
gulp.task("minify", function() {
  return gulp
    .src(["static/scripts/**/*.js", "!static/scripts/lib/**/*"], { base: dist })
    .pipe(
      plugins.minify({
        ext: {
          src: "-debug.js",
          min: ".js"
        },
        compress: { ie8: true },
        mangle: {
          reserved: ["require", "exports", "module"],
          ie8: true
        },
        output: { ie8: true }
      })
    )
    .pipe(gulp.dest(dist));
});
var revSrc = [
  "static/**/*.*(js|css|png|jpg|gif)",
  "!static/scripts/lib/**/*",
  "!static/imgs/static/**/*"
];

gulp.task("rev", function() {
  return gulp
    .src(revSrc, { base: dist })
    .pipe(plugins.rev())
    .pipe(gulp.dest(tmp))
    .pipe(plugins.rev.manifest())
    .pipe(gulp.dest(tmp));
});

gulp.task("revClean", ["rev"], function() {
  return gulp
    .src(revSrc, {
      read: false
    })
    .pipe(plugins.clean());
});

gulp.task("revCopy", ["revClean"], function() {
  return gulp.src(tmp + "/**/*").pipe(gulp.dest(dist));
});

gulp.task("tmpClean", ["revCopy"], function() {
  return gulp
    .src(tmp, {
      read: false
    })
    .pipe(plugins.clean());
});

gulp.task("revReplace", ["tmpClean"], function() {
  return gulp
    .src([dist + "/**/*.*(ejs|css)"], { base: dist })
    .pipe(
      plugins.revReplace({
        manifest: gulp.src(dist + "/rev-manifest.json"),
        replaceInExtension: [".css", ".ejs"]
      })
    )
    .pipe(gulp.dest(dist));
});

gulp.task(
  "build",
  plugins
    .sync(gulp)
    .sync([
      "clean",
      "sprite",
      "js",
      "less",
      "replace",
      "other",
      "minify",
      "revReplace"
    ])
);
