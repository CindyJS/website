"use strict";

var collect = require("gulp-collect");
var fs = require("fs");
var path = require("path");
var handlebars = require("handlebars");
var vinyl = require("vinyl");
var xtend = require("xtend");

module.exports = function(directory, template, data) {
    template = handlebars.compile(fs.readFileSync(template, "utf-8"));
    return collect.list(function(files) {
        files.sort(function(a, b) {
            if (a.relative < b.relative) return -1;
            if (a.relative > b.relative) return +1;
            return 0;
        });
        data = data || {};
        data.files = files.map(function(file) {
            return xtend({}, file.data || {}, {
                href: path.relative("/" + directory + "/", "/" + file.relative),
                basename: path.basename(file.relative, ".html"),
            });
        });
        var body = template(data);
        var index = new vinyl({
            contents: new Buffer(body),
            cwd: files[0].cwd,
            base: files[0].base,
            path: path.join(files[0].base, directory, "index.html"),
        });
        index.data = data;
        files.unshift(index);
        return files;
    });
}
