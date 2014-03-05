'use strict';
var Promise = require('bluebird');
var btc = require('../coins/btc')
var errors = require('../errors');

var datastore = require('../config/datastore');

exports.btc = {};
exports.btc.getDifficulty = function (req, res) {
  btc.getDifficultyAsync().then(function (diff) {
    res.json(diff);
  });
}

exports.deleteBuyOrder = function(req, res) {
  var id = parseInt(req.params.id);

  datastore.deleteBuyOrder(id).then(function (model) {
    res.json(model);
  });
}

exports.deleteSellOrder = function(req, res) {
  var id = parseInt(req.params.id);

  datastore.deleteSellOrder(id).then(function (model) {
    res.json(model);
  });
}

exports.getBuyOrders = function(req, res) {
  var user_id = req.session.passport.user;

  datastore.getBuyOrders(user_id).then(function (model) {
    res.json(model);
  })
}

exports.getSellOrders = function(req, res) {
  var user_id = req.session.passport.user;

  datastore.getSellOrders(user_id).then(function (model) {
    res.json(model);
  })
}

exports.balances = function(req, res) {
  var userid = req.session.passport.user;

  datastore.getBalances(userid).then(function (model) {
    res.json(model);
  })
  .catch(function(err) {
    res.json(500, err);
  })
}

exports.depositaddresses = function(req, res) {
  var userid = req.session.passport.user;

  var coinsymbol = req.params.symbol;

  datastore
  .getDepositAddress(userid, coinsymbol)
  .then(function(model) {
    res.json(model);
  })
  .catch(function (err) {
    res.json(500, { error: err } );
  });
}


exports.buy = function (req, res) {
  // var order = JSON.parse(req);
  var userid = req.session.passport.user;
  var order = req.body;

  console.log(order);
  datastore
  .buy(userid, order.buysymbol, order.quantity, order.price, order.sellsymbol )
  .then(function (complete) {
    return res.json(complete);
  })
  .catch(errors.ClientError, function (err) {
    console.log('client err ' + JSON.stringify(err));
    return res.json(400, err );
  })
  .catch(function (err) {
    console.log('api err ' + JSON.stringify(err));
    return res.json(500, err );
  })

}


exports.sell = function (req, res) {
  // var order = JSON.parse(req);
  var userid = req.session.passport.user;
  var order = req.body;

  console.log(order);
  datastore
  .sell(userid, order.buysymbol, order.quantity, order.price, order.sellsymbol )
  .then(function (complete) {
      res.json(complete);
  })
  .catch(errors.ClientError, function (err) {
    console.log('client err ' + JSON.stringify(err));
    return res.json(400, err );
  })
  .catch(function (err) {
    console.log('api err ' + JSON.stringify(err));
    return res.json(500, err );
  })
}


