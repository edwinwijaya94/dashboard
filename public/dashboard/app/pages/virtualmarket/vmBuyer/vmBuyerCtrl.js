
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

    $scope.colors = vmHelper.colors.primary;
    $scope.chartColors = [$scope.colors.blue, $scope.colors.yellow, $scope.colors.green, $scope.colors.red];
    
    // DEFAULT CHART SETTINGS
    $scope.stats = {
      unique_buyers: {
        description: 'Jumlah Pembeli',
        info: 'Persentase perbandingan dihitung dengan periode sebelumnya',
        value: 0,
        prevValue: 0,
        change: 0, // as percentage
        icon:'ion-arrow-up-b',
        iconColor: $scope.colors.green
      },
      returning_buyers: {
        description: 'Jumlah Pelanggan',
        info: 'Persentase perbandingan dihitung dengan periode sebelumnya',
        value: 0,
        prevValue: 0,
        change: 0,
        icon:'ion-arrow-up-b',
        iconColor: $scope.colors.green
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
      for(var metric in data) {
        var stat = {};
        stat.description = $scope.stats[metric].description;
        stat.info = $scope.stats[metric].info;
        stat.value = parseInt(data[metric].current_period);
        stat.prevValue = parseInt(data[metric].prev_period);
        var change = ((stat.value-stat.prevValue)/(stat.prevValue)*100).toFixed(2);
        stat.change = isFinite(change)? change:0;
        if(stat.change>=0) {
          stat.icon = 'ion-arrow-up-b';
          stat.iconColor = $scope.colors.green;
        } else {
          stat.change *= -1;
          stat.icon = 'ion-arrow-down-b';
          stat.iconColor = $scope.colors.red;
        }
        $scope.stats[metric] = stat;

        // $scope.stats[metric].value = stat.value;
        // $scope.stats[metric].prevValue = stat.prevValue;
        // $scope.stats[metric].change = stat.change;
        // $scope.stats[metric].icon = stat.icon;
        // $scope.stats[metric].iconColor = stat.iconColor;
      }
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
          $scope.drawChart($scope.data, $scope.chartColors);
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
        lineColors: [$scope.colors.green],
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