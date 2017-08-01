
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
    $scope.stats = {
      feedback_count: {
        color: pieColor,
        description: 'Jumlah Ulasan',
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
    }
    $scope.feedback = {
      metric:'distribution'
    };
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
          $scope.showFeedbackCount(data.count);
          $scope.showFeedbackReason(data.feedback);

          // trends
          var reasons = [];
          for(var i=0; i<data.trend.reasons.length; i++){
            reasons.push(data.trend.reasons[i].reason);
          }
          var feedbackTrend = vmHelper.fixLineChartNullValues(data.trend.trend, data.trend.granularity, reasons); // add null points as zero
          data.trend.trend = feedbackTrend;
          $scope.showFeedbackTrend(data.trend);
        })
        .finally(function() {
          // $scope.loading= false;
        });    
    };

    $scope.showFeedbackCount = function(data) {
      
      //feedback count
      var stat = {};
      stat.description = $scope.stats.feedback_count.description;
      stat.info = $scope.stats.feedback_count.info;
      stat.showPie = $scope.stats.feedback_count.showPie;
      stat.showChange = $scope.stats.feedback_count.showChange;
      stat.value = parseInt(data.current);
      stat.prevValue = parseInt(data.prev);
      var change = ((stat.value-stat.prevValue)/(stat.prevValue)*100).toFixed(2);
      stat.change = isFinite(change)? change:0;
      if(stat.change>=0) {
        stat.icon = 'ion-arrow-up-b';
        stat.iconColor = $scope.colors.red;
      } else {
        stat.change *= -1;
        stat.icon = 'ion-arrow-down-b';
        stat.iconColor = $scope.colors.green;
      }
      stat.colSize = $scope.stats.feedback_count.colSize;
      stat.value = vmHelper.formatNumber(stat.value,false,false);
      stat.change = vmHelper.formatNumber(stat.change,false,false)+'%';
      $scope.stats.feedback_count = stat;
      
    }


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
            fillColors: colors.yellow,
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

    $scope.showFeedbackTrend = function(data) {
      if($scope.chart != undefined) {
        $('#vmFeedbackTrend').empty();
      }

      if(data.trend.length == 0) {
        $scope.noData = true;
      } else {
        $scope.chart = AmCharts.makeChart('vmFeedbackTrend',$scope.getFeedbackTrendChartOptions(data, $scope.chartColors));
        $scope.noData = false;
      }
    }

    $scope.getFeedbackTrendChartOptions = function(data, colors) {

      var dateFormat;
      if(data.granularity == 'month')
        dateFormat = 'YYYY-MM';
      else if(data.granularity == 'day')
        dateFormat = 'YYYY-MM-DD';

      var valueLabelFunction = function(y) {
        return vmHelper.formatNumber(y,false,true);
      };

      // settings
      var graphs = [];
      var valueAxes = [];
      for(var i=0; i<data.reasons.length; i++){
        graphs.push({
          id: 'g'+(i+1),
          valueAxis: 'v1',
          title: data.reasons[i].reason,
          balloonText: '[['+data.reasons[i].reason+']]',
          bullet: 'round',
          bulletSize: 8,
          lineColor: colors[i%colors.length],
          lineThickness: 2,
          type: 'line',
          valueField: data.reasons[i].reason,
        });
        // valueAxes.push({
        //   id:'v'+(i+1),
        //   axisColor: colors[i%colors.length],
        //   axisThickness: 2,
        //   axisAlpha: 1,
        //   position: 'left',
        //   labelFunction: valueLabelFunction,
        //   minimum: 0,
        //   integersOnly: true,
        // });
      }
      
      var options = {
        color: layoutColors.defaultText,
        data: data.trend,
        title: 'Jumlah Ulasan',
        gridColor: layoutColors.border,
        // valueLabelFunction: function(y) {
        //   return vmHelper.formatNumber(y,false,true);
        // }, 
        graphs: graphs,
        dataDateFormat: dateFormat,
        categoryField: 'date',
        categoryAxis: {
             gridThickness: 0
        },
        categoryLabelFunction: function(valueText, date, categoryAxis) {
          if(data.granularity == 'month')
            return vmHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
          else if(data.granularity == 'day')
            return date.getDate()+' '+vmHelper.formatMonth(date.getMonth());
        },
        valueAxes: [{
          id:'v1',
          axisColor: '#000000',
          axisThickness: 2,
          axisAlpha: 1,
          position: 'left',
          labelFunction: valueLabelFunction,
          minimum: 0,
          integersOnly: true,
        }],
      };
      
      var chartOptions = vmHelper.getLineChartOptions(options);
      chartOptions.legend = {
        useGraphSettings: true,
        valueFunction: function(graphDataItem, valueText) {
          return '';
        },
        valueWidth:0
      };
      chartOptions.chartCursor.categoryBalloonEnabled = true;
      chartOptions.chartCursor.categoryBalloonFunction = function(date) {
        if(data.granularity == 'month')
          return vmHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
        else if(data.granularity == 'day')
          return date.getDate()+' '+vmHelper.formatMonth(date.getMonth());
      };
      return chartOptions;
    };

    $scope.formatRating = function(rating) {
      return vmHelper.formatNumber(rating,false,false);
    };

  }
})();