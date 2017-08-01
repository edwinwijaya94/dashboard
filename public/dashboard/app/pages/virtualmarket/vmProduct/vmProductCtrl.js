
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket')
      .controller('vmProductCtrl', vmProductCtrl);

  /** @ngInject */
  function vmProductCtrl($scope, $timeout, $http, $rootScope, $uibModal, baConfig, baUtil, vmHelper) {
    // COLORS
    var layoutColors = baConfig.colors;
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);
    var pieColor = vmHelper.colors.primary.green;

    $scope.colors = vmHelper.colors.primary;

    // INIT DATA
    $scope.stats = {
      availability: {
        color: pieColor,
        description: 'Tingkat Ketersediaan',
        info: '',
        value: 0,
        percent: 0,
        showPie: false,
        showChange: true,
        change: 0,
        prevValue: 0,
        icon:'ion-arrow-up-b',
        iconColor: $scope.colors.green,
        colSize: 4,
      },
      fluctuation: {
        description: 'Fluktuasi Harga',
        value: vmHelper.formatNumber(0,false,false),
        showPie: false,
        showChange: true,
        icon:'ion-arrow-up-b',
        iconColor: $scope.colors.green,
        colSize: 2,
      },
    }

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
      $http.get('/api/virtualmarket/product?type=stats&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          // $scope.showAvailability(data.availability);
          $scope.showFluctuation(data.fluctuation);
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

      var stat = {};
      stat.description = $scope.stats.availability.description;
      stat.info = $scope.stats.availability.info;
      stat.showPie = $scope.stats.availability.showPie;
      stat.showChange = $scope.stats.availability.showChange;
      stat.value = parseFloat(data.current);
      stat.prevValue = parseFloat(data.prev);
      var change = (stat.value-stat.prevValue).toFixed(2);
      stat.change = isFinite(change)? change:0;
      if(stat.change>=0) {
        stat.icon = 'ion-arrow-up-b';
        stat.iconColor = $scope.colors.green;
      } else {
        stat.change *= -1;
        stat.icon = 'ion-arrow-down-b';
        stat.iconColor = $scope.colors.red;
      }
      stat.colSize = $scope.stats.availability.colSize;
      // format number
      stat.value = isFinite(stat.value)? (vmHelper.formatNumber(parseFloat(stat.value),false,false)+'%'):'-';
      stat.change = vmHelper.formatNumber(stat.change,false,false);
      $scope.stats.availability = stat;

      // AVAILABILITY TRENDS
      if($scope.chart != undefined) {
        $('#vmProductAvailability').empty();
      }
      
      if(data.trend.trend.length == 0) {
        $scope.noData = true;
      } else {
        $scope.chart = AmCharts.makeChart('vmProductAvailability',$scope.getAvailabilityChartOptions(data.trend, $scope.colors));
        $scope.noData = false;
      }
    }

    $scope.getAvailabilityChartOptions = function(data, colors) { 
      var dateFormat;
      if(data.granularity == 'month')
        dateFormat = 'YYYY-MM';
      else if(data.granularity == 'day')
        dateFormat = 'YYYY-MM-DD';

      var options = {
        color: layoutColors.defaultText,
        data: data.trend,
        title: 'Ketersediaan (%)',
        gridColor: layoutColors.border,
        valueLabelFunction: function(y) {
          return y;
        }, 
        graphs: [
          {
            id: 'g1',
            balloonFunction: function(item, graph) {
              var date = new Date(item.category);
              var formattedDate;
              if(data.granularity == 'month')
                formattedDate = vmHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
              else if(data.granularity == 'day')
                formattedDate =  date.getDate()+' '+vmHelper.formatMonth(date.getMonth());

              var value = item.values.value;
              var hoverInfo = formattedDate+'<br> Ketersediaan:<br> <b>'+vmHelper.formatNumber(value,false,false)+' %</b>';
              return hoverInfo;
            },
            bullet: 'round',
            bulletSize: 8,
            lineColor: colors.blue,
            lineThickness: 2,
            type: 'line',
            valueField: 'availability'
          }
        ],
        dataDateFormat: dateFormat,
        categoryField: 'date',
        categoryLabelFunction: function(valueText, date, categoryAxis) {
          if(data.granularity == 'month')
            return vmHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
          else if(data.granularity == 'day')
            return date.getDate()+' '+vmHelper.formatMonth(date.getMonth());
        }
      };
      
      var chartOptions = vmHelper.getLineChartOptions(options);
      chartOptions.valueAxes = [{
        maximum: 100
      }];

      return chartOptions;
    };

    $scope.showFluctuation = function(data) {
      
      //product fluctuation
      var stat = {};
      stat.description = $scope.stats.fluctuation.description;
      stat.showPie = $scope.stats.fluctuation.showPie;
      stat.showChange = $scope.stats.fluctuation.showChange;
      stat.value = parseFloat(data);
      if(stat.value>=0) {
        stat.icon = 'ion-arrow-up-b';
        stat.iconColor = $scope.colors.red;
      } else {
        stat.value *= -1;
        stat.icon = 'ion-arrow-down-b';
        stat.iconColor = $scope.colors.green;
      }
      stat.value = isFinite(stat.value)? (vmHelper.formatNumber(stat.value,false,false)+'%'):'-';
      $scope.stats.fluctuation = stat;
    }

    $scope.showUnavailableProducts = function(data) {
      $scope.unavailableProducts = data;
    }


    // PRODUCT LIST
    $scope.getProductList = function(startDate, endDate, page, rows) {
      $scope.loading = true;
      $http.get('/api/virtualmarket/product?type=list&start_date='+startDate+'&end_date='+endDate+'&page='+page+'&rows='+rows)
        .then(function(res) {
          var data = res.data.data;
          $scope.showProducts(data);
          $scope.showAvailability(data.availability);
        })
        .finally(function() {
          $scope.loading= false;
        });    
    };

    $scope.showProducts = function(data) {
      $scope.productList.totalRows = data.total_rows;
      // $scope.productList.product = data.product;

      $scope.updatedProductList = data.product;
      // copy references
      $scope.productList.product = [].concat($scope.updatedProductList);
    };

    $scope.getRank = function(index) {
      return (index+1+(($scope.productList.page-1)*$scope.productList.rowsPerPage));
    };
    
    $scope.formatNumber = function(number) {
      return vmHelper.formatNumber(number,false,false);
    };

    $scope.changeProductPage = function(newPage) {
      // $scope.getProductList($scope.startDate, $scope.endDate, $scope.productList.page, $scope.productList.rowsPerPage);
      $scope.productPageIndex = newPage;
    };

    // TREND AND PREDICTION
    $scope.viewTrend = function(product) {
      var startDate = $scope.startDate;
      var endDate = $scope.endDate;

      $scope.selectedProduct = product;
      $http.get('/api/virtualmarket/product?type=trend&start_date='+startDate+'&end_date='+endDate+'&product_id='+product.id)
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
          var page = 'app/pages/virtualmarket/vmProduct/productTrendModal.html';
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