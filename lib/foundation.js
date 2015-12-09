"use strict";

var chalk = require("chalk");
var child_process = require("child_process");
var Download = require("download");
var glob = require("glob");
var path = require("path");
var q = require("q");
var qfs = require("q-io/fs");
var touch = require("touch");

var WholeLineStream = require("./WholeLineStream");

var jrubyVersion = "9.0.1.0";

function unlessExists(path, command, args) {
    return qfs.exists(path)
        .then(function(doesExist) {
            if (doesExist) return;
            return command.apply(null, args || []);
        });
}

function download(check, url, dest, opts, rename) {
    return unlessExists(check, function() {
        console.log(chalk.blue("[downld] ") + chalk.yellow("Downloading " + url));
        var d = new Download(opts || {extract:true})
            .get(url, dest || "download");
        if (rename)
            d = d.rename(rename);
        return q.ninvoke(d, "run");
    });
}

function withStamp(stampFile, sources, command) {
    return q.all([
        qfs.stat(stampFile).then(function(stat) {
            return stat.lastModified();
        }, function(err) {
            if (err.code !== "ENOENT")
                throw err;
            return null;
        }),
        q.nfcall(glob, sources).then(function(files) {
            return q.all(files.map(qfs.stat.bind(qfs)));
        })
    ]).spread(function(stampTime, sourceStats) {
        if (stampTime === null) return false;
        stampTime = stampTime.getTime();
        for (var i = 0; i < sourceStats.length; ++i)
            if (sourceStats[i].lastModified().getTime() > stampTime)
                return false;
        return true;
    }).then(function(upToDate) {
        if (upToDate) return null;
        return command().then(function() {
            return q.nfcall(touch, stampFile);
        });
    });
}

function rubyExec(prefix, cmd, opts) {
    var env = {}, key;
    for (key in process.env)
        env[key] = process.env[key];
    "RUBY_ROOT RUBY_ENGINE RUBY_VERSION RUBYOPT GEM_HOME GEM_ROOT GEM_PATH"
        .split(" ").forEach(function(key) {
            delete env[key];
        });
    env.PATH = path.resolve("download/jruby-" + jrubyVersion + "/bin") +
        ":" + path.resolve("node_modules") + ":" + env.PATH;
    var deferred = q.defer();
    var combined = {
        env: env,
        stdio: ["ignore", "pipe", "pipe"]
    };
    if (opts)
        for (key in opts)
            combined[key] = opts[key];
    var child = child_process.spawn(cmd[0], cmd.slice(1), combined);
    var pfx = new Buffer(chalk.blue(prefix));
    child.stdout.pipe(new WholeLineStream(pfx)).pipe(process.stdout);
    child.stderr.pipe(new WholeLineStream(pfx)).pipe(process.stderr);
    child.on("exit", function(code, signal) {
        if (code === 0)
            deferred.resolve();
        else if (code === null)
            deferred.reject(new Error("Command '" + cmd.join("' '") +
                                      "' exited with signal " + signal));
        else
            deferred.reject(new Error("Command '" + cmd.join("' '") +
                                      "' exited with code " + code));
    });
    return deferred.promise;
}

function installGem(name, version) {
    return unlessExists(
        "download/jruby-" + jrubyVersion + "/lib/ruby/gems/shared/gems/" +
            name + "-" + version,
        function() {
            console.log(chalk.blue("[gem   ] ") +
                        chalk.yellow("Installing gem " + name + "-" + version));
            return rubyExec("[gem   ] ", [
                "gem", "install", name, "--version", version]);
        });
}

function getJRuby() {
    return download(
        "download/jruby-" + jrubyVersion + "/bin/gem",
        "https://s3.amazonaws.com/jruby.org/downloads/" +
            jrubyVersion + "/jruby-bin-" + jrubyVersion + ".tar.gz");
}

function gems() {
    return installGem("bundler", "1.10.6");
}

function bundleInstall() {
    return withStamp(
        "foundation/bundle.stamp",
        "foundation/Gemfile{,.lock}",
        function() {
            return rubyExec("[bundle] ", ["bundle", "install"],
                            {cwd: "foundation"});
        });
}

function bowerInstall() {
    return withStamp(
        "foundation/bower.stamp",
        "foundation/bower.json",
        function() {
            return rubyExec("[bower ] ", ["bower", "install"],
                            {cwd: "foundation"});
        });
}

module.exports.getFoundation = function() {
    return q.all([
        qfs.makeTree("download")
            .then(getJRuby)
            .then(gems)
            .then(bundleInstall),
        bowerInstall()
    ]);
};

module.exports.buildStyle = function() {
    return withStamp(
        "foundation/compass.stamp",
        "foundation/{scss/**,*.stamp}",
        function() {
            return rubyExec(
                "[compas] ", ["bundle", "exec", "compass", "compile"],
                {cwd: "foundation"});
        });
};
