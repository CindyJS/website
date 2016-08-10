"use strict";

var chalk = require("chalk");
var cp = require("child_process");
var path = require("path");
var q = require("q");
var qfs = require("q-io/fs");
var WholeLineStream = require("./WholeLineStream");

module.exports.exec = exec;

function exec(pfx, args, opts) {
    pfx = chalk.blue("[" + pfx + "] ");
    opts = Object.assign({
        env: Object.assign({}, process.env, opts.extraEnv || {}, {
            PATH: path.resolve("node_modules/.bin") + ":" + process.env.PATH,
        }),
    }, opts);
    return q.Promise(function(resolve, reject) {
        var child = cp.spawn(args[0], args.slice(1), opts);
        child.stdout.pipe(new WholeLineStream(pfx)).pipe(process.stdout);
        child.stderr.pipe(new WholeLineStream(pfx)).pipe(process.stderr);
        child.on("exit", function(code, signal) {
            if (code === 0)
                resolve();
            else if (code === null)
                reject(new Error("Command '" + args.join("' '") +
                    "' exited with signal " + signal));
            else
                reject(new Error("Command '" + args.join("' '") +
                    "' exited with code " + code));
        });
    });
}

module.exports.unlessExists = function(path, args, opts) {
    return qfs.stat(path).then(function(stat) {
        return true;
    }, function(err) {
        if (err.code !== "ENOENT")
            throw err;
        return exec(args[0], args, opts).thenResolve(false);
    });
};