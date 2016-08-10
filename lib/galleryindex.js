"use strict";

var collect = require("gulp-collect");
var fs = require("fs");
var path = require("path");
var handlebars = require("handlebars");
var vinyl = require("vinyl");
var xtend = require("xtend");

module.exports = function(galleries, title) {
    var template = handlebars.compile(fs.readFileSync("src/layouts/galleryindex.html", "utf-8"));
    var data = {
        folders: galleries.map(function(g) {
            return {
                href: '/' + g.dest,
                imgurl: g.dest.split('/').pop() + '.png',
                basename: g.dest.split('/').pop(),
                title: g.title
            }
        }),
        title: title
    };
    var body = template(data);

    return collect.list(function(files) {
        var index = new vinyl({
            contents: new Buffer(body),
            cwd: files[0].cwd,
            base: files[0].base,
            path: path.join(files[0].base, 'gallery', "index.html"),
        });
        index.data = data;
        files.unshift(index);
        return files;
    });
}