
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket')
      .controller('vmCommodityCtrl', vmCommodityCtrl);

  /** @ngInject */
  function vmCommodityCtrl($scope, $timeout, $http, baConfig, baUtil, vmHelper) {
    // COLORS
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);
    var pieColor = vmHelper.colors.primary.green;

    $scope.colors = vmHelper.colors.primary;

    // INIT DATA
    $scope.initProductList = function() {
      $scope.productList = {
        totalRows: 0,
        page: 1,
        rowsPerPage: 5,
        displayedPages: 1,
        product:[]
      };
    }

    // EVENTS
    $scope.$on('updateVm', function(event, startDate, endDate) {
      $scope.startDate = startDate;
      $scope.endDate = endDate;
      $scope.initProductList();
      $scope.getData(startDate, endDate);
    });

    $scope.getData = function(startDate, endDate) {
      $scope.getStats(startDate, endDate);  
      $scope.getProductList(startDate, endDate, $scope.productList.page, $scope.productList.rowsPerPage);
    };

    // PRODUCT STATS
    $scope.getStats = function(startDate, endDate) {
      $scope.loading = true;
      $http.get('/api/virtualmarket/commodity?type=stats&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          $scope.showAvailability(data.availability);
          $scope.showUnavailableProducts(data.unavailable_products);
        })
        .finally(function() {
          $scope.loading= false;
        });    
    }

    $scope.options = {
      barColor: pieColor,
      trackColor: trackColor,
      size: 84,
      scaleLength: 0,
      animate: { duration: 1000, enabled: true },
      lineWidth: 9,
      lineCap: 'round',
    };
    
    $scope.showAvailability = function(data) {
      
      var available = {
        is_available: true,
        count: 0
      };
      var unavailable = {
        is_available: false,
        count: 0
      };

      for(var i=0; i<data.length; i++ ) {
        if(data[i].is_available == true) {
          available = data[i];
          available.count = parseInt(available.count);
        }
        else if(data[i].is_available == false) {
          unavailable = data[i];
          unavailable.count = parseInt(unavailable.count);
        }
      }

      var percentage = Math.round(available.count / (available.count + unavailable.count) * 100);

      $scope.charts = [{
        color: pieColor,
        description: 'Ketersediaan',
        stats: available.count+'/'+(available.count+unavailable.count),
      }];

      $scope.percent = percentage; 
    }

    $scope.showUnavailableProducts = function(data) {
      $scope.unavailableProducts = data;
    }


    // PRODUCT TOPLIST
    $scope.getProductList = function(startDate, endDate, page, rows) {
      $scope.loading = true;
      $http.get('/api/virtualmarket/commodity?type=toplist&start_date='+startDate+'&end_date='+endDate+'&page='+page+'&rows='+rows)
        .then(function(res) {
          var data = res.data.data;
          $scope.showProducts(data);
        })
        .finally(function() {
          $scope.loading= false;
        });    
    };

    $scope.showProducts = function(data) {
      $scope.productList.totalRows = data.total_rows;
      $scope.productList.product = data.product;
    };

    $scope.getRank = function(index) {
      return (index+1+(($scope.productList.page-1)*$scope.productList.rowsPerPage));
    };
    
    $scope.formatPrice = function(price) {
      return vmHelper.formatNumber(price,false,false);
    };

    $scope.changeProductPage = function() {
      $scope.getProductList($scope.startDate, $scope.endDate, $scope.productList.page, $scope.productList.rowsPerPage);
    };
  }
})();