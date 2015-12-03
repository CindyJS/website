"use strict";

var path = require("path");

module.exports = plugin;

function plugin(opts) {
  return function(files, metalsmith, done) {
    var menus = [];
    var top = recurse("main.menu");
    menus.forEach(function(key) {
      delete files[key];
    });
    for (var fileName in files)
      files[fileName].topMenu = top;    
    done();

    function recurse(name) {
      var item;
      var menuFile = name + ".menu";
      menuFile = menuFile.replace(/\.menu\.menu$/, ".menu");
      if (menuFile in files) {
        menus.push(menuFile);
        item = files[menuFile];
        var sublist = item.contents.toString().split("\n");
        var submenu = [];
        sublist.forEach(function(sub) {
          if (sub === "") return;
          sub = path.normalize(path.join(path.dirname(menuFile), sub));
          submenu.push(recurse(sub));
        });
        item.submenu = submenu;
        return item;
      }
      var htmlFile = name + ".html";
      if (name.substr(name.length - 1) === "/")
        htmlFile = name + "index.html";
      if (!(htmlFile in files))
        throw new Error("'" + name + "' not found for menu");
      var file = files[htmlFile];
      var menuitem = file.menuitem;
      if (typeof menuitem === "string")
        menuitem = {title: menuitem};
      if (!menuitem)
        menuitem = {};
      if (!menuitem.title)
        menuitem.title = file.title;
      menuitem.path = htmlFile;
      return menuitem;
    }
  }
}
