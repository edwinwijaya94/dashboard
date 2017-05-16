
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket')
      .controller('vmShopperCtrl', vmShopperCtrl);

  /** @ngInject */
  function vmShopperCtrl($scope, $timeout, $http, baConfig, baUtil, vmHelper) {
    var layoutColors = baConfig.colors;
    
    // COLORS
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);
    var pieColor = vmHelper.colors.primary.green;

    $scope.colors = vmHelper.colors.primary;
    $scope.chartColors = [$scope.colors.blue, $scope.colors.yellow, $scope.colors.green, $scope.colors.red];
    
    // DEFAULT CHART SETTINGS
    $scope.stats = {
      shopper: {
        description: 'Jumlah Garendong',
        value: 0
      },
      rating: {
        description: 'Rating',
        transactions: 0,
        value: 0 + ' / 5'
      }
    };

    $scope.noData = false;

    // EVENTS
    $scope.$on('updateVm', function(event, startDate, endDate) {
      $scope.getData(startDate, endDate);  
    });

    $scope.getData = function(startDate, endDate) {
      $scope.getShopperStats(startDate, endDate);
      $scope.getShopperTopList(startDate, endDate);
      $scope.getFeedbackStats(startDate, endDate);
    }

    // SHOPPER STATS
    $scope.getShopperStats = function(startDate, endDate) {
      // $scope.loading = true;
      $http.get('/api/virtualmarket/shopper?type=stats&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          $scope.showShopperStats(data);
        })
        .finally(function() {
          // $scope.loading= false;
        });    
    }

    $scope.showShopperStats = function(data) {
      $scope.stats.shopper.value = data.count;
    }

    // SHOPPER TOPLIST
    $scope.getShopperTopList = function(startDate, endDate) {
      $scope.loading = true;
      $http.get('/api/virtualmarket/shopper?type=toplist&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          $scope.showShopperTopList(data);
        })
        .finally(function() {
          $scope.loading= false;
        });    
    }

    $scope.showShopperTopList = function(data) {
      $scope.topShoppers = data;
    }

    // FEEDBACK STATS
    $scope.getFeedbackStats = function(startDate, endDate) {
      // $scope.loading = true;
      $http.get('/api/virtualmarket/feedback?type=stats&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          $scope.showFeedbackStats(data.rating);
          $scope.showFeedbackReason(data.feedback);
        })
        .finally(function() {
          // $scope.loading= false;
        });    
    }

    $scope.showFeedbackStats = function(data) {
      $scope.stats.rating.transactions = data.transactions;
      $scope.stats.rating.value = data.value + ' / 5';
    }

    // FEEDBACK REASON
    $scope.showFeedbackReason = function(data) {
      $scope.drawChart(data, $scope.colors);
    }

    // chart options
    $scope.getBarChartOptions = function(data, label, colors) { 
      return {
        type: 'serial',
        theme: 'blur',
        color: layoutColors.defaultText,
        marginTop: 10,
        marginRight: 15,
        marginBottom: 10,
        dataProvider: data,
        valueAxes: [
          {
            axisAlpha: 0,
            title: 'Ulasan',
            position: 'left',
            gridAlpha: 0.5,
            gridColor: layoutColors.border,
            minimum: 0,
            integersOnly: true,
            labelFunction: function(y) {
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
            }
          }
        ],
        graphs: [
          {
            id: 'g1',
            balloonFunction: function(item, graph) {
              var value = item.values.value;
              var hoverInfo = 'Jumlah Ulasan:<br> <b>'+value+'</b>';
              return hoverInfo;
            },
            lineAlpha: 0,
            // lineColor: colors.green,
            // lineThickness: 2,
            fillColors: colors.green,
            fillAlphas: 1,
            type: 'column',
            valueField: 'count',
          }
        ],
        rotate: 'true',
        categoryField: 'reason',
        creditsPosition: 'bottom-right'
      };
    };

    $scope.drawChart =  function(data, colors) {
      var label = '';

      if($scope.chart != undefined) {
        $('#vmFeedbackReason').empty();
      }

      if(data.length == 0) {
        $scope.noData = true;
      } else {
        // $scope.chart = new Morris.Bar($scope.getBarChartOptions(data, label, colors));
        $scope.chart = AmCharts.makeChart('vmFeedbackReason',$scope.getBarChartOptions(data, label, colors));
        $scope.noData = false;
      }
    };

  }
})();