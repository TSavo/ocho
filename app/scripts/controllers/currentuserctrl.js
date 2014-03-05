'use strict';

angular.module('excApp')
  .controller('CurrentUserCtrl', function ($scope, $location, $http) {
    $http.get('/api/currentUser').then(function (currentUser) {
      console.log(currentUser.data);
      $scope.currentUser = currentUser.data;
    })
  });
