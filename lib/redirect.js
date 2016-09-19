'use strict';

var path = require('path');
var through = require('through2');

module.exports = function(opts) {
    return through.obj(function(file, enc, cb) {
        // var status = file.stem; // not supported by our version of gulp
        var status = path.basename(file.relative, path.extname(file.relative));
        if (['permanent', 'temp', 'seeother', 'gone'].indexOf(status) === -1)
            throw Error('Unknown status: ' + status);
        var data = JSON.parse(file.contents.toString());
        var parts = [];
        for (var src in data) {
            var dst = data[src];
            parts.push('Redirect ', status, ' "', src, '" "', dst, '"\n');
        }
        file.contents = new Buffer(parts.join(''));
        cb(null, file);
    });
};
