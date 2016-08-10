"use strict";

var path = require("path");
var through = require("through2");

var reTitle = /^#[^#].*$/m;

module.exports = function() {
    var md2html = require("../CindyJS/ref/js/md2html");

    return through.obj(function(file, enc, cb) {
        var md = file.contents.toString();
        var title = reTitle.exec(md);
        if (title) {
            md = md.substr(0, title.index) +
                md.substr(title.index + title[0].length);
            title = title[0].substr(1).trim();
        }
        md2html.renderBody(md, function(err, html) {
            if (err) return cb(err);
            file.data = file.data || {};
            if (title)
                file.data.title = title;
            file.contents = Buffer(html);
            file.path = file.path.replace(/\.[^.]+$/, ".html");
            cb(null, file);
        });
    });
}