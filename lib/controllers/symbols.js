'use strict';
var Promise = require('bluebird');

var symbols = require('../config/symbols')
var datastore = require('../config/datastore');

exports.coins = function (req, res) {
  res.json(symbols.coins);
}

exports.coinnames = function (req, res) {
  res.json(symbols.coinnames);
}

exports.allowedtrades = function (req, res) {
  res.json(symbols.allowedtrades);
}
