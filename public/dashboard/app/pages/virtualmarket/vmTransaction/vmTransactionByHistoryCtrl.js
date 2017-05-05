/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket')
      .controller('vmTransactionByHistoryCtrl', vmTransactionByHistoryCtrl);

  /** @ngInject */
  function vmTransactionByHistoryCtrl($scope, $window, $http, baConfig, vmHelper) {
    // var layoutColors = baConfig.colors;
    // $scope.colors = [layoutColors.primary, layoutColors.warning, layoutColors.danger, layoutColors.info, layoutColors.success, layoutColors.primaryDark];
    var chartColors = vmHelper.colors.primary;
    $scope.colors = [chartColors.blue, chartColors.green, chartColors.yellow, chartColors.red,]
    
    $scope.noData = false;
    $scope.$on('updateVm', function(event, startDate, endDate) {
      $scope.getData(startDate, endDate);
    });

    $scope.transactionMetric = 'count';

    $scope.getData = function(startDate, endDate) {
      $scope.loading = true;
      $http.get('/api/virtualmarket/transaction?type=history&aggregate=sum&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var resp = res.data.data;
          var data = [];
          var i;
          for(i=0; i<resp.length; i++) {
            var x = {};
            x.time = resp[i].yr+'-'+resp[i].mo;
            x.year = resp[i].yr;
            x.month = resp[i].mo;
            x.count = resp[i].count;
            x.value = resp[i].value;
            data.push(x);
          }

          $scope.data = data; // update data
          $scope.drawChart($scope.data, $scope.transactionMetric, $scope.colors);
        })
        .finally(function() {
          $scope.loading= false;
        });    
    };

    // chart
    $scope.getChartOptions = function(data, metric, label, colors) { 
      return {
        element: 'vmTransactionByHistory',
        data: data,
        xkey: 'time',
        ykeys: [metric],
        labels: [label],
        xLabels: 'month',
        xLabelFormat: function(x){
          return vmHelper.formatMonth(x.getMonth()+1)+' \''+x.getFullYear().toString().substr(-2);
        },
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

          if(metric == 'value')
            return vmHelper.formatCurrency(yValue);
          else 
            return yValue;
        },
        hoverCallback: function (index, options, content, row) {
          var hoverInfo = '<p>'+vmHelper.formatMonth(row.month)+' '+row.year+'</p>';
          if(metric == 'count')
            hoverInfo += '<p>'+'Jumlah: '+row.count+'</p>';
          else if(metric == 'value')
            hoverInfo += '<p>'+'Nilai: '+vmHelper.formatCurrency(row.value.toString())+'</p>';

          return hoverInfo;
        },
        lineColors: [chartColors.green],
        smooth: false,
        continuousLine: true,
        // xLabelAngle: 30,
      };
    };

    $scope.drawChart =  function(data, metric, colors) {
      var label = '';
      if(metric == 'count')
        label = 'Jumlah Transaksi'
      else if(metric == 'value')
        label = 'Nilai Transaksi'

      if($scope.chart == undefined) {
        if(data.length == 0) {
          $scope.noData = true;
        } else {
          $scope.noData = false;
          $scope.chart = new Morris.Line($scope.getChartOptions(data, metric, label, colors));
        }
      } else {
        $('#vmTransactionByHistory').empty();
        if(data.length == 0) {
          $scope.noData = true;
        } else {
          $scope.chart = new Morris.Line($scope.getChartOptions(data, metric, label, colors));
          $scope.noData = false;
        } 
      }
    };

    $scope.changeMetric = function() {
      $scope.drawChart($scope.data, $scope.transactionMetric, $scope.colors);
    };

    angular.element($window).bind('resize', function () {
      //$window.Morris.Grid.prototype.redraw();
    });
  }

})();