
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket')
      .controller('vmFeedbackCtrl', vmFeedbackCtrl);

  /** @ngInject */
  function vmFeedbackCtrl($scope, $timeout, $http, baConfig, baUtil, vmHelper) {
    var layoutColors = baConfig.colors;
    
    // COLORS
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);
    var pieColor = vmHelper.colors.primary.green;

    $scope.colors = vmHelper.colors.primary;
    $scope.chartColors = [$scope.colors.blue, $scope.colors.yellow, $scope.colors.green, $scope.colors.red];
    
    // INIT DATA
    $scope.noData = false;

    // EVENTS
    $scope.$on('updateVm', function(event, startDate, endDate) {
      $scope.startDate = startDate;
      $scope.endDate = endDate;
      $scope.getData(startDate, endDate);  
    });

    $scope.getData = function(startDate, endDate) {
      $scope.getFeedbackStats(startDate, endDate);
    };

    

    // FEEDBACK STATS
    $scope.getFeedbackStats = function(startDate, endDate) {
      // $scope.loading = true;
      $http.get('/api/virtualmarket/feedback?type=stats&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          // $scope.showFeedbackStats(data.rating);
          $scope.showFeedbackReason(data.feedback);
        })
        .finally(function() {
          // $scope.loading= false;
        });    
    };

    // FEEDBACK REASON
    $scope.showFeedbackReason = function(data) {
      $scope.drawChart(data, $scope.colors);
    };

    // chart options
    $scope.getBarChartOptions = function(data, label, colors) { 
      
      var options = {
        color: layoutColors.defaultText,
        data: data,
        title: 'Ulasan',
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
              var hoverInfo = 'Jumlah Ulasan:<br> <b>'+value+'</b>';
              return hoverInfo;
            },
            lineAlpha: 0,
            fillColors: colors.green,
            fillAlphas: 1,
            type: 'column',
            valueField: 'count',
          }
        ],
        rotate: true,
        categoryField: 'reason',
      };

      return vmHelper.getBarChartOptions(options);
    };

    $scope.drawChart =  function(data, colors) {
      var label = '';

      if($scope.chart != undefined) {
        $('#vmFeedbackReason').empty();
      }

      if(data.length == 0) {
        $scope.noData = true;
      } else {
        $scope.chart = AmCharts.makeChart('vmFeedbackReason',$scope.getBarChartOptions(data, label, colors));
        $scope.noData = false;
      }
    };

    $scope.formatRating = function(rating) {
      return vmHelper.formatNumber(rating,false,false);
    };
  }
})();