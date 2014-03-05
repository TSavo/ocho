'use strict';
var Promise = require('bluebird');
var bcrypt = Promise.promisifyAll(require('bcrypt'));
var datastore = require('../config/datastore');

var saltsize = 12;

exports.users = function(req, res) {
  // debugger;
  datastore
  .getUsers()
  .then(function(model) {
    return res.json(model);
  });
}

exports.createUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  genSalt(saltsize).then(function (salt) {
    return bcrypt.hashAsync(password, salt);
  }).then(function (ha) {
    return datastore.createUser(username, ha).then(function (model) {
      return res.json(model);
    });
  });
}

exports.deleteUser = function(req, res) {
  console.log(req.params.id);
  var id = parseInt(req.params.id);

  return datastore.deleteUser(id).then(function (model) {
    return res.json(model);
  });
}

