
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.marketplace')
      .controller('mpProductTrendCtrl', mpProductTrendCtrl);

  /** @ngInject */
  function mpProductTrendCtrl($scope, $timeout, $http, baConfig, baUtil, mpHelper) {
    // COLORS
    var layoutColors = baConfig.colors;
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);
    var pieColor = mpHelper.colors.primary.green;

    $scope.colors = mpHelper.colors.primary;

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
          startPoint = date.getDate()+' '+mpHelper.formatMonth(date.getMonth());
        }
      }
      var date = new Date(data.trend[data.trend.length-1].date);
      endPoint = date.getDate()+' '+mpHelper.formatMonth(date.getMonth());

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
          // return mpHelper.formatNumber(y,isCurrency,true);
          return mpHelper.formatNumber(y,false,true);
        }, 
        graphs: [
          {
            id: 'g1',
            balloonFunction: function(item, graph) {
              var date = new Date(item.category);
              var formattedDate = date.getDate()+' '+mpHelper.formatMonth(date.getMonth());
              var value = item.values.value;
              var hoverInfo = '';
              // if(metric == 'count')
              //   hoverInfo += 'Jumlah Transaksi:<br> <b>'+value+'</b>';
              // else if(metric == 'value')
              //   hoverInfo += 'Nilai Transaksi:<br> <b>'+mpHelper.formatNumber(value,true,false)+'</b>';

              hoverInfo += formattedDate+'<br> Jumlah Permintaan:<br> <b>'+mpHelper.formatNumber(value,false,false)+'</b>';
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
          //   return mpHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
          // else if(data.granularity == 'day')
          //   return date.getDate()+' '+mpHelper.formatMonth(date.getMonth());
          return date.getDate()+' '+mpHelper.formatMonth(date.getMonth());
        },
        categoryAxis: {
          guides: [{
            category: '3 Jul',
            toCategory: '4 Jul',
            lineColor: "#CC0000",
            lineAlpha: 1,
            fillAlpha: 0.2,
            fillColor: "#CC0000",
            dashLength: 2,
            inside: true,
            labelRotation: 0,
            label: "Prediksi"
          }]
        }
      };
      
      return mpHelper.getLineChartOptions(options);
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
      console.log('MODAL');
      console.log($scope.productTrendData);
      $scope.chart = AmCharts.makeChart('mpProductTrend',$scope.getChartOptions($scope.productTrendData, $scope.colors));
    };

    // draw chart
    $scope.drawTrendChart();

  }
})();