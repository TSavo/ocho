'use strict';

// var pg = require('knex').initialize({
//   debug: 'true',
//   client: 'pg',
//   connection: {
//     host     : '127.0.0.1',
//     user     : 'ocho',
//     password : '',
//     database : 'exc',
//     charset  : 'utf8'
//   }
// });

var sqlite = require('knex').initialize({
  debug: 'true',
  client: 'sqlite3',
  connection: {
    filename: "./site/mydb.sqlite"
  }
});

var knex = sqlite;

module.exports = {
  env: 'development',
  knex: knex
};
