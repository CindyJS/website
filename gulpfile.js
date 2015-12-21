"use strict";

var $ = require("gulp-load-plugins")();
var argv = require("yargs").argv;
var browser = require("browser-sync");
var gulp = require("gulp");
var handlebars = require("handlebars");
var hbs = require("gulp-hbs");
var merge = require("merge-stream");
var open = require("open");
var path = require("path");
var rimraf = require("rimraf");
var sequence = require("run-sequence");
var xtend = require("xtend");

var addData = require("./lib/add-data");
var cmd = require("./lib/cmd");
var examples = require("./lib/examples");
var index = require("./lib/index");
var licenses = require("./lib/licenses");
var menuCombiner = require("./lib/menu-combiner");
var ref = require("./lib/ref");
var relativize = require("./lib/relativize");
var toc = require("./lib/toc");
var topbar = require("./lib/topbar");
var validator = require("./lib/validator-nu");

// Check for --production flag
var isProduction = !!(argv.production);

// Port to use for the development server.
var PORT = 8000;

// Browsers to target when prefixing CSS.
var COMPATIBILITY = ['last 2 versions', 'ie >= 9'];

// File paths to various assets are defined here.
var PATHS = {
  assets: [
    'src/assets/**/*',
    '!src/assets/{!img,js,scss}/**/*'
  ],
  sass: [
    'bower_components/foundation-sites/scss',
    'bower_components/motion-ui/src/'
  ],
  javascript: [
    'bower_components/jquery/dist/jquery.js',
    'bower_components/what-input/what-input.js',
    'bower_components/foundation-sites/js/foundation.core.js',
    'bower_components/foundation-sites/js/foundation.util.*.js',
    // Paths to individual JS components defined below
    'bower_components/foundation-sites/js/foundation.abide.js',
    'bower_components/foundation-sites/js/foundation.accordion.js',
    'bower_components/foundation-sites/js/foundation.accordionMenu.js',
    'bower_components/foundation-sites/js/foundation.drilldown.js',
    'bower_components/foundation-sites/js/foundation.dropdown.js',
    'bower_components/foundation-sites/js/foundation.dropdownMenu.js',
    'bower_components/foundation-sites/js/foundation.equalizer.js',
    'bower_components/foundation-sites/js/foundation.interchange.js',
    'bower_components/foundation-sites/js/foundation.magellan.js',
    'bower_components/foundation-sites/js/foundation.offcanvas.js',
    'bower_components/foundation-sites/js/foundation.orbit.js',
    'bower_components/foundation-sites/js/foundation.responsiveMenu.js',
    'bower_components/foundation-sites/js/foundation.responsiveToggle.js',
    'bower_components/foundation-sites/js/foundation.reveal.js',
    'bower_components/foundation-sites/js/foundation.slider.js',
    'bower_components/foundation-sites/js/foundation.sticky.js',
    'bower_components/foundation-sites/js/foundation.tabs.js',
    'bower_components/foundation-sites/js/foundation.toggler.js',
    'bower_components/foundation-sites/js/foundation.tooltip.js',
    'src/assets/js/!(app.js)**/*.js',
    'src/assets/js/app.js'
  ]
};

function pipeline(first) {
    var stream = first;
    for (var i = 1; i < arguments.length; ++i) {
        var next = arguments[i];
        stream.on("error", next.emit.bind(next, "error"));
        stream = stream.pipe(next);
    }
    return stream;
}

function github(repo, branch) {
    return $.data(function(file) { return xtend({github: {
        repo: repo,
        branch: branch || "master",
        path: path.relative(file.cwd, file.path),
    }}, file.data); });
}

handlebars.registerHelper("json", function(data) {
    return new handlebars.SafeString(
        JSON.stringify(data, null, "  ")
            .replace(/-(?=-)/g, "\\x2d")
            .replace(/</g, "\\x3c")
    );
});

gulp.task("bower", function() {
    return cmd.unlessExists("bower_components", ["bower", "install"]);
}); 

gulp.task("cjsmod", function() {
    return cmd.unlessExists("CindyJS", ["git", "submodule", "update", "--init", "CindyJS"]);
}); 

gulp.task("cjsdeps", ["cjsmod"], function() {
    return cmd.unlessExists("CindyJS/node_modules", ["npm", "install"], {cwd: "CindyJS"});
}); 

gulp.task("pages", ["cjsdeps"], function() {
    return pipeline(
        merge(
            pipeline(
                gulp.src(["src/pages/**.md", "src/pages/**.html"]),
                $.frontMatter({property: "data"}),
                github("CindyJS/website"),
                licenses.ccbysa40()
            ),
            pipeline(
                gulp.src(["examples/**.html"], {cwd: "CindyJS", base: "CindyJS"}),
                examples(),
                github("CindyJS/CindyJS"),
                index("examples", "src/layouts/dirlist.html", {
                    title: "Examples shipped with the source tree",
                }),
                licenses.apache2()
            ),
            pipeline(
                gulp.src(["ref/**.md"], {cwd: "CindyJS", base: "CindyJS"}),
                github("CindyJS/CindyJS"),
                addData({toc: true}),
                ref(),
                index("ref", "src/layouts/dirlist.html", {
                    title: "Reference Manual",
                }),
                licenses.apache2()
            )
        ),
        $.if(function(file) { return file.path.endsWith('.md') },
               $.markdown()),
        menuCombiner(pipeline(
            gulp.src("src/menus/**.menu"),
            $.frontMatter({property: "data"})
        )),
        topbar(),
        toc(),
        hbs(gulp.src("src/layouts/**.html"), {
            dataSource: "data",
            defaultTemplate: "main.html",
            compile: handlebars.compile,
        }),
        // validator(), // Examples don't validate yet, CindyJS#143
        gulp.dest("dist"));
});

gulp.task("validate", ["pages"], function() {
    return pipeline(
        gulp.src("dist/**.html"),
        validator());
});

gulp.task("validate-examples", ["cjsmod"], function() {
    return pipeline(
        gulp.src("CindyJS/examples/**.html"),
        validator());
});

gulp.task("relative", ["build"], function() {
    return pipeline(
        gulp.src("dist/**"),
        $.if(function(file) { return file.path.endsWith(".html") },
               relativize()),
        gulp.dest("relative"));
});

// Delete the "dist" folder
// This happens every time a build starts
gulp.task('clean', function(done) {
  rimraf('dist', done);
});

// Copy files out of the assets folder
// This task skips over the "img", "js", and "scss" folders, which are parsed separately
gulp.task('copy', function() {
  gulp.src(PATHS.assets)
    .pipe(gulp.dest('dist/assets'));
});

// Compile Sass into CSS
// In production, the CSS is compressed
gulp.task('sass', function() {
  var uncss = $.if(isProduction, $.uncss({
    html: ['src/**/*.html'],
    ignore: [
      new RegExp('^meta\..*'),
      new RegExp('^\.is-.*')
    ]
  }));

  var minifycss = $.if(isProduction, $.minifyCss());

  return gulp.src('src/assets/scss/app.scss')
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      includePaths: PATHS.sass
    })
      .on('error', $.sass.logError))
    .pipe($.autoprefixer({
      browsers: COMPATIBILITY
    }))
    .pipe(uncss)
    .pipe(minifycss)
    .pipe($.if(!isProduction, $.sourcemaps.write()))
    .pipe(gulp.dest('dist/assets/css'));
});

// Combine JavaScript into one file
// In production, the file is minified
gulp.task('javascript', function() {
  var uglify = $.if(isProduction, $.uglify()
    .on('error', function (e) {
      console.log(e);
    }));

  return gulp.src(PATHS.javascript)
    .pipe($.sourcemaps.init())
    .pipe($.concat('app.js'))
    .pipe(uglify)
    .pipe($.if(!isProduction, $.sourcemaps.write()))
    .pipe(gulp.dest('dist/assets/js'));
});

// Copy images to the "dist" folder
// In production, the images are compressed
gulp.task('images', function() {
  var imagemin = $.if(isProduction, $.imagemin({
    progressive: true
  }));

  return gulp.src('src/assets/img/**/*')
    .pipe(imagemin)
    .pipe(gulp.dest('dist/assets/img'));
});

// Build the "dist" folder by running all of the named tasks
gulp.task('build', ['pages', 'sass', 'javascript', 'images', 'copy']);

// Clean the "dist" folder before recreating its contents
gulp.task('rebuild', ['clean'], function(done) {
  gulp.start('build', done);
});

// Start a server with LiveReload to preview the site in
gulp.task('server', ['rebuild'], function() {
  browser.init({
    notify: false,
    server: 'dist', port: PORT
  });
});

// Build the site, run the server, and watch for file changes
gulp.task('default', ['rebuild', 'server'], function() {
  gulp.watch(PATHS.assets, ['copy', browser.reload]);
  gulp.watch(['src/pages/**/*.html'], ['pages', browser.reload]);
  gulp.watch(['src/{layouts,partials}/**/*.html'], ['pages', browser.reload]);
  gulp.watch(['src/assets/scss/**/*.scss'], ['sass', browser.reload]);
  gulp.watch(['src/assets/js/**/*.js'], ['javascript', browser.reload]);
  gulp.watch(['src/assets/img/**/*'], ['images', browser.reload]);
});
