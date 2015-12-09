"use strict";

var collect = require("gulp-collect");
var path = require("path");
var xtend = require("xtend");

module.exports = function(menusStream) {
    var menusPromise = new Promise(function (resolve, reject) {
        menusStream.on("error", reject).pipe(collect.dict(function(menuFiles) {
            resolve(menuFiles);
            return [];
        }));
    });
    return collect.dict(function(files) {
        return menusPromise.then(function(menus) {
            return handler(files, menus);
        });
    });
};

function MenuItem() {
}

function MenuButton(title, path) {
    this.title = title;
    this.path = path;
}
MenuButton.prototype = new MenuItem();
MenuButton.prototype.visit = function(visitor) {
    return visitor.button(this, this.title, this.path);
};

function MenuSub(title) {
    this.title = title;
    this.menu = [];
}
MenuSub.prototype = new MenuItem();
MenuSub.prototype.visit = function(visitor) {
    return visitor.menu(this, this.title, this.menu);
};
MenuSub.prototype.visitChildren = function(visitor) {
    this.menu.forEach(function(child) {
        child.visit(visitor);
    });
};

function MenuSep() {
}
MenuSep.prototype = new MenuItem();
MenuSep.prototype.visit = function(visitor) {
    return visitor.sep(this);
};

function MenuLabel(title) {
    this.title = title;
}
MenuLabel.prototype = new MenuItem();
MenuLabel.prototype.visit = function(visitor) {
    return visitor.label(this, this.title);
};

function handler(files, menus) {
    var top = recurse("main.menu");
    for (var fileName in files)
        files[fileName].data.topMenu = top;
    return files;

    function recurse(name) {
        var item, file;
        var menuFile = name + ".menu";
        menuFile = menuFile.replace(/\.menu\.menu$/, ".menu");
        if (menuFile in menus) {
            file = menus[menuFile];
            item = new MenuSub(file.data.title);
            item.data = file.data;
            var sublist = file.contents.toString().split("\n");
            sublist.forEach(function(sub) {
                if (sub === "") return;
                sub = path.normalize(path.join(path.dirname(menuFile), sub));
                item.menu.push(recurse(sub));
            });
            return item;
        }
        var htmlFile = name + ".html";
        if (name.substr(name.length - 1) === "/")
            htmlFile = name + "index.html";
        if (!(htmlFile in files))
            throw new Error("'" + name + "' not found for menu");
        file = files[htmlFile];
        var title = file.data.menuitem;
        if (typeof title === "object")
            title = title.title;
        if (!title)
            title = file.data.title;
        item = new MenuButton(title, htmlFile);
        item.data = xtend({}, file.data);
        xtend(item, file.data.menuitem || {});
        return item;
    }
}
