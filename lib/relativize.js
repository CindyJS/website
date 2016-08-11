"use strict";

var path = require("path");
var through = require("through2");

var reAbsPath = /(\s(?:src|href)\s*=\s*["'])(\/[^\/].*?|\/)(["'?#])/g;
var reDirectory =
    /(\s(?:src|href)\s*=\s*["'][^\/"'?#]*(?:\/[^\/"'?#]+)*\/)(["'?#])/g;

module.exports = function(opts) {
    return through.obj(function(file, enc, cb) {
        var html = file.contents.toString();
        var src = path.dirname(path.resolve("/", file.relative));
        html = html.replace(reDirectory, "$1index.html$2");
        html = html.replace(reAbsPath, function(match, begin, dst, end) {
            dst = path.relative(src, dst);
            return begin + dst + end;
        });
        file.contents = Buffer(html);
        cb(null, file);
    });
};