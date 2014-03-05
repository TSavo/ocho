'use strict';

var symbols = require('../lib/config/symbols');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var config = require('../lib/config/config');
var Promise = require('bluebird');
var knex = config.knex;

knex('users').insert([
    {username:'test', password:'$2a$10$NedrXFAOE2RsN7gWx022DuYKfEVH21qUFhBP99YAAVl.vu2.6oefC', "created_at": new Date(), "updated_at": new Date()},
    {username:'bob', password:'$2a$10$NedrXFAOE2RsN7gWx022DuYKfEVH21qUFhBP99YAAVl.vu2.6oefC', "created_at": new Date(), "updated_at": new Date()},
    {username:'alice', password:'$2a$10$NedrXFAOE2RsN7gWx022DuYKfEVH21qUFhBP99YAAVl.vu2.6oefC', "created_at": new Date(), "updated_at": new Date()},
    {username:'mallory', password:'$2a$10$NedrXFAOE2RsN7gWx022DuYKfEVH21qUFhBP99YAAVl.vu2.6oefC', "created_at": new Date(), "updated_at": new Date()}
  ])
.then(function () {
  return knex('balance').insert([
    {userid: 1, symbol: 'BTC', amount: 100, "created_at": new Date(), "updated_at": new Date()},
    {userid: 1, symbol: 'LTC', amount: 100, "created_at": new Date(), "updated_at": new Date()},
    {userid: 1, symbol: 'VTC', amount: 100, "created_at": new Date(), "updated_at": new Date()},
    {userid: 1, symbol: 'DOGE', amount: 100, "created_at": new Date(), "updated_at": new Date()},
    {userid: 2, symbol: 'BTC', amount: 100, "created_at": new Date(), "updated_at": new Date()},
    {userid: 2, symbol: 'LTC', amount: 100, "created_at": new Date(), "updated_at": new Date()},
    {userid: 2, symbol: 'VTC', amount: 100, "created_at": new Date(), "updated_at": new Date()},
    {userid: 2, symbol: 'DOGE', amount: 100, "created_at": new Date(), "updated_at": new Date()},
    {userid: 3, symbol: 'BTC', amount: 100, "created_at": new Date(), "updated_at": new Date()},
    {userid: 3, symbol: 'LTC', amount: 100, "created_at": new Date(), "updated_at": new Date()},
    {userid: 3, symbol: 'VTC', amount: 100, "created_at": new Date(), "updated_at": new Date()},
    {userid: 3, symbol: 'DOGE', amount: 100, "created_at": new Date(), "updated_at": new Date()},
  ])
})
.then(function () {
  return knex('depositaddresses').insert([
    {userid: 1, symbol: 'BTC', address: '1Fake', "created_at": new Date(), "updated_at": new Date()},
    {userid: 1, symbol: 'LTC', address: 'Lfake', "created_at": new Date(), "updated_at": new Date()},
    {userid: 1, symbol: 'VTC', address: 'Dfake', "created_at": new Date(), "updated_at": new Date()},
    {userid: 1, symbol: 'DOGE', address: 'Vfake', "created_at": new Date(), "updated_at": new Date()}
  ])
})
.then(function () {
  process.exit(0);
})
.catch(function (err) {
  console.error('Error: ' + err);
  process.exit(1);
})
// .finally(function () {
//   knex.close();
// });
