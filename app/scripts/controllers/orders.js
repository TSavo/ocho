'use strict';

angular.module('excApp')
  .controller('OrdersCtrl', function ($scope, $http) {

    var math = mathjs({
      number: 'bignumber'
    });

    function AllowedCoin (A, B) {
      this.coinA = A;
      this.coinB = B;
      this.text = this.coinA + "/" + this.coinB;
    }

    $scope.side = "";
    $scope.coinA = '';
    $scope.coinB = '';
    $scope.allowed = [];
    $scope.coins;

    function loadCoinNames () {
      $http.get('/api/symbols/coins').success(function(coins) {
        $scope.coins = coins;
      });
    }
    loadCoinNames();

    function loadAllowedOrders () {
      $http.get('/api/symbols/allowedtrades').success(function(allowedtrades) {
        _.each(allowedtrades, function(item) {
          $scope.allowed.push(new AllowedCoin(item[0], item[1]));
        })
      });
    }

    $scope.multiply = function (a,b) {
      return math.format(math.eval(a+"*"+b));
    }

    loadAllowedOrders();

    $scope.loadAllowed = function(item) {
      $scope.coinA = item.coinA;
      $scope.coinB = item.coinB;
    }

    $scope.loadOrder = function(side, order) {
      $scope.side = side;
      $scope.quantity = order.quantity;
      $scope.price = order.price;
    }

    $scope.place = function(s) {

      var data = {};
      data.side = $scope.side;
      data.quantity = $scope.quantity;
      data.price = $scope.price;

      if (data.side === 'buy') {
        data.buysymbol = $scope.coinA;
        data.sellsymbol = $scope.coinB;
      } else if (data.side === 'sell') {
        data.sellsymbol = $scope.coinA;
        data.buysymbol = $scope.coinB;
      } else {
        throw new Error('invalid side');
      }
      console.log(JSON.stringify(data));

      $http.post('/api/orders/' + $scope.side, data).success(function (response) {
        loadAll();
      });
    }

    $scope.cancel = function(side, orderID) {
      $http['delete']('/api/orders/' + side + '/' + orderID)
      .then(function (success) {
        loadAll();
      });

    }

    $scope.getButtonText = function () {

      var res = "";

      if ($scope.side === 'buy') {
        res += "Buy";
      } else if ($scope.side === 'sell') {
        res += "Sell";
      } else {
        res += "Buy or Sell";
      }
      if ($scope.quantity) {
        res += " " +  $scope.quantity + " " + $scope.coinA;
      }
      if ($scope.price) {
        res += " @ " + $scope.price + " "+ $scope.coinB;
      }

      if ($scope.price && $scope.quantity) {
        var total = math.format(
          math.multiply(
            math.bignumber($scope.price),
            math.bignumber($scope.quantity)
          ));

        res += " (total " + total + " " + $scope.coinB +")";
      }

      return res;
    }

    $scope.readyToOrder = function () {
      return ($scope.side === 'buy' || $scope.side === 'sell')
      && $scope.quantity
      && $scope.price;
    }

    function loadBuys () {
      $http.get('/api/orders/buy').success(function(buyorders) {
        $scope.buyorders = buyorders;
      });
    }

    function loadSells () {
      $http.get('/api/orders/sell').success(function(sellorders) {
        $scope.sellorders = sellorders;
      });
    }

    function loadAll () {
      loadBuys();
      loadSells();
    }

    loadAll();
  });
