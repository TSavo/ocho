'use strict';

angular.module('excApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute'
])
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/depositaddresses', {
        templateUrl: 'partials/depositaddresses',
        controller: 'DepositAddressesCtrl'
      })
      .when('/exchange', {
        templateUrl: 'partials/exchange',
        controller: 'ExchangeCtrl'
      })
     .when('/orders', {
        templateUrl: 'partials/orders',
        controller: 'OrdersCtrl'
      })
      .when('/balances', {
        templateUrl: 'partials/balances',
        controller: 'BalancesCtrl'
      })
      .when('/users', {
        templateUrl: 'partials/users',
        controller: 'UsersCtrl'
      })
      .when('/', {
        templateUrl: 'partials/main',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

    $locationProvider.html5Mode(true);
  });
