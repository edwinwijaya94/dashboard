
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket')
      .controller('vmTransactionCtrl', vmTransactionCtrl);

  /** @ngInject */
  function vmTransactionCtrl($scope, $timeout, $http, baConfig, baUtil, vmHelper) {
    var layoutColors = baConfig.colors;
    // $scope.colors = [layoutColors.primary, layoutColors.warning, layoutColors.danger, layoutColors.info, layoutColors.success, layoutColors.primaryDark];
    
    // COLORS
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);
    var pieColor = vmHelper.colors.primary.green;

    $scope.colors = vmHelper.colors.primary;
    $scope.chartColors = [$scope.colors.blue, $scope.colors.yellow, $scope.colors.green, $scope.colors.red];
    
    // DEFAULT CHART SETTINGS
    $scope.stats = {
      transaction_status: {
        color: pieColor,
        description: 'Transaksi Sukses',
        info: '',
        value: 0,
        percent: 0,
        showPie: true,
        showChange: false,
        change: 0,
        prevValue: 0,
        icon:'ion-arrow-up-b',
        iconColor: $scope.colors.green,
      },
      transaction_avg: {
        color: pieColor,
        description: 'Rata Rata',
        info: '',
        value: 0,
        percent: 0,
        showPie: false,
        showChange: true,
        change: 0,
        prevValue: 0,
        icon:'ion-arrow-up-b',
        iconColor: $scope.colors.green,
      },
      transaction_value: {
        color: pieColor,
        description: 'Nilai Transaksi',
        info: '',
        value: vmHelper.formatCurrency('0'),
        percent: 0,
        showPie: false,
        showChange: true,
        change: 0,
        prevValue: 0,
        icon:'ion-arrow-up-b',
        iconColor: $scope.colors.green,
      }
    };

    $scope.options = {
      barColor: pieColor,
      trackColor: trackColor,
      size: 84,
      scaleLength: 0,
      animate: { duration: 1000, enabled: true },
      lineWidth: 9,
      lineCap: 'round',
    };

    $scope.noData = false;
    $scope.transactionHistory = {metric : 'count'};

    // EVENTS
    $scope.$on('updateVm', function(event, startDate, endDate) {
      $scope.getData(startDate, endDate);  
    });

    $scope.getData = function(startDate, endDate) {
      $scope.getStats(startDate, endDate);
      $scope.getHistory(startDate, endDate);
    }

    // TRANSACTION STATS
    $scope.getStats = function(startDate, endDate) {
      // $scope.loading = true;
      $http.get('/api/virtualmarket/transaction?type=stats&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          $scope.showSuccessRate(data.transaction_status);
          $scope.showTransaction(data.transaction);
          $scope.showPlatform(data.app_platform);
        })
        .finally(function() {
          // $scope.loading= false;
        });    
    }

    $scope.showSuccessRate = function(data) {
      var success = {
        status: 'success',
        count: 0,
        sum: 0
      };
      var failed = {
        status: 'failed',
        count: 0,
        sum: 0
      };

      for(var i=0; i<data.length; i++ ) {
        if(data[i].status == 'success') {
          success = data[i];
          success.count = parseInt(success.count);
        }
        else if (data[i].status == 'failed') {
          failed = data[i]; 
          failed.count = parseInt(failed.count);
        }
      }

      var percentage = (success.count + failed.count)>0 ? Math.round(success.count / (success.count + failed.count) * 100) : 0;

      // update chart
      $scope.stats.transaction_status.value = success.count+'/'+(success.count+failed.count);
      $scope.stats.transaction_status.percent = percentage;
    }

    $scope.showPlatform = function(data) {
      var platforms = data;
      var total = 0;
      for(var i=0; i<platforms.length; i++) {
        total += parseInt(platforms[i].count);
      }
      for(var i=0; i<platforms.length; i++) {
        platforms[i].percentage = (parseInt(platforms[i].count) / total * 100).toFixed(2);
        platforms[i].color = $scope.chartColors[i];
      }

      $scope.platforms = platforms;
    }

    $scope.formatPlatform = function(platform) {
      return platform.name + '(' + Math.round(platform.percentage) + ' %)';
    }

    $scope.showTransaction = function(data) {
      // transaction count
      var stat = {};
      stat.description = $scope.stats.transaction_avg.description;
      stat.info = $scope.stats.transaction_avg.info;
      stat.showPie = $scope.stats.transaction_avg.showPie;
      stat.showChange = $scope.stats.transaction_avg.showChange;
      stat.value = parseInt(data.current.average);
      stat.prevValue = parseInt(data.prev.average);
      var change = ((stat.value-stat.prevValue)/(stat.prevValue)*100).toFixed(2);
      // format currency
      stat.value = vmHelper.formatCurrency(data.current.average.toString());
      stat.change = isFinite(change)? change:0;
      if(stat.change>=0) {
        stat.icon = 'ion-arrow-up-b';
        stat.iconColor = $scope.colors.green;
      } else {
        stat.change *= -1;
        stat.icon = 'ion-arrow-down-b';
        stat.iconColor = $scope.colors.red;
      }
      $scope.stats.transaction_avg = stat;

      // transaction value
      stat = {};
      stat.description = $scope.stats.transaction_value.description;
      stat.info = $scope.stats.transaction_value.info;
      stat.showPie = $scope.stats.transaction_value.showPie;
      stat.showChange = $scope.stats.transaction_value.showChange;
      stat.value = data.current.value;
      stat.prevValue = parseInt(data.prev.value);
      var change = ((stat.value-stat.prevValue)/(stat.prevValue)*100).toFixed(2);
      // format currency
      stat.value = vmHelper.formatCurrency(data.current.value.toString());
      stat.change = isFinite(change)? change:0;
      if(stat.change>=0) {
        stat.icon = 'ion-arrow-up-b';
        stat.iconColor = $scope.colors.green;
      } else {
        stat.change *= -1;
        stat.icon = 'ion-arrow-down-b';
        stat.iconColor = $scope.colors.red;
      }
      
      $scope.stats.transaction_value = stat;
    }

    // TRANSACTION HISTORY
    $scope.getHistory = function(startDate, endDate) {
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
          data = vmHelper.fixLineChartNullValues(data, ['count', 'value']); // add null points as zero
          $scope.data = data; // update data
          $scope.drawChart($scope.data, $scope.transactionHistory.metric, $scope.colors);
        })
        .finally(function() {
          $scope.loading= false;
        });    
    };

    // chart options
    $scope.getLineChartOptions = function(data, metric, label, colors) {
      var title = '';
      if(metric == 'count')
        title = 'Jumlah Transaksi';
      else if(metric == 'value')
        title = 'Nilai Transaksi';

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
            title: title,
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

              if(metric == 'value')
                return vmHelper.formatCurrency(yValue);
              else 
                return yValue;
            }
          }
        ],
        graphs: [
          {
            id: 'g1',
            balloonFunction: function(item, graph) {
              var value = item.values.value;
              var hoverInfo = '';
              if(metric == 'count')
                hoverInfo += 'Jumlah Transaksi:<br> <b>'+value+'</b>';
              else if(metric == 'value')
                hoverInfo += 'Nilai Transaksi:<br> <b>'+vmHelper.formatCurrency(value.toString())+'</b>';
              return hoverInfo;
            },
            bullet: 'round',
            bulletSize: 8,
            lineColor: colors.green,
            lineThickness: 2,
            type: 'line',
            valueField: metric
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

    $scope.drawChart =  function(data, metric, colors) {
      var label = '';
      if(metric == 'count')
        label = 'Jumlah Transaksi'
      else if(metric == 'value')
        label = 'Nilai Transaksi'

      if($scope.chart != undefined) {
        $('#vmTransactionByHistory').empty();
      }

      if(data.length == 0) {
        $scope.noData = true;
      } else {
        $scope.chart = AmCharts.makeChart('vmTransactionByHistory',$scope.getLineChartOptions(data, metric, label, colors));
        $scope.noData = false;
      }
    };

    $scope.changeMetric = function() {
      $scope.drawChart($scope.data, $scope.transactionHistory.metric, $scope.colors);
    };

  }
})();