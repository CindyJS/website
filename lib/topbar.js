"use strict";

var path = require("path");
var handlebars = require("handlebars");
var through = require("through2");

module.exports = function() {
    return through.obj(function(file, enc, cb) {
        try {
            if (file.data.topMenu) {
                new FormatMenu(file, file.data.topMenu);
            }
            cb(null, file);
        } catch (err) {
            cb(err);
        }
    });
};

function FormatMenu(file, menu) {
    this.file = file;
    this.path = file.relative;
    this.lines = [];
    this.indent = '';
    menu.visitChildren(this);
    file.data.topBarMenu = new handlebars.SafeString(this.lines.join('\n'));
}

FormatMenu.prototype.button = function(item, title, dstpath) {
    var active = '';
    if (this.path === dstpath)
        active = ' class="active"';
    var label = handlebars.Utils.escapeExpression(title);
    var href = path.relative(path.dirname(this.path), dstpath)
        .replace(/\/index\.html$/, '/').replace(/^index\.html$/, './');
    href = handlebars.Utils.escapeExpression(href);
    this.lines.push(this.indent + '<li' + active + '><a href="' + href + '">' +
                    label + '</a></li>');
};

FormatMenu.prototype.menu = function(item, title) {
    var label = handlebars.Utils.escapeExpression(title);
    var indent = this.indent;
    this.lines.push(indent + '<li class="has-dropdown"><a href="#">' +
                    label + "</a>");
    this.lines.push(indent + '<ul class="dropdown">');
    this.indent = indent + '  ';
    item.visitChildren(this);
    this.indent = indent;
    this.lines.push(indent + '</ul>');
};
