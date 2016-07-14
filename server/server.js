'use strict';

const express = require('express');
const path = require("path");

const app = express();

app.use("/", express.static(path.join(__dirname, "../app/dist")));
app.use("/lib", express.static(path.join(__dirname, "../bower_components")));

app.listen(3001, () => {
    console.log('dev app listening on port 3000!');
});