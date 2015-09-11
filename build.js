"use strict";

// Build the CindyJS web page

var chalk = require("chalk");
var child_process = require("child_process");
var Download = require("download");
var path = require("path");
var Q = require("q");
var qfs = require("q-io/fs");

var WholeLineStream = require("./lib/WholeLineStream");

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
    return Q.ninvoke(d, "run");
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
    ":" + env.PATH;
  var deferred = Q.defer();
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

process.nextTick(main);

function main() {
  qfs.makeTree("download")
    .then(getJRuby)
    .then(gems)
    .then(bundleInstall)
    .done();
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
  return rubyExec("[bundle] ", ["bundle", "install"], {cwd: "foundation"});
}
