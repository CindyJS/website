"use strict";

var http = require("http");
var url = require("url");
var express = require("express");
var app = express();
var isGulp = process.argv[2] === "--gulp";

app.use(express.static("build"));

var port = 0;
var host = "127.0.0.1";
var server = http.createServer(app);
server.listen(port, host);

if (isGulp) {
    server.on("listening", function() {
        var a = server.address();
        process.send({
            host: a.address,
            port: a.port,
            url: url.format({
                protocol: "http",
                hostname: a.address,
                port: a.port,
                pathname: "/",
            }),
        });
    });
}
