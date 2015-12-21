"use strict";

var data = require("gulp-data");
var xtend = require("xtend");

module.exports = function(newData) {
    return data(function(file) {
        return xtend(newData, file.data);
    });
}
