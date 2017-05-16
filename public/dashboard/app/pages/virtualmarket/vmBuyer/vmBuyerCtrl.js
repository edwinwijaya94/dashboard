
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket')
      .controller('vmBuyerCtrl', vmBuyerCtrl);

  /** @ngInject */
  function vmBuyerCtrl($scope, $timeout, $http, baConfig, baUtil, vmHelper) {
    var layoutColors = baConfig.colors;
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
          $scope.drawChart($scope.data, $scope.colors);
        })
        .finally(function() {
          $scope.loading= false;
        });    
    };

    // chart options
    $scope.getLineChartOptions = function(data, label, colors) { 
      return {
        type: 'serial',
        theme: 'blur',
        color: layoutColors.defaultText,
        marginTop: 10,
        marginRight: 15,
        marginBottom: 10,
        dataProvider: data,
        valueAxes: [
          {
            axisAlpha: 0,
            title: 'Jumlah Pembeli',
            position: 'left',
            gridAlpha: 0.5,
            gridColor: layoutColors.border,
            minimum: 0,
            integersOnly: true,
            labelFunction: function(y) {
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
            }
          }
        ],
        graphs: [
          {
            id: 'g1',
            balloonFunction: function(item, graph) {
              var value = item.values.value;
              var hoverInfo = 'Jumlah Pembeli:<br> <b>'+value+'</b>';
              return hoverInfo;
            },
            bullet: 'round',
            bulletSize: 8,
            lineColor: colors.green,
            lineThickness: 2,
            type: 'line',
            valueField: 'count'
          }
        ],
        dataDateFormat: 'YYYY-MM',
        categoryField: 'time',
        categoryAxis: {
          parseDates: true,
          equalSpacing: true,
          labelFunction: function(valueText, date, categoryAxis) {
            return vmHelper.formatMonth(date.getMonth()+1)+' \''+date.getFullYear().toString().substr(-2);
          }
        },
        chartCursor: {
         categoryBalloonEnabled: false,
        },
        creditsPosition: 'bottom-right'
      };
    };

    $scope.drawChart =  function(data, colors) {
      var label = '';
      if($scope.chart != undefined) {
        $('#vmBuyerByHistory').empty();
      }
       
      if(data.length == 0) {
        $scope.noData = true;
      } else {
        // $scope.chart = new Morris.Line($scope.getLineChartOptions(data, label, colors));
        $scope.chart = AmCharts.makeChart('vmBuyerByHistory',$scope.getLineChartOptions(data, label, colors));
        $scope.noData = false;
      }
    };

  }
})();