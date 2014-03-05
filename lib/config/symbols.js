
var _ = require('lodash');

var math = require('mathjs')({
  number: 'bignumber'
});


var coinnames = module.exports.coinnames = {
  'BTC': 'Bitcoin',
  'LTC': 'Litecoin',
  'DOGE': 'Dogecoin',
  'VTC': 'Vertcoin',
  'AUR': 'Auroracoin'
}

var coins = module.exports.coins = Object.keys(coinnames);

/* e.g., You can buy [symbols] in terms of the [term]
      and you can sell [symbols] in terms of the [term]
      ...but not the other way around */
var allowedtrades = [
  {
    symbols: ['LTC', 'VTC', 'DOGE', 'AUR'],
    term: 'BTC',
    minimum: '0.00000001'
  },
  {
    symbols: [],
    term: 'LTC',
    minimum: '0.00000001'
  }
]

var allowedtradesmat = module.exports.allowedtrades = [];

_.each(allowedtrades, function (allowed) {
  _.each(allowed.symbols, function (sym) {
    allowedtradesmat.push([sym, allowed.term]);
  });
});

var tradeAllowed = module.exports.tradeAllowed = function (buysym, sellsym) {
  var allowed = _.where(allowedtrades, {term: sellsym});
  if (!allowed || allowed.length !== 1) {
    return false;
  } else {
    return _.indexOf(allowed[0].symbols, buysym) > -1;
  }
}

var minimum = module.exports.minimum = function (sym) {
  var allowed = _.where(allowedtrades, {term: sym});
  if (!allowed || allowed.length !== 1) {
    return '0.00000001'; // default minimum
  } else {
    return allowed[0].minimum;
  }
}


var gtmin = module.exports.gtmin = function(a, min) {
  return math.eval(a + " >= " + min);
}

var gtcoinmin =  module.exports.gtcoinmin = function(a, sym) {
  return math.eval(a + " >= " + minimum(sym));
}

var gtz = module.exports.gtz = function(a) {
  return math.eval(a + " >0");
}
