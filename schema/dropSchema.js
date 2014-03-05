'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var config = require('../lib/config/config');
var Promise = require('bluebird');
var knex = config.knex;

knex.schema.dropTableIfExists('balance').then(function () {
  console.log('balance dropped');
})
.then(function () {
  return knex.schema.dropTableIfExists('depositaddresses').then(function () {
    console.log('depositaddresses dropped');
  });
})
.then(function () {
  return knex.schema.dropTableIfExists('ask').then(function () {
    console.log('ask dropped');
  });
})
.then(function () {
  return knex.schema.dropTableIfExists('bid').then(function () {
    console.log('bid dropped');
  });
})
.then(function () {
  return knex.schema.dropTableIfExists('users').then(function () {
    console.log('users dropped');
  });
})
.then(function () {
  console.log('Done');
  process.exit(0);
}).catch(function (prob) {
  console.log(prob);
  process.exit(1);
})
// .finally(function () {
//   knex.close();
// });

