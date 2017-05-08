
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket')
      .controller('vmBuyerCtrl', vmBuyerCtrl);

  /** @ngInject */
  function vmBuyerCtrl($scope, $timeout, $http, baConfig, baUtil, vmHelper) {
    // var layoutColors = baConfig.colors;
    // $scope.colors = [layoutColors.primary, layoutColors.warning, layoutColors.danger, layoutColors.info, layoutColors.success, layoutColors.primaryDark];
    
    // COLORS
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);
    var pieColor = vmHelper.colors.primary.green;

    var chartColors = vmHelper.colors.primary;
    $scope.colors = [chartColors.blue, chartColors.yellow, chartColors.green, chartColors.red];
    
    // DEFAULT CHART SETTINGS
    $scope.stats = {
      unique_buyers: {
        description: 'Jumlah Pembeli',
        value: 0,
      },
      returning_buyers: {
        description: 'Jumlah Pelanggan',
        value: 0,
      }
    };

    $scope.noData = false;

    // EVENTS
    $scope.$on('updateVm', function(event, startDate, endDate) {
      $scope.getData(startDate, endDate);  
    });

    $scope.getData = function(startDate, endDate) {
      $scope.getStats(startDate, endDate);
      $scope.getHistory(startDate, endDate);
    }

    // BUYER STATS
    $scope.getStats = function(startDate, endDate) {
      // $scope.loading = true;
      $http.get('/api/virtualmarket/buyer?type=stats&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          $scope.showBuyerStats(data);
        })
        .finally(function() {
          // $scope.loading= false;
        });    
    }

    $scope.showBuyerStats = function(data) {
      $scope.stats.unique_buyers.value = parseInt(data.unique_buyers);
      $scope.stats.returning_buyers.value = parseInt(data.returning_buyers);
    }

    // BUYER HISTORY
    $scope.getHistory = function(startDate, endDate) {
      $scope.loading = true;
      $http.get('/api/virtualmarket/buyer?type=history&start_date='+startDate+'&end_date='+endDate)
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
            data.push(x);
          }
          data = vmHelper.fixLineChartNullValues(data, ['count']); // add null points as zero
          $scope.data = data; // update data
          $scope.drawChart($scope.data, $scope.colors);
        })
        .finally(function() {
          $scope.loading= false;
        });    
    };

    // chart options
    $scope.getLineChartOptions = function(data, label, colors) { 
      return {
        element: 'vmBuyerByHistory',
        data: data,
        xkey: 'time',
        ykeys: ['count'],
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

          return yValue;
        },
        hoverCallback: function (index, options, content, row) {
          var hoverInfo = '<p>'+vmHelper.formatMonth(row.month)+' '+row.year+'</p>';
          hoverInfo += '<p>'+'Jumlah: '+row.count+'</p>';
          return hoverInfo;
        },
        lineColors: [chartColors.green],
        smooth: false,
        continuousLine: true,
        // xLabelAngle: 30,
      };
    };

    $scope.drawChart =  function(data, colors) {
      var label = '';

      if($scope.chart == undefined) {
        if(data.length == 0) {
          $scope.noData = true;
        } else {
          $scope.chart = new Morris.Line($scope.getLineChartOptions(data, label, colors));
          $scope.noData = false;
        }
      } else {
        $('#vmBuyerByHistory').empty();
        if(data.length == 0) {
          $scope.noData = true;
        } else {
          $scope.chart = new Morris.Line($scope.getLineChartOptions(data, label, colors));
          $scope.noData = false;
        } 
      }
    };

  }
})();