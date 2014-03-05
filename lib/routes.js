'use strict';

var api = require('./controllers/api'),
    index = require('./controllers'),
    symbols = require('./controllers/symbols'),
    users = require('./controllers/users'),
    passport = require('passport');


/**
 * Application routes
 */
module.exports = function(app) {

  // Server API Routes
  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });
  app.post('/login',
    passport.authenticate('local', { successRedirect: '/',
                                     failureRedirect: '/loginfailed',
                                     failureFlash: true })
  );
  // app.get('/api/users',
  //   passport.authenticate('basic', { session: true }),
  //   api.users);

  app.get('/api/currentUser', function (req, res) {

    var obj = {};

    obj.username = req.user;
    obj.id = req.session.passport.user;

    res.send(obj);
  });

  app.get('/api/users', users.users);
  app.post('/api/users', users.createUser);
  app['delete']('/api/users/:id', users.deleteUser);
  app.get('/api/balances', api.balances);
  app.get('/api/depositaddresses', api.depositaddresses);
  app.post('/api/orders/buy', api.buy);
  app.post('/api/orders/sell', api.sell);
  app.get('/api/orders/buy', api.getBuyOrders);
  app.get('/api/orders/sell', api.getSellOrders);
  app['delete']('/api/orders/buy/:id', api.deleteBuyOrder);
  app['delete']('/api/orders/sell/:id', api.deleteSellOrder);

  app.get('/loginfailed', function(req,res) {
    res.sendfile('app/views/loginfailed.html');
  });

  // Coins
  app.get('/api/coins/btc/difficulty', api.btc.getDifficulty);

  // Symbols
  app.get('/api/symbols/coins', symbols.coins);
  app.get('/api/symbols/coinnames', symbols.coinnames);
  app.get('/api/symbols/allowedtrades', symbols.allowedtrades);


  // All other routes to use Angular routing in app/scripts/app.js
  app.get('/partials/*', index.partials);
  app.get('/*', index.index);


};
