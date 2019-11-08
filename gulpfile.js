"use strict";

const gulp = require("gulp"),
  browserSync = require("browser-sync").create(),
  source = require("vinyl-source-stream"),
  browserify = require("browserify"),
  watchify = require("watchify"),
  babelify = require("babelify"),
  sourcemaps = require("gulp-sourcemaps"),
  scss = require("gulp-sass"),
  ejs = require("gulp-ejs"),
  rename = require("gulp-rename"),
  log = require("fancy-log"),
  path = require("path"),
  fs = require("fs");

gulp.task("browserSync", done => {
  browserSync.init({
    server: {
      baseDir: "public"
    },
    browser: "google chrome"
  });

  done();
});

gulp.task("reload:browserSync", done => {
  browserSync.reload();
  done();
});

gulp.task("notify:browserSync", done => {
  browserSync.notify("build...");
  done();
});

gulp.task("render:ejs", () => {
  return gulp
    .src("./src/ejs/*.ejs")
    .pipe(ejs({}))
    .pipe(rename({extname: '.html'}))
    .pipe(gulp.dest("./public"));
});

gulp.task("watch:ejs", () => {
    return gulp.watch("src/ejs/**/*.ejs", gulp.series("render:ejs"));
});

gulp.task("compile:scss", () => {
  return gulp
    .src("./src/scss/**/*.scss")
    .pipe(sourcemaps.init())
    .pipe(scss({}))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest("./public/css"));
});

gulp.task("watch:html", () => {
  return gulp.watch("./public/**/*.html", gulp.series("reload:browserSync"));
});

gulp.task("watch:scss", () => {
  return gulp.watch(
    "./src/scss/**/*.scss",
    gulp.series("compile:scss", "reload:browserSync")
  );
});

gulp.task("watch:js", () => {
  const files = fs.readdirSync("./src/js");
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (path.extname(file) !== ".js") continue;

    initBundlerWatch(path.join("src", "js", file));
  }

  return gulp.watch("./src/js/**/*.js").on("change", initBundlerWatch);
});

gulp.task(
  "watch",
  gulp.parallel(
    gulp.series("compile:scss", "watch:scss"),
    "watch:js",
    gulp.series("render:ejs", "watch:ejs"),
    "watch:html",
    "browserSync"
  )
);

gulp.task("default", gulp.series("watch"));

let bundlers = {};

function initBundlerWatch(file) {
  if (bundlers.hasOwnProperty(file)) return;

  const bundler = createBundler(file);
  bundlers[file] = bundler;

  const watcher = watchify(bundler);
  const filename = path.basename(file);

  function bundle() {
    return bundler
      .bundle()
      .on("error", error => console.error(error))
      .pipe(source(filename))
      .pipe(gulp.dest("./public/js"));
  }

  watcher.on("update", bundle);
  watcher.on("time", time => console.log(`Built client in ${time}ms`));

  bundle();
}

function createBundler(file) {
  const bundler = browserify(file);
  bundler.transform(babelify);
  return bundler;
}
