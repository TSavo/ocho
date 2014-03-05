'use strict';

angular.module('excApp')
  .controller('NavbarCtrl', function ($scope, $location, $http) {
    $scope.menu = [{
      'title': 'Home',
      'link': '/'
    }, {
      'title': 'Balances',
      'link': '/balances'
    }, {
      'title': 'My Orders',
      'link': '/orders'
    }, {
      'title': 'Exchange',
      'link': '/exchange'
    }];

    $scope.isActive = function(route) {
      return route === $location.path();
    };

    $http.get('/api/currentUser').then(function (currentUser) {
      console.log(currentUser.data);
      $scope.currentUser = currentUser.data;
    })
  });
