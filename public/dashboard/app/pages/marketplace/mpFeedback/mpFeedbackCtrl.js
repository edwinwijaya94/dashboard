
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.marketplace')
      .controller('mpFeedbackCtrl', mpFeedbackCtrl);

  /** @ngInject */
  function mpFeedbackCtrl($scope, $timeout, $http, baConfig, baUtil, mpHelper) {
    var layoutColors = baConfig.colors;
    
    // COLORS
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);
    var pieColor = mpHelper.colors.primary.green;

    $scope.colors = mpHelper.colors.primary;
    $scope.chartColors = [$scope.colors.blue, $scope.colors.yellow, $scope.colors.green, $scope.colors.red];
    
    // INIT DATA
    $scope.rating = {
      avg: 0
    };
    
    $scope.noData = false;

    // EVENTS
    $scope.$on('updateMp', function(event, startDate, endDate) {
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
      $http.get('/api/marketplace/feedback?type=stats&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          // data.rating_trend.trend = mpHelper.fixLineChartNullValues(data.rating_trend.trend, data.rating_trend.granularity, ['rating']); // add null points as zero
          // $scope.showRatingTrend(data.rating_trend);
          $scope.showRating(data.rating);
          $scope.showRatingTrend(data.rating_trend);
        })
        .finally(function() {
          // $scope.loading= false;
        });    
    };

    // RATING
    $scope.showRating = function(data) {
      $scope.rating.avg = data.rating;
    };

    $scope.showRatingTrend = function(data) {
      $scope.drawChart(data, $scope.colors);
    };

    // chart options
    $scope.getLineChartOptions = function(data) {
      
      var dateFormat;
      if(data.granularity == 'month')
        dateFormat = 'YYYY-MM';
      else if(data.granularity == 'day')
        dateFormat = 'YYYY-MM-DD';

      var options = {
        color: layoutColors.defaultText,
        data: data.trend,
        title: 'Tren Rating',
        gridColor: layoutColors.border,
        valueLabelFunction: function(y) {
          return mpHelper.formatNumber(y,false,true);
        }, 
        graphs: [
          {
            id: 'g1',
            balloonFunction: function(item, graph) {
              var value = item.values.value;
              var hoverInfo = '';
              hoverInfo += 'Rating:<br> <b>'+value+'</b>';
              return hoverInfo;
            },
            bullet: 'round',
            bulletSize: 8,
            lineColor: $scope.colors.green,
            lineThickness: 2,
            type: 'line',
            valueField: 'rating'
          }
        ],
        dataDateFormat: dateFormat,
        categoryField: 'date',
        categoryLabelFunction: function(valueText, date, categoryAxis) {
          if(data.granularity == 'month')
            return mpHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
          else if(data.granularity == 'day')
            return date.getDate()+' '+mpHelper.formatMonth(date.getMonth());
        }
      };
      
      return mpHelper.getLineChartOptions(options);
    };



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

      return mpHelper.getBarChartOptions(options);
    };

    $scope.drawChart =  function(data, colors) {
      var label = '';

      if($scope.chart != undefined) {
        $('#mpRatingTrend').empty();
      }

      if(data.length == 0) {
        $scope.noData = true;
      } else {
        $scope.chart = AmCharts.makeChart('mpRatingTrend',$scope.getLineChartOptions(data));
        $scope.noData = false;
      }
    };

    $scope.formatRating = function(rating) {
      return mpHelper.formatNumber(rating,false,false);
    };
  }
})();