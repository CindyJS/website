"use strict";

const $ = require("gulp-load-plugins")();
const argv = require("yargs").argv;
const browser = require("browser-sync");
const gulp = require("gulp");
const handlebars = require("handlebars");
const hbs = require("gulp-hbs");
const merge = require("merge-stream");
const open = require("open");
const path = require("path");
const rimraf = require("rimraf");
const xtend = require("xtend");
const replace = require('gulp-replace');
const addData = require("./lib/add-data");
const cmd = require("./lib/cmd");
const examples = require("./lib/examples");
const index = require("./lib/index");
const licenses = require("./lib/licenses");
const redirect = require("./lib/redirect");
const ref = require("./lib/ref");
const relativize = require("./lib/relativize");
const toc = require("./lib/toc");
const validator = require("./lib/validator-nu");
const galleryindex = require("./lib/galleryindex");
const sequence = require('gulp4-run-sequence');
const markdown = require('gulp-markdown');


// Check for --production flag
var isProduction = !!(argv.production);

// Port to use for the development server.
var PORT = 8163;

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
    src: "src/gallery/main/**/*.json",
    dest: "gallery/main",
    title: "Showcase",
    autoindex: false,
},{
    src: "src/gallery/cindygl/**/*.json",
    dest: "gallery/cindygl",
    title: "CindyGL-Gallery",
    description: "These examples demonstrate the CindyGL-Plugin",
    autoindex: true,
}, {
    cwd: "CindyJS",
    base: "CindyJS",
    src: "examples/**/*.html",
    dest: "examples",
    title: "Examples shipped with the source tree",
    description: "This shows the examples <a href='https://github.com/CindyJS/CindyJS'>from the repository</a>, demonstrating individual functions and operations. Most of them demonstrate a single technical feature and are not intended to be examples of what well-designed CindyJS widgets can look like.",
    imgpath: "/assets/img/thumbnail/",
    github: "CindyJS/CindyJS",
    autoindex: true,
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

gulp.task("cjsmod",gulp.series([], function() {
    return cmd.unlessExists("CindyJS", ["git", "submodule", "update", "--init", "CindyJS"]);
}));

gulp.task("cjsdeps", gulp.series(["cjsmod"], function() {
    return cmd.unlessExists(
        "CindyJS/node_modules", ["npm", "install"], {
            cwd: "CindyJS",
            extraEnv: {
                CINDYJS_SKIP_PREPUBLISH: "true"
            }
        });
}));


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

gulp.task('copyexampleimages', gulp.series([], function() {
    return gulp.src(["examples/**/*.png", "examples/**/*.jpg", "examples/**/*.mp4"], {
        cwd: "CindyJS",
        base: "CindyJS"
    }).pipe(gulp.dest("dist"));
}));

gulp.task("copygallerydata", gulp.series([], function() {
    return gulp.src(['src/gallery/**/*', '!src/gallery/**/*.html'], {
        base: "src"
    }).pipe(gulp.dest("dist")); //copies everything that is not a html
}));

gulp.task("editor", gulp.series([], function() {
    return gulp.src('CindyJS/editor/**/*').pipe(replace(
      /(\.\.\/)+build\/js\//g,
      "/dist/snapshot/"
    )).pipe(gulp.dest("dist/editor"));
}));

gulp.task("pages", gulp.series(["cjsdeps", "copyexampleimages", "copygallerydata", "editor"], function() {
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
                            base: gallery.base || gallery.src.split('/')[0],
                            cwd: gallery.cwd || ".",
                        }),
                        github(gallery.github || "CindyJS/website"),
                        examples(),
                        addData(gallerynavigation(gallery.dest)),
                        $.if(gallery.autoindex, index(gallery.dest, "src/layouts/gallery.html", xtend(gallery, gallerynavigation(gallery.dest)))),
                        licenses.ccbysa40()
                    )
                )
            ),
            pipeline(
                gulp.src(["src/gallery"], {
                    base: "src"
                }),
                galleryindex(Galleries, "Gallery"),
                addData(gallerynavigation("gallery")),
                licenses.ccbysa40()
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
            markdown()),
        toc(),
        hbs(gulp.src("src/layouts/**/*.html"), {
            dataSource: "data",
            defaultTemplate: "main.html",
            compile: handlebars.compile,
        }),
        gulp.dest("dist"));
}));



gulp.task("asis", gulp.series([], function() {
    return gulp.src("src/asis/**/*").pipe(gulp.dest("dist"));
}));

gulp.task("validate", gulp.series(["pages", "asis"], function() {
    return pipeline(
        gulp.src("dist/**/*.html"),
        validator());
}));

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
        $.autoprefixer(
        //    browsers: COMPATIBILITY
        ),
        //.pipe(uncss),
        minifycss,
        $.if(!isProduction, $.sourcemaps.write()),
        gulp.dest('dist/assets/css'));
});

// Combine JavaScript into one file
// In production, the file is minified
gulp.task('javascript', gulp.series([], function() {
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
}));

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

// Copy files out of the assets folder
// This task skips over the "img", "js", and "scss" folders, which are parsed separately
gulp.task('copy',gulp.series([], function() {
    return pipeline(
        gulp.src(PATHS.assets),
        gulp.dest('dist/assets'));
}));


gulp.task("redirect", gulp.series([], function() {
    return pipeline(
        gulp.src("src/redirect/*.json"),
        redirect(),
        $.concat(".htaccess"),
        gulp.dest("dist"));
}));


// Build the "dist" folder by running all of the named tasks
gulp.task('build', gulp.series(['pages', 'sass', 'javascript', 'images', 'copy', 'asis', 'redirect']));

gulp.task("compress", gulp.series(["build"], function() {
    return pipeline(
        gulp.src("dist/**/*.{html,js,css}"),
        $.gzip(),
        gulp.dest("dist"));
}));

gulp.task("validate-examples", gulp.series(["cjsmod"], function() {
    return pipeline(
        gulp.src("CindyJS/examples/**/*.html"),
        validator());
}));

gulp.task("relative", gulp.series(["build"], function() {
    return pipeline(
        gulp.src("dist/**"),
        $.if(function(file) {
                return file.path.endsWith(".html")
            },
            relativize()),
        gulp.dest("relative"));
}));

// Delete the "dist" folder
// This happens every time a build starts
gulp.task('clean',gulp.series([], function(done) {
    rimraf('dist', done);
}));


// Clean the "dist" folder before recreating its contents
gulp.task('rebuild', gulp.series([],function(done) {
    sequence('clean', 'build', done);
}));

// Make things ready for release
gulp.task('distgoal', gulp.series(['validate', 'compress']));

gulp.task('dist', gulp.series([],function(done) {
    sequence('clean', 'distgoal', done);
}));

// Start a server with LiveReload to preview the site in
gulp.task('server', gulp.series(['rebuild'], function() {
    browser.init({
        server: 'dist',
        port: PORT,
        notify: false,
        ghostMode: false,
        rewriteRules: [{
            match: /(['"])(\/(dist|soundfont|extras)\/)/g,
            replace: "$1http://cindyjs.org$2"
        }],
    });
}));

// Build the site, run the server, and watch for file changes
gulp.task('default', gulp.series(['rebuild', 'server'], function() {
    gulp.watch(PATHS.assets, ['copy', browser.reload]);
    gulp.watch(['src/pages/**/*.{html,md}'], ['pages', browser.reload]);
    gulp.watch(['src/{layouts,partials}/**/*.html'], ['pages', browser.reload]);
    gulp.watch(['src/gallery/**/*'], ['pages', browser.reload]);
    gulp.watch(['src/assets/scss/**/*.scss'], ['sass', browser.reload]);
    gulp.watch(['src/assets/js/**/*.js'], ['javascript', browser.reload]);
    gulp.watch(['src/assets/img/**/*'], ['images', browser.reload]);
    gulp.watch(['src/asis/**/*'], ['asis', browser.reload]);

}));
