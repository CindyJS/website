"use strict";

var gutil = require("gulp-util");
var through = require("through2");
var htmlparser = require("htmlparser2");
var xtend = require("xtend");

module.exports = function(opts) {
    return through.obj(function(file, enc, cb) {
        if (file.data.toc === true) {
            try {
                file.data.toc = buildToc(file);
            } catch (err) {
                file.data.toc = null;
                return cb(err);
            }
        }
        cb(null, file);
    });
};

function Section(level, id, text) {
    this.level = level;
    this.id = id;
    this.text = text;
    this.children = [];
}

Section.prototype.nested = function(depth) {
    var res = '<li><a href="#' + escape(this.id) + '">' +
        escape(this.text) + '</a>'
    if (depth > 1 && this.children.length !== 0) {
        res += '<ul class="nested vertical menu">\n'
        for (var i = 0; i < this.children.length; ++i)
            res += this.children[i].nested(depth - 1);
        res += '</ul>';
    }
    res += '</li>\n'
    return res;
}

function buildToc(file) {
    var toc = [];
    var headline = null;
    var id = null;
    function err(msg, opts) {
        return Object.assign(
            new gutil.PluginError("toc", msg),
            { fileName: file.relative },
            opts);
    }
    var parser = new htmlparser.Parser({
        onopentag: function(name, attribs) {
            if (/^h[1-9]$/.test(name) && "id" in attribs) {
                headline = "";
                id = attribs.id;
            }
        },
        ontext: function(text) {
            headline += text;
        },
        onclosetag: function(name, attribs) {
            if (headline && /^h[1-9]$/.test(name)) {
                toc.push(new Section(+name.substr(1), id, headline));
                headline = null;
                id = null;
            }
        },
    }, {decodeEntities: true});
    parser.end(file.contents);

    if (toc.length === 0)
        // throw err("no toc found");
        return null;
    var stack = [new Section(0)];
    for (var i = 0; i < toc.length; ++i) {
        var elt = toc[i];
        while (stack[0].level >= elt.level)
            stack.shift();
        stack[0].children.push(elt);
        stack.unshift(elt);
    }
    toc = stack[stack.length - 1];
    while (toc.children.length === 1)
        toc = toc.children[0];
    return toc.children.map(function(elt) { return elt.nested(3); }).join('');
}

function escape(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
    ;
}
