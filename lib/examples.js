"use strict";

var through = require("through2");
var fs = require("fs");
var path = require("path");
var handlebars = require("handlebars");
var marked = require('marked');

module.exports = function() {
    return through.obj(function(file, enc, cb) {
        try {
            formatExample(file);
            cb(null, file);
        } catch (err) {
            cb(err);
        }
    });
};


function formatExample(file) {
  let ext = path.extname(file.relative);
  if(ext == '.html' || ext == '.htm') {
    var contents = file.contents.toString();
    file.data = file.data || {};
    file.data.title = getTitle(contents);
    file.contents = new Buffer(formatHTML(contents, file));
  }  else if(ext =='.json') {
    var config = JSON.parse(file.contents.toString());

    var widget = fs.readFileSync(file.base + '/' + path.dirname(file.relative) + '/' + config.widget).toString();

    file.data = file.data || {};
    file.data.title = config['title-en'] || config['title'] || getTitle(widget);

    if(path.extname(config.widget) == '.html') widget = formatHTML(widget, file);
    else if(path.extname(config.widget) == '.md') widget = marked(widget);

    var description = fs.readFileSync(file.base + '/' + path.dirname(file.relative) + '/' + config.en).toString(); //TODO: other languages
    if(path.extname(config.en) == '.html') description = formatHTML(description, file);
    else if(path.extname(config.en) == '.md') description = marked(description);

    var template = handlebars.compile(fs.readFileSync("src/layouts/example.html", "utf-8"));
    var body = template({
      widget: widget,
      description: description
    });


    //repleace .json with .html
    var chunks = file.path.split('.');
    chunks[chunks.length-1] = 'html';
    file.path = chunks.join('.');

    file.thumbnail =  '/' + path.dirname(file.relative) + '/' + config.thumbnail;
    file.contents = new Buffer(body);
  }
}

function getTitle(contents) {
  var title;
  title = /<h1[^>]*>([^]*?)<\/h1>/.exec(contents);
  if (title) {
      title = title[1];
  } else {
      title = /<title[^>]*>([^]*?)<\/title>/.exec(contents);
      if (title) {
          title = title[1];
      } else {
          title = "CindyJS example";
      }
  }
  title = title.replace(/CindyJS: /, "");
  return title;
}

function formatHTML(contents, file) {
    contents = contents.replace(
        /(\.\.\/)+build\/js\//g,
        "/dist/latest/");
    var data = file.data = file.data || {};
    var body = /<body[^>]*>([^]*)<\/body>/.exec(contents);
    if (!body) throw Error("No body tag found in "+file.relative);
    contents = contents.substr(0, body.index) +
        contents.substr(body.index + body[0].length);
    body = body[1];
    var scripts = data.scripts = [];
    var match;
    var re = /<script[^]*?<\/script>/g;
    while ((match = re.exec(contents))) {
        scripts.push(match[0]);
    }

    var title; //remove title
    title = /<h1[^>]*>([^]*?)<\/h1>/.exec(body);
    if (title) {
      body = body.substr(0, title.index) +
      body.substr(title.index + title[0].length);
    }

    return body;
}
