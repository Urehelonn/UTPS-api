"use strict";
var _ = require('lodash');

exports.sendResponse = function (res, code, object) {
    res.writeHead(code, { "Content-Type": "application/json" });
    return res.end(JSON.stringify(object));
};