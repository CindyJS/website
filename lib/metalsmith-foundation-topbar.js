"use strict";

var path = require("path");
var Handlebars = require("handlebars");

module.exports = plugin;

function plugin(opts) {
  return function(files, metalsmith, done) {
    for (var fileName in files) {
      var file = files[fileName];
      if (!file.topMenu) continue;
      var lines = [];
      file.topMenu.submenu.forEach(function(item) {
        recurse(1, item, fileName, "");
      });
      file.topBarMenu = new Handlebars.SafeString(lines.join("\n"));
    }
    done();

    function recurse(depth, item, current, indent) {
      var active = '';
      if (item.path === current)
        active = ' class="active"';
      var label = Handlebars.Utils.escapeExpression(item.title);
      if (!item.submenu) {
        var href = path.relative(path.dirname(current), item.path)
          .replace(/\/index\.html$/, "/").replace(/^index\.html$/, "./");
        href = Handlebars.Utils.escapeExpression(href);
        lines.push(indent + '<li' + active + '><a href="' + href + '">' +
                   label + '</a></li>');
      } else {
        lines.push(indent + '<li class="has-dropdown"><a href="#">' +
                   label + "</a>");
        lines.push(indent + '<ul class="dropdown">');
        item.submenu.forEach(function(sub) {
          recurse(depth + 1, sub, current, indent + "  ");
        });
        lines.push(indent + '</ul>');
      }
    }
  }
}
