'use strict';

angular.module('excApp')
  .controller('UsersCtrl', function ($scope, $http) {
    $http.get('/api/users').success(function(users) {
      $scope.users = users;
    });
  });
