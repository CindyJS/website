"use strict";

var express = require("express");
var app = express();

app.use(express.static("build"));
app.use(express.static("foundation"));

app.listen(44849);
