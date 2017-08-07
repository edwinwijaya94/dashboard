
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
      if(data.granularity == 'month')
        dateFormat = 'YYYY-MM';
      else if(data.granularity == 'day') {
        dateFormat = 'YYYY-MM-DD';

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
      }

      var countValueLabelFunction =  function(y) {
        return vmHelper.formatNumber(y,false,true);
      } 
      var priceValueLabelFunction =  function(y) {
        return vmHelper.formatNumber(y,true,true);
      }

      var options = {
        color: layoutColors.defaultText,
        data: data.trend,
        title: 'Tren Produk',
        gridColor: layoutColors.border,
        
        graphs: [
          {
            id: 'g1',
            valueAxis: 'v1',
            title: 'Tren Permintaan',
            balloonFunction: function(item, graph) {
              var value = item.values.value;
              var hoverInfo = vmHelper.formatNumber(value,false,false);
              return hoverInfo;
            },
            bullet: 'round',
            bulletSize: 8,
            lineColor: colors.blue,
            lineThickness: 2,
            type: 'line',
            valueField: 'count',
            dashLengthField: 'dashLength'
          },
          {
            id: 'g2',
            valueAxis: 'v2',
            title: 'Tren Harga',
            // balloonText: 'Jumlah: <b>[[count]]</b><br>Nilai: <b>Rp [[value]]</b>',
            balloonFunction: function(item, graph) {
              var value = item.values.value;
              var hoverInfo = vmHelper.formatNumber(value,true,false);
              return hoverInfo;
            },
            bullet: 'round',
            bulletSize: 8,
            lineColor: '#FF9900',
            lineThickness: 2,
            type: 'line',
            valueField: 'price',
            dashLengthField: 'dashLength'
          }
        ],
        dataDateFormat: dateFormat,
        categoryField: 'date',
        categoryLabelFunction: function(valueText, date, categoryAxis) {
          if(data.granularity == 'month')
            return vmHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
          else if(data.granularity == 'day')
            return date.getDate()+' '+vmHelper.formatMonth(date.getMonth());
        },
        valueAxes: [{
          id:'v1',
          axisColor: colors.blue,
          axisThickness: 2,
          axisAlpha: 1,
          position: 'left',
          labelFunction: countValueLabelFunction,
          minimum: 0,
          integersOnly: true,
        }, {
          id:'v2',
          axisColor: '#FF9900',
          axisThickness: 2,
          axisAlpha: 1,
          position: 'right',
          labelFunction: priceValueLabelFunction,
          minimum: 0,
          integersOnly: true,
        },],
      };
      
      var chartOptions = vmHelper.getLineChartOptions(options);
      if(data.granularity == 'day') {
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
      }
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

    $scope.formatPrice = function(number) {
      if(number < 0)
        number *= -1;
      return vmHelper.formatNumber(parseInt(number),true,false);
    };

    $scope.formatNumber = function(number) {
      if(number < 0)
        number *= -1;
      return vmHelper.formatNumber(parseInt(number),false,false);
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

  }
})();