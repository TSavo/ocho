'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var config = require('./config');
var Promise = require('bluebird');
var errors = require('../errors');
var knex = config.knex;

var symbols = require('./symbols');
var mathjs = require('mathjs');

var math = mathjs({
  number: 'bignumber'
});

var knex = config.knex;

function getBalance(t, userid, symbol) {
  return knex('balance')
  .transacting(t)
  .forUpdate()
  .where('userid', '=', userid)
  .andWhere('symbol', '=', symbol);
}

function gtz(a) {
  return math.eval(a + " >0");
}

function gtmin(a, min) {
  return math.eval(a + " >= " + min);
}

/**
 * Remove 0 quantity orders.
 */
function cleanUpOrders() {
  console.log('cleaning!');

  knex('bid')
    .where('quantity', '=', 0)
    .del().then(function (q) {
      console.log('deleted ' + q + ' bids')
    });

  knex('ask')
    .where('quantity', '=', 0)
    .del().then(function (q) {
      console.log('deleted ' + q + ' asks')
    });
}

function addToBalance(t, userid, symbol, amount) {
  var newamount = 0;

  if (!userid || !symbol || !amount) {
    throw new Error('addToBalance: invalid argument');
  }

  return getBalance(t, userid, symbol)
  .then(function (balance) {
    console.log(balance);
    var newamount = math.format(math.eval( balance[0].amount + ' + ' + amount));
    console.log('adding ' + amount + ' to ' + balance[0].amount + ' leaving ' + newamount);
    var retval = knex('balance')
    .transacting(t)
    .forUpdate()
    .where('userid', '=', userid)
    .andWhere('symbol', '=', symbol)
    .update({
      amount: newamount
    });
    return retval;
  });
}

function subtractFromBalance(t, userid, symbol, amount) {
  var newamount = 0;

  return getBalance(t, userid, symbol)
  .then(function (balance) {
    var newamount = math.format(math.eval( balance[0].amount + ' - ' + amount));
    console.log('subtracting ' + amount + ' from ' + balance[0].amount + ' leaving ' + newamount);
    var retval = knex('balance')
    .transacting(t)
    .forUpdate()
    .update({
      amount: newamount
    })
    .where('userid', '=', userid)
    .andWhere('symbol', '=', symbol)
    return retval;
  });
}


function subtractFromAskOrder(t, ask, quantity) {
  var newquantity = math.format(math.eval(ask.quantity + ' - ' + quantity));
  return knex('ask')
  .transacting(t)
  .forUpdate()
  .where('id', '=', ask.id)
  .update({
    quantity: newquantity
  });
}

function subtractFromBidOrder(t, bid, quantity) {
  var newquantity = math.format(math.eval(bid.quantity + ' - ' + quantity));
  return knex('bid')
  .transacting(t)
  .forUpdate()
  .where('id', '=', bid.id)
  .update({
    quantity: newquantity
  });
}


/**
 * Match and process orders
 */
function match () {
  console.time('Matching');
  return knex.transaction(function(t) {
    var state = {};

    return knex('bid')
    .transacting(t)
    .forUpdate()
    .join('ask', function() {
      this.on('bid.buysymbol', '=', 'ask.sellsymbol')
      .andOn('bid.userid', '!=', 'ask.userid')
      .andOn('bid.sellsymbol', '=', 'ask.buysymbol')
      .andOn('bid.price', '>=', 'ask.price')
      .andOn('bid.price', '>', 0)
      .andOn('bid.quantity', '>', 0)
    })
    .orderBy('bid.id')
    .select(['bid.id', 'bid.userid', 'bid.buysymbol', 'bid.sellsymbol', 'bid.price', 'bid.quantity'])
    .then(function (bids) {
      state.bids = bids;
      console.log('analyzing bids ' + JSON.stringify(bids));

      return knex('ask')
      .transacting(t)
      .select(['ask.id', 'ask.userid', 'ask.buysymbol', 'ask.sellsymbol', 'ask.price', 'ask.quantity'])
      .forUpdate()
      .join('bid', function() {
        this.on('bid.buysymbol', '=', 'ask.sellsymbol')
        .andOn('bid.sellsymbol', '=', 'ask.buysymbol')
        .andOn('ask.price', '<=', 'bid.price')
        .andOn('ask.price', '>', 0)
        .andOn('ask.quantity', '>', 0)
      })
      .orderBy('ask.price')
      .orderBy('ask.id')
    })
    .then(function (asks) {
      console.log('asks ');
      console.log(asks);
      state.asks = asks;

      var ask, bid;
      var bids = state.bids;
      var promises = [];

      for (var i=0, j=0; i<bids.length && j<asks.length; ) {
        if (bids[i]) {
          bid = bids[i];
        } else {
          break;
        }
        if (asks[j]) {
          ask = asks[j];
        } else {
          break;
        }

        // true if the bid quantity is less than or equalt to the ask quantity
        // false if the ask quantity is greater than the bid quantity
        var bidhasless = math.eval(bid.quantity + " <= " + ask.quantity);

        if (! math.eval(bid.price + ' >= ' + ask.price)) {
          throw new Error ('The bid price has to be >= the ask price ');
        }

        var price = ask.price;

        if (bidhasless) {
          console.log('bid has less or equal!');
          var quantity = bid.quantity;
        } else {
          console.log('ask has less!');
          var quantity = ask.quantity;
        }

        console.log('quantity is ... ' + quantity);

        var cost = math.format(math.eval(price + '*' + quantity));

        // first return the orders to the users' balances...
        // remember, ask.sellsymbol = bid.buysymbol
        // and       bid.sellsymbol = ask.buysymbol

        // promises.push(subtractFromAskOrder(t, ask, quantity));
        // promises.push(addToBalance(t, ask.userid, bid.buysymbol, quantity));

        // promises.push(subtractFromBidOrder(t, bid, quantity));
        // promises.push(addToBalance(t, bid.userid, bid.sellsymbol, math.format(math.eval(quantity + " * " + bid.price))));


        // // now complete the trade portion

        // promises.push(addToBalance(t, bid.userid, bid.buysymbol, quantity));
        // console.log('adding to bidder ' + quantity + ' of '+ bid.buysymbol);
        // promises.push(subtractFromBalance(t, bid.userid, bid.sellsymbol, cost));
        // console.log('subtract from bidder ' + cost + ' of '+ bid.sellsymbol);

        // promises.push(addToBalance(t, ask.userid, bid.sellsymbol, cost));
        // console.log('adding to seller ' + cost + ' of '+ bid.sellsymbol);

        // promises.push(subtractFromBalance(t, ask.userid, bid.buysymbol, quantity));
        // console.log('subtract from bidder ' + quantity + ' of '+ bid.buysymbol);

        // uber

        promises.push(addToBalance(t, bid.userid, bid.buysymbol, quantity));
        promises.push(addToBalance(t, bid.userid, bid.sellsymbol, math.format(math.eval(quantity + " * " + bid.price + " - " + cost))));
        promises.push(subtractFromBidOrder(t, bid, quantity));

        // promises.push(subtractFromBalance(t, ask.userid, bid.buysymbol, math.format(math.eval(quantity + " - " + quantity))));
        promises.push(subtractFromBalance(t, ask.userid, bid.buysymbol, math.format(math.eval(quantity + " * " + price + " - " + cost))));
        promises.push(addToBalance(t, ask.userid, bid.sellsymbol, cost));
        promises.push(subtractFromAskOrder(t, ask, quantity));

        if (bidhasless) {
          i++; // next bid
        } else {
          j++; // next ask
        }
      }

      return Promise.all(promises);
    })
    .then(t.commit, t.rollback)
    .then(function () {
      console.timeEnd('Matching');
    })
  });
}

setInterval(match, 2000);




module.exports.getUsers = function () {
  return knex('users').select();
}

module.exports.getUser = function (userid) {
 return knex('users')
  .select()
  .where('id', '=', userid);
}

module.exports.createUser = function (username, password) {
  return knex('users').insert({
    username: username,
    password: password,
    "created_at": new Date(),
    "updated_at": new Date()
  })
  .then(function (userrow) {
    Promise.all(_.map(symbols.coins, function (sym) {
      return knex('balance').insert({
        userid: userrow.id,
        symbol: sym,
        amount: 0,
        "created_at": new Date(),
        "updated_at": new Date()
      });
    }));
  });
}

module.exports.getBalances = function (userid) {
  return knex('balance')
  .where('balance.userid', '=', userid);
}

module.exports.getDepositAddress = function (userid, symbol) {
  return knex('depositaddresses')
  .where('depositaddresses.userid', '=', userid);
}

module.exports.getBuyOrders = function (userid, buysymbol, sellsymbol) {
  var query = knex('bid')
  .where('userid', '=', userid);

  if (buysymbol) {
    query = query.andWhere('buysymbol', '=', buysymbol).andWhere('sellsymbol', '=', sellsymbol);
  }

  return query;
}

module.exports.getSellOrders = function (userid, buysymbol, sellsymbol) {
  var query = knex('ask')
  .where('userid', '=', userid);

  if (buysymbol) {
    query = query.andWhere('buysymbol', '=', buysymbol).andWhere('sellsymbol', '=', sellsymbol);
  }

  return query;
}


module.exports.deleteBuyOrder = function (id) {
  return knex.transaction(function(t) {
    return knex('bid')
      .transacting(t)
      .forUpdate()
      .where('id', '=', id)
      .then(function (bidA) {
        var bid = bidA[0];
        console.log(bid);
        return knex('balance')
        .transacting(t)
        .forUpdate()
        .where('userid', '=', bid.userid)
        .andWhere('symbol', '=', bid.sellsymbol)
        .then(function (balA) {
          console.log(balA[0]);
          var newbal = math.format(math.eval(balA[0].amount + ' + (' + bid.quantity + '*' + bid.price + ')'));

          return knex('balance')
          .transacting(t)
          .forUpdate()
          .where('userid', '=', bid.userid)
          .andWhere('symbol', '=', bid.sellsymbol)
          .update({
            amount: newbal
          }).then(function (rowcount) {
            console.log('updated ' + rowcount);
            return rowcount;
          })
        })
      })
      .then(function () {
        return knex('bid')
        .transacting(t)
        .where('id', '=', id)
        .del().then(function (rowcount) {
          console.log('deleted ' + rowcount);
          return rowcount;
        });
      })
      .then(function () {
        return t.commit();
      })
      // .done(t.commit, t.rollback);
  });
}

module.exports.deleteSellOrder = function (id) {
  return knex.transaction(function(t) {
    return knex('ask')
      .transacting(t)
      .forUpdate()
      .where('id', '=', id)
      .then(function (askA) {
        var ask = askA[0];
        console.log(ask);
        return knex('balance')
        .transacting(t)
        .forUpdate()
        .where('userid', '=', ask.userid)
        .andWhere('symbol', '=', ask.sellsymbol)
        .then(function (balA) {
          console.log(balA[0]);
          var newbal = math.format(math.eval(balA[0].amount + ' + ' + ask.quantity));

          return knex('balance')
          .transacting(t)
          .forUpdate()
          .where('userid', '=', ask.userid)
          .andWhere('symbol', '=', ask.sellsymbol)
          .update({
            amount: newbal
          }).then(function (rowcount) {
            console.log('updated ' + rowcount);
            return rowcount;
          })
        })
      })
      .then(function () {
        return knex('ask')
        .transacting(t)
        .where('id', '=', id)
        .del().then(function (rowcount) {
          console.log('deleted ' + rowcount);
          return rowcount;
        });
      })
      .done(t.commit, t.rollback);
  });
}

module.exports.deleteUser = function (id) {
  return knex('users')
  .where('users.id', '=', id)
  .del();
}


module.exports.buy = function (userid, buysymbol, quantity, price, sellsymbol) {
  if (!symbols.tradeAllowed(buysymbol, sellsymbol)) {
    return Promise.reject(new errors.ClientError("Trade not allowed"));
  }
  if (!symbols.gtcoinmin(quantity, sellsymbol)) {
    return Promise.reject(new errors.ClientError("Quantity too low"));
  }
  if (!symbols.gtcoinmin(quantity, buysymbol)) {
    return Promise.reject(new errors.ClientError("Price too low"));
  }

  return knex.transaction(function(t) {
    return knex('balance')
      .transacting(t)
      // .forUpdate()
      .where('userid', '=', userid)
      .andWhere('symbol', '=', sellsymbol)
      .then(function (balA) {
        //Check balance
        var bal = balA[0];
        if (math.eval(bal.amount +' < ' + price + ' * ' + quantity)) {
          throw new errors.ClientError("Insufficient balance");
          // return Promise.reject(new errors.ClientError("Not enough funds to create buy order; required "
           // + math.format(math.eval(price + ' * ' + quantity))
           // + sellsymbol
           // + "; have: "
           // + bal.amount + bal.symbol);
        } else {
          return bal;
        }
      })
      .then(function (bal) {
        var newbalance = math.format(math.eval(bal.amount + ' - ' + price + ' * ' + quantity));
        return knex('balance')
        .transacting(t)
        .forUpdate()
        .where('userid', '=', userid)
        .andWhere('symbol', '=', sellsymbol)
        .update({
          amount: newbalance
        }).then(function (count) {
          console.log('updated ' + count);
        });
      })
      .then(function () {
        return knex('bid')
        .transacting(t)
        .insert({
          "userid": userid,
          "buysymbol": buysymbol,
          "quantity": quantity,
          "price": price,
          "sellsymbol": sellsymbol,
          "created_at": new Date(),
          "updated_at": new Date()
        });
      })
      .then(t.commit, t.rollback);
  });
}

module.exports.sell = function (userid, buysymbol, quantity, price, sellsymbol) {
  if (!symbols.tradeAllowed(sellsymbol, buysymbol)) {
    return Promise.reject(new errors.ClientError("Trade not allowed"));
  }
  if (!symbols.gtcoinmin(quantity, sellsymbol)) {
    return Promise.reject(new errors.ClientError("Quantity too low"));
  }
  if (!symbols.gtcoinmin(quantity, buysymbol)) {
    return Promise.reject(new errors.ClientError("Price too low"));
  }

  return knex.transaction(function(t) {
    return knex('balance')
      .transacting(t)
      // .forUpdate()
      .where('userid', '=', userid)
      .andWhere('symbol', '=', sellsymbol)
      .then(function (balA) {
        //Check balance
        var bal = balA[0];
        if (math.eval(bal.amount +' < ' +quantity)) {
          throw new errors.ClientError("Insufficient balance");
        } else {
          return bal;
        }
      })
      .then(function (bal) {
        var newbalance = math.format(math.eval(bal.amount + ' - ' + quantity));
        return knex('balance')
        .transacting(t)
        // .forUpdate()
        .where('userid', '=', userid)
        .andWhere('symbol', '=', sellsymbol)
        .update({
          amount: newbalance
        });
      })
      .then(function () {
        return knex('ask')
        .transacting(t)
        .insert({
          "userid": userid,
          "buysymbol": buysymbol,
          "quantity": quantity,
          "price": price,
          "sellsymbol": sellsymbol,
          "created_at": new Date(),
          "updated_at": new Date()
        });
      })
      .then(t.commit, t.rollback);
  });
}
