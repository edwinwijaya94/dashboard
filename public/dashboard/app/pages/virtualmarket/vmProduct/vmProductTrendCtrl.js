
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket')
      .controller('vmProductTrendCtrl', vmProductTrendCtrl);

  /** @ngInject */
  function vmProductTrendCtrl($scope, $timeout, $http, baConfig, baUtil, vmHelper) {
    // COLORS
    var layoutColors = baConfig.colors;
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);
    var pieColor = vmHelper.colors.primary.green;

    $scope.colors = vmHelper.colors.primary;

    // INIT DATA
    

    // TREND AND PREDICTION
    $scope.getChartOptions = function(data, colors) {

      var dateFormat;
      // if(data.granularity == 'month')
      //   dateFormat = 'YYYY-MM';
      // else if(data.granularity == 'day')
      //   dateFormat = 'YYYY-MM-DD';
      var startPoint, endPoint;
      for(var i=0; i<data.trend.length-1; i++) {
        var date = moment(data.trend[i+1].date, 'YYYY-MM-DD');
        if(date.isAfter(moment(),'day')) {
          var date = new Date(data.trend[i].date);
          startPoint = date;
          break;
        }
      }
      var date = new Date(data.trend[data.trend.length-1].date);
      endPoint = date;

      dateFormat = 'YYYY-MM-DD';
      var options = {
        color: layoutColors.defaultText,
        data: data.trend,
        title: 'Jumlah Permintaan',
        gridColor: layoutColors.border,
        valueLabelFunction: function(y) {
          // var isCurrency;
          // if(metric == 'value')
          //   isCurrency = true;
          // else 
          //   isCurrency = false;
          // return vmHelper.formatNumber(y,isCurrency,true);
          return vmHelper.formatNumber(y,false,true);
        }, 
        graphs: [
          {
            id: 'g1',
            balloonFunction: function(item, graph) {
              var date = new Date(item.category);
              var formattedDate = date.getDate()+' '+vmHelper.formatMonth(date.getMonth());
              var value = item.values.value;
              var hoverInfo = '';
              // if(metric == 'count')
              //   hoverInfo += 'Jumlah Transaksi:<br> <b>'+value+'</b>';
              // else if(metric == 'value')
              //   hoverInfo += 'Nilai Transaksi:<br> <b>'+vmHelper.formatNumber(value,true,false)+'</b>';

              hoverInfo += formattedDate+'<br> Jumlah Permintaan:<br> <b>'+vmHelper.formatNumber(value,false,false)+'</b>';
              return hoverInfo;
            },
            bullet: 'round',
            bulletSize: 8,
            lineColor: colors.green,
            lineThickness: 2,
            type: 'line',
            valueField: 'count',
            dashLengthField: 'dashLength'
          }
        ],
        dataDateFormat: dateFormat,
        categoryField: 'date',
        categoryLabelFunction: function(valueText, date, categoryAxis) {
          // if(data.granularity == 'month')
          //   return vmHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
          // else if(data.granularity == 'day')
          //   return date.getDate()+' '+vmHelper.formatMonth(date.getMonth());
          return date.getDate()+' '+vmHelper.formatMonth(date.getMonth());
        },
      };
      
      var chartOptions = vmHelper.getLineChartOptions(options);
      chartOptions.categoryAxis.guides = [{
        date: startPoint,
        toDate: endPoint,
        lineColor: layoutColors.warning,
        lineAlpha: 1,
        fillAlpha: 0.2,
        fillColor: layoutColors.warning,
        dashLength: 2,
        inside: true,
        labelRotation: 0,
        label: 'Prediksi',
        position: 'top'
      }];
      return chartOptions;
    };

    $scope.drawTrendChart =  function() {
      // var label = '';

      // if($scope.chart != undefined) {
      //   $('#vmTransactionByHistory').empty();
      // }

      // if(data.transaction.length == 0) {
      //   $scope.noData = true;
      // } else {
      //   $scope.chart = AmCharts.makeChart('vmProductTrend',$scope.getChartOptions(data));
      //   $scope.noData = false;
      // }
      $scope.chart = AmCharts.makeChart('vmProductTrend',$scope.getChartOptions($scope.productTrendData, $scope.colors));
    };

    // draw chart
    $scope.drawTrendChart();

  }
})();