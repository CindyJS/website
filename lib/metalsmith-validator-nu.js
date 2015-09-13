"use strict";

var chalk = require("chalk");
var Q = require("q");
var Vnu = require("validator-nu").Vnu;

module.exports = plugin;

function plural(n) {
  return n === 1 ? "" : "s";
}

function dispatch(msg) {
  if (msg.type === "info") {
    if (msg.subtype === "warning")
      this.warning(msg);
    else
      this.info(msg);
  } else {
    if (msg.subtype === "fatal")
      this.fatal(msg);
    else
      this.error(msg);
  }
}

function plugin(opts) {
  return function(files, metalsmith, done) {
    var server = start();
    server(opts)(files, metalsmith, function(err) {
      server.stop().finally(function() { done(err); });
    });
  }
}

function start() {
  var server = new Vnu();
  var openPromise = server.open();
  var makeInstance = function(opts) {
    return function(files, metalsmith, done) {
      openPromise.then(function() {
        return validate(server, opts, files, metalsmith, done);
      }).done();
    }
  };
  makeInstance.stop = function() {
    return server.close();
  };
  return makeInstance;
}

plugin.start = start;

function validate(server, opts, files, metalsmith, done) {
  if (!opts) opts = {};
  var log = opts.log || console.log.bind(console);
  var verbosity = typeof opts.verbosity === "number" ? opts.verbosity : 3;
  var trigger = typeof opts.trigger === "number" ? opts.trigger : verbosity;
  var strict = opts.strict !== false;
  var errCnt = 0, warnCnt = 0;
  
  return Q.all(Object.keys(files).map(function(filename) {
    return server.validate(files[filename].contents)
      .then(function(result) {
        if (!result.length) return;
        var willPrint = false
        result.forEach(dispatch, {
          info:    function() {
            if (trigger >= 4) willPrint = true;
          },
          warning: function() {
            ++warnCnt;
            if (trigger >= 3) willPrint = true;
          },
          error:   function() {
            ++errCnt;
            if (trigger >= 2) willPrint = true;
          },
          fatal:   function() {
            ++errCnt;
            if (trigger >= 1) willPrint = true;
          }
        });
        if (!willPrint) return;
        log(chalk.magenta(filename));
        result.forEach(function(msg) {
          var msgStyle, extractStyle, doPrint = false;
          dispatch.call({
            info: function() {
              msgStyle = chalk.cyan;
              extractStyle = chalk.underline.cyan;
              doPrint = (verbosity >= 4);
            },
            warning: function() {
              msgStyle = chalk.yellow.bold;
              extractStyle = chalk.underline.yellow;
              doPrint = (verbosity >= 3);
            },
            error: function() {
              msgStyle = chalk.red.bold;
              extractStyle = chalk.underline.red;
              doPrint = (verbosity >= 2);
            },
            fatal: function() {
              msgStyle = chalk.white.bold.bgRed;
              extractStyle = chalk.underline.red;
              doPrint = (verbosity >= 1);
            }
          }, msg);
          if (!doPrint) return;
          log(msgStyle(msg.message));
          if (msg.extract) {
            var mid = msg.extract, pre = "  ", post = "";
            if (typeof msg.hiliteStart === "number" &&
                typeof msg.hiliteLength === "number") {
              pre += mid.substr(0, msg.hiliteStart);
              post = mid.substr(msg.hiliteStart + msg.hiliteLength);
              mid = mid.substr(msg.hiliteStart, msg.hiliteLength);
              log(pre + extractStyle(mid) + post);
            }
          } // if msg.extract
        }); // result.forEach
      }); // then(function(result)
  })).then(function success() {
    if (errCnt || (strict && warnCnt))
      done(new Error(errCnt + " validation error" + plural(errCnt) +
                     ", " + warnCnt + " warning" + plural(warnCnt)));
    else
      done();
  }, function failed(err) {
    done(err);
  });
}
