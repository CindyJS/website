"use strict";

var express = require("express");
var app = express();

app.use(express.static("build"));
app.use(express.static("foundation"));
app.use("/images", express.static("images"));

console.log("http://localhost:44849/");
app.listen(44849);
