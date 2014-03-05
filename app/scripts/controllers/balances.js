'use strict';

angular.module('excApp')
  .controller('BalancesCtrl', function ($scope, $http) {

    $scope.depositaddresses = {};

    $scope.getAddress = function(symbol) {
      console.log(symbol);
      return _.where($scope.depositaddresses, {symbol: symbol})[0].address;
    }

    $http.get('/api/balances').success(function(balances) {
      $scope.balances = balances;
    });

    $http.get('/api/depositaddresses').success(function(depositaddresses) {
      $scope.depositaddresses = depositaddresses;
    });

    $scope.getBalance = function (symbol) {
      return _.where($scope.balances, {symbol: symbol})[0];
    }
  });
