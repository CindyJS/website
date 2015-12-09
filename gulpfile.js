"use strict";

var cp = require("child_process");
var data = require("gulp-data");
var fm = require("gulp-front-matter");
var gulp = require("gulp");
var gulpif = require("gulp-if");
var handlebars = require("handlebars");
var hbs = require("gulp-hbs");
var markdown = require("gulp-markdown");
var open = require("open");
var rimraf = require("rimraf");
var xtend = require("xtend");

var menuCombiner = require("./lib/menu-combiner");
var topbar = require("./lib/topbar");

function pipeline(first) {
    var stream = first;
    for (var i = 1; i < arguments.length; ++i) {
        var next = arguments[i];
        stream.on("error", next.emit.bind(next, "error"));
        stream = stream.pipe(next);
    }
    return stream;
}

handlebars.registerHelper("json", function(data) {
    return new handlebars.SafeString(
        JSON.stringify(data, null, "  ")
            .replace(/-(?=-)/g, "\\x2d")
            .replace(/</g, "\\x3c")
    );
});

gulp.task("default", [
    "html",
    "foundationResources",
    "images",
]);

gulp.task("clean", function(done) {
    rimraf("build", done);
});

gulp.task("html", function() {
    return pipeline(
        gulp.src(["src/**.md", "src/**.html"]),
        fm({property: "data"}),
        data(function(file) { return xtend(file.data, {
            github: "CindyJS/webpage",
            branch: "master",
            relative: file.relative,
        }); }),
        gulpif(function(file) { return file.path.endsWith('.md') },
               markdown()),
        menuCombiner(pipeline(
            gulp.src("src/**.menu"),
            fm({property: "data"})
        )),
        topbar(),
        hbs(gulp.src("layouts/**.html"), {
            dataSource: "data",
            compile: handlebars.compile,
        }),
        gulp.dest("build"));
});

gulp.task("foundationResources", function() {
    return pipeline(
        gulp.src("foundation/{js,stylesheets}/*"),
        gulp.dest("build"));
});

gulp.task("images", function() {
    return pipeline(
        gulp.src("images/**"),
        gulp.dest("build/images"));
});

gulp.task("open", ["default"], function(done) {
    var child = cp.fork(
        require.resolve("./serve.js"), ["--gulp"],
        {stdio: "inherit"});
    child.once("message", function(msg) {
        open(msg.url);
        done();
    });
    child.on("error", function(err) { done(err); });
    child.on("exit", function(code, signal) {
        if (signal !== null) done(Error("Child exited with signal " + signal));
        else if (code !== 0) done(Error("Child exited with code " + code));
        else done();
    });
});

gulp.task("watch", ["open"], function(done) {
    return gulp.watch([
        "src/**.md",
        "layouts/**.html",
    ], ["default"]);
});
