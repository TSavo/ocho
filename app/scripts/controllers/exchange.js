'use strict';

angular.module('excApp')
  .controller('ExchangeCtrl', function ($scope, $http) {
    $http.get('/api/exchange').success(function(orders) {
      $scope.orders = orders;
    });
  });
