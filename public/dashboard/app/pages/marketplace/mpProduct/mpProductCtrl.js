
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.marketplace')
      .controller('mpProductCtrl', mpProductCtrl);

  /** @ngInject */
  function mpProductCtrl($scope, $timeout, $http, $rootScope, $uibModal, baConfig, baUtil, mpHelper) {
    // COLORS
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);
    var pieColor = mpHelper.colors.primary.green;

    $scope.colors = mpHelper.colors.primary;

    // INIT DATA
    $scope.initProductList = function() {
      $scope.productPageIndex = 1;
      $scope.productPageSize = 5;
      $scope.productList = {
        totalRows: 0,
        // page: 1,
        // rowsPerPage: 5,
        displayedPages: 1,
        product:[]
      };
    }

    // EVENTS
    $scope.$on('updateMp', function(event, startDate, endDate) {
      $scope.startDate = startDate;
      $scope.endDate = endDate;
      $scope.initProductList();
      $scope.getData(startDate, endDate);
    });

    $scope.getData = function(startDate, endDate) {
      // $scope.getStats(startDate, endDate);  
      $scope.getProductList(startDate, endDate, $scope.productList.page, $scope.productList.rowsPerPage);
    };

    // PRODUCT STATS
    $scope.getStats = function(startDate, endDate) {
      $scope.loading = true;
      $http.get('/api/marketplace/product?type=stats&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          $scope.showAvailability(data.availability);
          // $scope.showUnavailableProducts(data.unavailable_products);
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
      $http.get('/api/marketplace/product?type=list&start_date='+startDate+'&end_date='+endDate+'&page='+page+'&rows='+rows)
        .then(function(res) {
          var data = res.data.data;
          $scope.showProducts(data);
        })
        .finally(function() {
          $scope.loading= false;
        });    
    };

    $scope.showProducts = function(data) {
      // $scope.productList.totalRows = data.total_rows;
      // $scope.productList.product = data.product;

      $scope.updatedProductList = data.product;
      // copy references
      $scope.productList.product = [].concat($scope.updatedProductList);
    };

    $scope.getRank = function(index) {
      return (index+1+(($scope.productList.page-1)*$scope.productList.rowsPerPage));
    };
    
    $scope.formatNumber = function(number) {
      return mpHelper.formatNumber(parseInt(number),false,false);
    };

    $scope.changeProductPage = function(newPage) {
      // $scope.getProductList($scope.startDate, $scope.endDate, $scope.productList.page, $scope.productList.rowsPerPage);
      $scope.productPageIndex = newPage;
    };

    // TREND AND PREDICTION
    $scope.viewTrend = function(product) {
      var startDate = $scope.startDate;
      var endDate = $scope.endDate;

      $http.get('/api/marketplace/product?type=prediction&start_date='+startDate+'&end_date='+endDate+'&product_id='+product.id)
        .then(function(res) {
          var data = res.data.data;
          for(var i=0; i<data.trend.length-1; i++) {
            var date = moment(data.trend[i+1].date, 'YYYY-MM-DD');
            if(date.isAfter(moment(),'day'))
              data.trend[i].dashLength = 2;  
            else
              data.trend[i].dashLength = 0;  
          }
          $scope.productTrendData = data;
        })
        .finally(function() {
          // $scope.loading= false;
          // open edit modal
          var page = 'app/pages/marketplace/mpProduct/productTrendModal.html';
          var size = 'lg';
          $rootScope.productTrendModalInstance = $uibModal.open({
            animation: true,
            templateUrl: page,
            size: size,
            scope: $scope,
            windowClass: 'pv-product-trend-modal'
          });
        });    

    };

    $scope.sorter = {
      count: function(value) {
        return parseInt(value.count);
      },
      sums: function(value) {
        return parseInt(value.sums);
      },
      avgPrice: function(value) {
        return parseInt(value.avg_price);
      }
    };

  }
})();