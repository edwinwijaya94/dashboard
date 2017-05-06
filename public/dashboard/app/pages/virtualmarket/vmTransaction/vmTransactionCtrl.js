
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket')
      .controller('vmTransactionCtrl', vmTransactionCtrl);

  /** @ngInject */
  function vmTransactionCtrl($scope, $timeout, $http, baConfig, baUtil, vmHelper) {
    // var layoutColors = baConfig.colors;
    // $scope.colors = [layoutColors.primary, layoutColors.warning, layoutColors.danger, layoutColors.info, layoutColors.success, layoutColors.primaryDark];
    
    // COLORS
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);
    var pieColor = vmHelper.colors.primary.green;

    var chartColors = vmHelper.colors.primary;
    $scope.colors = [chartColors.blue, chartColors.yellow, chartColors.green, chartColors.red];
    
    // DEFAULT CHART SETTINGS
    $scope.charts = [{
      color: pieColor,
      description: 'Transaksi Sukses',
      stats: 0,
      percent: 0,
      icon: 'person',
    }];

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
      $scope.charts[0].stats = success.count+'/'+(success.count+failed.count);
      $scope.charts[0].percent = percentage;
    }

    $scope.showPlatform = function(data) {
      var platforms = data;
      var total = 0;
      for(var i=0; i<platforms.length; i++) {
        total += parseInt(platforms[i].count);
      }
      for(var i=0; i<platforms.length; i++) {
        platforms[i].percentage = (parseInt(platforms[i].count) / total * 100).toFixed(2);
        platforms[i].color = $scope.colors[i];
      }

      $scope.platforms = platforms;
    }

    $scope.formatPlatform = function(platform) {
      return platform.name + '(' + Math.round(platform.percentage) + ' %)';
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
          data = vmHelper.fixLineChartNullValues(data); // add null points as zero
          $scope.data = data; // update data
          $scope.drawChart($scope.data, $scope.transactionHistory.metric, $scope.colors);
        })
        .finally(function() {
          $scope.loading= false;
        });    
    };

    // chart options
    $scope.getLineChartOptions = function(data, metric, label, colors) { 
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
          $scope.chart = new Morris.Line($scope.getLineChartOptions(data, metric, label, colors));
        }
      } else {
        $('#vmTransactionByHistory').empty();
        if(data.length == 0) {
          $scope.noData = true;
        } else {
          $scope.chart = new Morris.Line($scope.getLineChartOptions(data, metric, label, colors));
          $scope.noData = false;
        } 
      }
    };

    $scope.changeMetric = function() {
      $scope.drawChart($scope.data, $scope.transactionHistory.metric, $scope.colors);
    };
  }
})();