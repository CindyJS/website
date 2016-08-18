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
var ref = require("./lib/ref");
var relativize = require("./lib/relativize");
var toc = require("./lib/toc");
var validator = require("./lib/validator-nu");
var galleryindex = require("./lib/galleryindex");



// Check for --production flag
var isProduction = !!(argv.production);

// Port to use for the development server.
var PORT = 8163;

// Browsers to target when prefixing CSS.
var COMPATIBILITY = ['last 2 versions', 'ie >= 9'];

// File paths to various assets are defined here.
var PATHS = {
    assets: [
        'src/assets/**/*',
        '!src/assets/{img,js,scss}/**/*'
    ],
    sass: [],
    javascript: [
        'src/assets/js/app.js'
    ]
};


//all automatically generated galleries
var Galleries = [{
    src: "src/gallery/cindygl/*.html",
    dest: "gallery/cindygl",
    title: "CindyGL-Gallery",
    description: "These examples demonstrate the CindyGL-Plugin",
    imgpath: "", //local folder
}, {
    src: "CindyJS/examples/**/*.html",
    dest: "examples",
    title: "Examples shipped with the source tree",
    description: "This shows the examples <a href='https://github.com/CindyJS/CindyJS'>from the repository</a>, demonstrating individual functions and operations. Most of them demonstrate a single technical feature and are not intended to be examples of what well-designed CindyJS widgets can look like.",
    imgpath: "/assets/img/thumbnail/",
    github: "CindyJS/CindyJS",
}];


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
    return $.data(function(file) {
        return xtend({
            github: {
                repo: repo,
                branch: branch || "master",
                path: path.relative(file.cwd, file.path),
            }
        }, file.data);
    });
}

handlebars.registerHelper("json", function(data) {
    return new handlebars.SafeString(
        JSON.stringify(data, null, "  ")
        .replace(/-(?=-)/g, "\\x2d")
        .replace(/</g, "\\x3c")
    );
});

gulp.task("cjsmod", function() {
    return cmd.unlessExists("CindyJS", ["git", "submodule", "update", "--init", "CindyJS"]);
});

gulp.task("cjsdeps", ["cjsmod"], function() {
    return cmd.unlessExists(
        "CindyJS/node_modules", ["npm", "install"], {
            cwd: "CindyJS",
            extraEnv: {
                CINDYJS_SKIP_PREPUBLISH: "true"
            }
        });
});


function gallerynavigation(currentdir) {
    return {
        galleries: [{
            href: "gallery",
            highlight: "gallery" == currentdir,
            title: "Overview"
        }].concat(Galleries.map(function(g) {
            return {
                href: g.dest,
                highlight: g.dest == currentdir,
                title: g.title
            };
        }))
    };
}

gulp.task("pages", ["cjsdeps", "copyexampleimages", "copygallerydata"], function() {
    return pipeline(
        merge(
            pipeline(
                gulp.src(["src/pages/**/*.md", "src/pages/**/*.html"]),
                $.frontMatter({
                    property: "data"
                }),
                github("CindyJS/website"),
                licenses.ccbysa40()
            ),
            merge(
                Galleries.map(
                    gallery => pipeline(
                        gulp.src([gallery.src], {
                            base: gallery.base || gallery.src.split('/')[0]
                        }),
                        examples(),
                        addData(gallerynavigation(gallery.dest)),
                        github(gallery.github || "CindyJS/website"),
                        index(gallery.dest, "src/layouts/gallery.html", xtend(gallery, gallerynavigation(gallery.dest))),
                        licenses.apache2()
                    )
                )
            ),
            pipeline(
                gulp.src(["src/gallery"], {
                    base: "src"
                }),
                galleryindex(Galleries, "Gallery"),
                addData(gallerynavigation("gallery")),
                github("CindyJS/website"),
                licenses.apache2()
            ),
            pipeline(
                gulp.src(["ref/**/*.md"], {
                    cwd: "CindyJS",
                    base: "CindyJS"
                }),
                github("CindyJS/CindyJS"),
                addData({
                    toc: true
                }),
                ref(),
                index("ref", "src/layouts/dirlist.html", {
                    title: "Reference Manual",
                }),
                licenses.apache2()
            )
        ),
        $.if(function(file) {
                return file.path.endsWith('.md')
            },
            $.markdown()),
        toc(),
        hbs(gulp.src("src/layouts/**/*.html"), {
            dataSource: "data",
            defaultTemplate: "main.html",
            compile: handlebars.compile,
        }),
        gulp.dest("dist"));
});

gulp.task("copyexampleimages", [], function() {
    return gulp.src(["examples/**/*.png", "examples/**/*.jpg"], {
        cwd: "CindyJS",
        base: "CindyJS"
    }).pipe(gulp.dest("dist"));
});

gulp.task("copygallerydata", [], function() {
    return gulp.src(['src/gallery/**/*', '!src/gallery/**/*.html'], {
        base: "src"
    }).pipe(gulp.dest("dist")); //copies everything that is not a html
});



gulp.task("asis", [], function() {
    return gulp.src("src/asis/**/*").pipe(gulp.dest("dist"));
});

gulp.task("validate", ["pages", "asis"], function() {
    return pipeline(
        gulp.src("dist/**/*.html"),
        validator());
});

gulp.task("compress", ["build"], function() {
    return pipeline(
        gulp.src("dist/**/*.{html,js,css}"),
        $.gzip(),
        gulp.dest("dist"));
});

gulp.task("validate-examples", ["cjsmod"], function() {
    return pipeline(
        gulp.src("CindyJS/examples/**/*.html"),
        validator());
});

gulp.task("relative", ["build"], function() {
    return pipeline(
        gulp.src("dist/**"),
        $.if(function(file) {
                return file.path.endsWith(".html")
            },
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
    return pipeline(
        gulp.src(PATHS.assets),
        gulp.dest('dist/assets'));
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

    return pipeline(
        gulp.src('src/assets/scss/app.scss'),
        $.sourcemaps.init(),
        $.sass({
            includePaths: PATHS.sass
        }).on('error', $.sass.logError),
        $.autoprefixer({
            browsers: COMPATIBILITY
        }),
        //.pipe(uncss),
        minifycss,
        $.if(!isProduction, $.sourcemaps.write()),
        gulp.dest('dist/assets/css'));
});

// Combine JavaScript into one file
// In production, the file is minified
gulp.task('javascript', function() {
    var uglify = $.if(isProduction, $.uglify()
        .on('error', function(e) {
            console.log(e);
        }));

    return pipeline(
        gulp.src(PATHS.javascript),
        $.sourcemaps.init(),
        $.concat('app.js'),
        uglify,
        $.if(!isProduction, $.sourcemaps.write()),
        gulp.dest('dist/assets/js'));
});

// Copy images to the "dist" folder
// In production, the images are compressed
gulp.task('images', function() {
    var imagemin = $.if(isProduction, $.imagemin({
        progressive: true
    }));

    return pipeline(
        merge(
            gulp.src('src/assets/img/**/*', {
                base: "src"
            }),
            gulp.src(["ref/img/**"], {
                cwd: "CindyJS",
                base: "CindyJS"
            })
        ),
        imagemin,
        gulp.dest("dist"));
});

// Build the "dist" folder by running all of the named tasks
gulp.task('build', ['pages', 'sass', 'javascript', 'images', 'copy', 'asis']);

// Clean the "dist" folder before recreating its contents
gulp.task('rebuild', function(done) {
    sequence('clean', 'build', done);
});

// Make things ready for release
gulp.task('distgoal', ['validate', 'compress']);

gulp.task('dist', function(done) {
    sequence('clean', 'distgoal', done);
});

// Start a server with LiveReload to preview the site in
gulp.task('server', ['rebuild'], function() {
    browser.init({
        server: 'dist',
        port: PORT,
        notify: false,
        ghostMode: false,
        rewriteRules: [{
            match: /(['"])(\/dist\/)/g,
            replace: "$1http://cindyjs.org$2"
        }],
    });
});

// Build the site, run the server, and watch for file changes
gulp.task('default', ['rebuild', 'server'], function() {
    gulp.watch(PATHS.assets, ['copy', browser.reload]);
    gulp.watch(['src/pages/**/*.{html,md}'], ['pages', browser.reload]);
    gulp.watch(['src/{layouts,partials}/**/*.html'], ['pages', browser.reload]);
    gulp.watch(['src/gallery/**/*'], ['pages', browser.reload]);
    gulp.watch(['src/assets/scss/**/*.scss'], ['sass', browser.reload]);
    gulp.watch(['src/assets/js/**/*.js'], ['javascript', browser.reload]);
    gulp.watch(['src/assets/img/**/*'], ['images', browser.reload]);
    gulp.watch(['src/asis/**/*'], ['asis', browser.reload]);

});