"use strict";

require("harmonize")(["harmony-generators"])

var path = require("path");
var Metalsmith = require("metalsmith");
var layouts = require("metalsmith-layouts");
var markdown = require("metalsmith-markdown");
var nuv = require("./lib/metalsmith-validator-nu");

if (require.main === module)
  process.nextTick(main);

function main() {
  build(nuv);
}

function build(nuv) {
  Metalsmith(__dirname)
    .use(markdown())
    .use(layouts({
      engine: "handlebars",
      default: "main.html"
    }))
    .use(nuv())
    .build(function(err) {
      if (err) throw err;
    });
}

module.exports.main = main;
module.exports.build = build;
