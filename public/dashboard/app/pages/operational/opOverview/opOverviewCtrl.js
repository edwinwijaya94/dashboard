
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.operational')
      .controller('opOverviewCtrl', opOverviewCtrl);

  /** @ngInject */
  function opOverviewCtrl($scope, $timeout, $http, $rootScope, $uibModal, baConfig, baUtil, opHelper) {
    var layoutColors = baConfig.colors;
    // $scope.colors = [layoutColors.primary, layoutColors.warning, layoutColors.danger, layoutColors.info, layoutColors.success, layoutColors.primaryDark];
    
    // COLORS
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);
    var pieColor = opHelper.colors.primary.green;

    $scope.colors = opHelper.colors.primary;
    $scope.chartColors = [$scope.colors.blue, $scope.colors.yellow, $scope.colors.green, $scope.colors.red];
    
    // DEFAULT CHART SETTINGS
    $scope.stats = {
      product_availability: {
        color: pieColor,
        description: 'Ketersediaan',
        info: '',
        value: opHelper.formatNumber(0,true,false),
        percent: 0,
        showPie: true,
        showChange: false,
        change: 0,
        prevValue: 0,
        icon:'ion-arrow-up-b',
        iconColor: $scope.colors.green,
        colSize: 6,
      },
      transaction_count: {
        color: pieColor,
        description: 'Jumlah Transaksi',
        info: '',
        value: 0,
        percent: 0,
        showPie: false,
        showChange: true,
        change: 0,
        prevValue: 0,
        icon:'ion-arrow-up-b',
        iconColor: $scope.colors.green,
        colSize: 6,
      },
    };

    $scope.options = {
      barColor: pieColor,
      trackColor: trackColor,
      size: 84,
      scaleLength: 0,
      animate: { duration: 1000, enabled: true },
      lineWidth: 9,
      lineCap: 'round',
    };

    $scope.noData = false;
    $scope.transactionHistory = {metric : 'count'};

    // EVENTS
    $scope.$on('updateOp', function(event, startDate, endDate) {
      $scope.startDate = startDate;
      $scope.endDate = endDate;
      $scope.getData(startDate, endDate);  
    });

    $scope.getData = function(startDate, endDate) {
      $scope.getOverview(startDate, endDate);
    }

    $scope.getOverview = function(startDate, endDate) {
      $http.get('/api/operational/overview?start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          $scope.showProduct(data.product);
          $scope.showTransaction(data.transaction);
        })
        .finally(function() {
          // $scope.loading= false;
        });
    }

    // PRODUCT
    $scope.initProductList = function() {
      $scope.productPageIndex = 1;
      $scope.unavailablePageIndex = 1;
      $scope.productPageSize = 5;
      $scope.unavailableList = {
        totalRows: 0,
        // page: 1,
        // rowsPerPage: 5,
        displayedPages: 1,
        product:[]
      };
      $scope.productList = {
        totalRows: 0,
        // page: 1,
        // rowsPerPage: 5,
        displayedPages: 1,
        product:[]
      };
    }
    $scope.initProductList();

    $scope.showProduct = function(data) {
      // availability rates
      var available, notAvailable;
      var items = data.availability;
      for(var i=0; i<items.length; i++ ) {
        if(items[i].is_available == true) {
          available = parseInt(items[i].count);
        }
        else if (items[i].is_available == false) {
          notAvailable = parseInt(items[i].count);
        }
      }
      var percentage = (available + notAvailable)>0 ? Math.round(available / (available + notAvailable) * 100) : 0;
      // update chart
      $scope.stats.product_availability.value = available+'/'+(available+notAvailable);
      $scope.stats.product_availability.percent = percentage;

      // unavailable list
      $scope.updatedUnavailableList = data.unavailable_list;
      $scope.unavailableList.product = [].concat($scope.updatedUnavailableList);
      
      // product list
      $scope.updatedProductList = data.list;
      $scope.productList.product = [].concat($scope.updatedProductList);
    };

    $scope.showTransaction = function(data) {
      // transaction count
      var stat = {};
      stat.description = $scope.stats.transaction_count.description;
      stat.info = $scope.stats.transaction_count.info;
      stat.showPie = $scope.stats.transaction_count.showPie;
      stat.showChange = $scope.stats.transaction_count.showChange;
      stat.value = parseInt(data.count.current);
      stat.prevValue = parseInt(data.count.prev);
      var change = ((stat.value-stat.prevValue)/(stat.prevValue)*100).toFixed(2);
      stat.change = isFinite(change)? change:0;
      if(stat.change>=0) {
        stat.icon = 'ion-arrow-up-b';
        stat.iconColor = $scope.colors.green;
      } else {
        stat.change *= -1;
        stat.icon = 'ion-arrow-down-b';
        stat.iconColor = $scope.colors.red;
      }
      stat.colSize = $scope.stats.transaction_count.colSize;
      stat.change = opHelper.formatNumber(stat.change,false,false);
      $scope.stats.transaction_count = stat;

      // transaction status
      var items = data.status;
      for(var i=0; i<items.length; i++){
        if(items[i].status == 'success')
          items[i].fillColor = $scope.colors.green;
        else
          items[i].fillColor = '#d1cfcf';
      }
      data.status = items;
      $scope.chart = AmCharts.makeChart('opTransactionStatus',$scope.getBarChartOptions(data.status, $scope.colors, 'status'));

    }

    // chart options
    $scope.getBarChartOptions = function(data, colors, categoryField) { 
      
      var options = {
        color: layoutColors.defaultText,
        data: data,
        // title: 'Metode',
        gridColor: layoutColors.border,
        valueLabelFunction: function(y) {
          var yValue;
          if(y>=1000000000)
            yValue = (y/1000000000).toString() + ' mi';
          else if(y>=1000000)
            yValue = (y/1000000).toString() + ' jt';
          else if (y>=1000)
            yValue = (y/1000).toString() + ' rb';
          else 
            yValue = y.toString();

          return yValue;
        }, 
        graphs: [
          {
            id: 'g1',
            balloonFunction: function(item, graph) {
              var value = item.values.value;
              var hoverInfo = 'Jumlah:<br> <b>'+value+'</b>';
              return hoverInfo;
            },
            lineAlpha: 0,
            fillColorsField: 'fillColor',
            fillAlphas: 1,
            type: 'column',
            valueField: 'count',
          }
        ],
        rotate: true,
        categoryField: categoryField,
      };

      return opHelper.getBarChartOptions(options);
    };

    // PRODUCT TREND
    $scope.viewTrend = function(product) {
      var startDate = $scope.startDate;
      var endDate = $scope.endDate;

      $scope.selectedProduct = product;
      $http.get('/api/operational/product?type=trend&start_date='+startDate+'&end_date='+endDate+'&product_id='+product.id)
        .then(function(res) {
          var data = res.data.data;
          if(data.trend.granularity=='day') {
            for(var i=0; i<data.trend.length-1; i++) {
              var date = moment(data.trend[i+1].date, 'YYYY-MM-DD');
              if(date.isAfter(moment(),'day'))
                data.trend[i].dashLength = 2;  
              else
                data.trend[i].dashLength = 0;  
            }
          } else {
            for(var i=0; i<data.trend.length-1; i++) {
              data.trend[i].dashLength = 0;  
            }
          }
          $scope.productTrendData = data;
        })
        .finally(function() {
          // $scope.loading= false;
          // open edit modal
          console.log('finally');
          var page = 'app/pages/operational/opOverview/productTrendModal.html';
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

    $scope.formatNumber = function(number) {
      return opHelper.formatNumber(parseFloat(number),false,false);
    };

    $scope.changeUnavailablePage = function(newPage) {
      // $scope.getProductList($scope.startDate, $scope.endDate, $scope.productList.page, $scope.productList.rowsPerPage);
      $scope.unavailablePageIndex = newPage;
    };

    $scope.changeProductPage = function(newPage) {
      // $scope.getProductList($scope.startDate, $scope.endDate, $scope.productList.page, $scope.productList.rowsPerPage);
      $scope.productPageIndex = newPage;
    };


    $scope.formatRating = function(rating) {
      return opHelper.formatNumber(rating,false,false);
    };

    $scope.getArrowIcon = function(value) {
      if(value >= 0)
        return 'ion-arrow-up-b';
      else
        return 'ion-arrow-down-b';
    };

    $scope.getArrowColor = function(value) {
      if(value >= 0)
        return $scope.colors.green;
      else
        return $scope.colors.red;
    };

    $scope.sorter = {
      count: function(value) {
        return parseInt(value.count);
      },
      avgPrice: function(value) {
        return parseInt(value.avg_price);
      },
      availability: function(value) {
        return parseFloat(value.availability);
      }
    };
    
  }
})();