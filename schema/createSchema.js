'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var config = require('../lib/config/config');
var Promise = require('bluebird');
var knex = config.knex;

knex.schema.createTable('users', function (table) {
  table.bigIncrements('id').primary();
  table.string('username');
  table.string('password');
  table.string('email');
  table.timestamps();
})
.then(function () {
  return knex.schema.createTable('balance', function (table) {
    table.bigIncrements('id').primary() ;
    table.integer('userid').references('id').inTable('users').notNullable().index();
    table.string('symbol').notNullable();
    table.specificType('amount', 'numeric').notNullable().defaultTo(0);
    table.timestamps();
  })
})
.then(function () {
  return knex.schema.createTable('depositaddresses', function (table) {
    table.bigIncrements('id').primary().references('id').inTable('users');
    table.integer('userid').references('id').inTable('users').notNullable().index();
    table.string('symbol').notNullable();
    table.string('address').notNullable();
    table.timestamps();
  })
})
.then(function () {
  return knex.schema.createTable('bid', function (table) {
    table.bigIncrements('id').primary() ;
    table.integer('userid').references('id').inTable('users').notNullable().index();
    table.string('buysymbol').notNullable();
    table.string('sellsymbol').notNullable();
    table.specificType('quantity', 'numeric').notNullable();
    table.specificType('price', 'numeric').notNullable();
    table.timestamps();
  })
})
.then(function () {
  return knex.schema.createTable('ask', function (table) {
    table.bigIncrements('id').primary() ;
    table.integer('userid').references('id').inTable('users').notNullable().index() ;
    table.string('buysymbol').notNullable();
    table.string('sellsymbol').notNullable();
    table.specificType('quantity', 'numeric').notNullable();
    table.specificType('price', 'numeric').notNullable();
    table.timestamps();
  })
})
.then(function () {
  console.log('done');
  process.exit(0);
})
.catch(function (err) {
  console.log('fail: '+ err);
  process.exit(1);
})
// .finally(function () {
//   knex.close();
// });
