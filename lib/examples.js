"use strict";

var through = require("through2");

module.exports = function() {
    return through.obj(function(file, enc, cb) {
        try {
            formatExample(file);
            cb(null, file);
        } catch (err) {
            cb(err);
        }
    });
};

function formatExample(file) {
    var contents = file.contents.toString();
    contents = contents.replace(
        /(\.\.\/)+build\/js\//g,
        "/dist/latest/");
    var data = file.data = file.data || {};
    var body = /<body[^>]*>([^]*)<\/body>/.exec(contents);
    if (!body) throw Error("No body tag found in " . file.relative);
    contents = contents.substr(0, body.index) +
        contents.substr(body.index + body[0].length);
    body = body[1];
    var scripts = data.scripts = [];
    var match;
    var re = /<script[^]*?<\/script>/g;
    while ((match = re.exec(contents))) {
        scripts.push(match[0]);
    }

    var title;
    title = /<h1[^>]*>([^]*?)<\/h1>/.exec(body);
    if (title) {
        body = body.substr(0, title.index) +
            body.substr(title.index + title[0].length);
        title = title[1];
    } else {
        title = /<title[^>]*>([^]*?)<\/title>/.exec(contents);
        if (title) {
            title = title[1];
        } else {
            title = "CindyJS example";
        }
    }
    title = title.replace(/CindyJS: /, "");
    data.title = title;

    file.contents = new Buffer(body);
}
