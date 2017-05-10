
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket')
      .controller('vmShopperCtrl', vmShopperCtrl);

  /** @ngInject */
  function vmShopperCtrl($scope, $timeout, $http, baConfig, baUtil, vmHelper) {
    // var layoutColors = baConfig.colors;
    // $scope.colors = [layoutColors.primary, layoutColors.warning, layoutColors.danger, layoutColors.info, layoutColors.success, layoutColors.primaryDark];
    
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
      $scope.drawChart(data, $scope.chartColors);
    }

    // chart options
    $scope.getBarChartOptions = function(data, label, colors) { 
      return {
        element: 'vmFeedbackReason',
        data: data,
        xkey: 'reason',
        ykeys: ['count'],
        labels: [label],
        // xLabels: 'month',
        // xLabelFormat: function(x){
        //   return vmHelper.formatMonth(x.getMonth()+1)+' \''+x.getFullYear().toString().substr(-2);
        // },
        yLabelFormat : function(y){
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
        hoverCallback: function (index, options, content, row) {
          var hoverInfo = '<p>'+row.reason+'</p>';
          hoverInfo += '<p>'+'Jumlah: '+row.count+'</p>';
          return hoverInfo;
        },
        barColors: colors,
        // xLabelAngle: 30,
      };
    };

    $scope.drawChart =  function(data, colors) {
      var label = '';

      if($scope.chart == undefined) {
        if(data.length == 0) {
          $scope.noData = true;
        } else {
          $scope.chart = new Morris.Bar($scope.getBarChartOptions(data, label, colors));
          $scope.noData = false;
        }
      } else {
        $('#vmFeedbackReason').empty();
        if(data.length == 0) {
          $scope.noData = true;
        } else {
          $scope.chart = new Morris.Bar($scope.getBarChartOptions(data, label, colors));
          $scope.noData = false;
        } 
      }
    };

  }
})();