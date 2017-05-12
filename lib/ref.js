"use strict";

var path = require("path");
var stream = require("stream");
var vinyl = require("vinyl");

var reTitle = /^#[^#].*$/m;

module.exports = function() {
    var md2html = require("../CindyJS/ref/js/md2html");
    var pipeline = new md2html.InMemoryPipeline();
    var someFile = null;

    var strm = new stream.Transform({
        objectMode: true,
        transform: function(file, enc, cb) {
            someFile = file;
            var md = file.contents.toString();
            var title = reTitle.exec(md);
            if (title) {
                md = md.substr(0, title.index) +
                    md.substr(title.index + title[0].length);
                title = title[0].substr(1).trim();
            }
            file.path = file.path.replace(/\.[^.]+$/, ".html");
            pipeline.addPage(path.basename(file.path), md, {
                title: title,
                file: file
            });
            cb();
        },
        flush: function(cb) {
            pipeline.done().then(function() {
                cb(null);
            }, function(err) {
                cb(err);
            });
        }
    });

    pipeline.pageRendered = function(page) {
        var extra = page.extra;
        var contents = Buffer.from(page.html);
        var file;
        if (extra) {
            // A file created from input
            file = extra.file;
            file.contents = contents;
            file.data = file.data || {};
            if (extra.title)
                file.data.title = extra.title;
        } else {
            // A file created in the process, e.g. alphabetical index
            file = new vinyl({
                contents: contents,
                cwd: someFile.cwd,
                base: someFile.base,
                path: path.join(path.dirname(someFile.path), page.name),
            });
        };
        strm.push(file);
    };

    return strm;
}
