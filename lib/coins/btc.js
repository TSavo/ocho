var Promise = require('bluebird');
var bitcoin = require('bitcoin');
var client = Promise.promisifyAll(new bitcoin.Client({
  host: '10.0.0.3',
  port: 8332,
  user: 'bitcoinrpc',
  pass: 'Dq4xghbmAd41MfF6dYXDVXz7n3oqGJfCBz7LDHwQCQ6J'
}));

// setInterval(function () {
//   client.getDifficultyAsync().then(function (diff) {
//     console.log('BTC diff ' + diff);
//   })
// }, 1000);

module.exports = client;
