
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
      transaction_count: {
        color: pieColor,
        description: 'Jumlah Transaksi',
        info: '',
        value: 0,
        percent: 0,
        showPie: false,
        showChange: true,
        change: 0,
        prevValue: 0,
        icon:'ion-arrow-up-b',
        iconColor: $scope.colors.green,
        colSize: 3,
      },
      unique_buyers: {
        description: 'Jumlah Pembeli',
        info: 'Persentase perbandingan dihitung dengan periode sebelumnya',
        value: 0,
        percent: 0,
        showPie: false,
        showChange: true,
        change: 0,
        prevValue: 0,
        icon:'ion-arrow-up-b',
        iconColor: $scope.colors.green,
        colSize: 3,
      },
      transaction_value: {
        color: pieColor,
        description: 'Nilai Transaksi',
        info: '',
        value: vmHelper.formatNumber(0,true,false),
        percent: 0,
        showPie: false,
        showChange: true,
        change: 0,
        prevValue: 0,
        icon:'ion-arrow-up-b',
        iconColor: $scope.colors.green,
        colSize: 3,
      },
      transaction_avg: {
        color: pieColor,
        description: 'Rata Rata',
        info: '',
        value: vmHelper.formatNumber(0,true,false),
        percent: 0,
        showPie: false,
        showChange: true,
        change: 0,
        prevValue: 0,
        icon:'ion-arrow-up-b',
        iconColor: $scope.colors.green,
        colSize: 2,
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

    // TRANSACTION STATS AND PLATFORM
    $scope.getStats = function(startDate, endDate) {
      // $scope.loading = true;
      $http.get('/api/virtualmarket/transaction?type=stats&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          $scope.showSuccessRate(data.transaction_status);
          $scope.showTransaction(data.transaction);
          $scope.drawPlatformChart(data.app_platform);
        })
        .finally(function() {
          // $scope.loading= false;
        });

      // buyer stats
      $http.get('/api/virtualmarket/buyer?type=stats&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          $scope.showBuyerStats(data.unique_buyers);
        })
        .finally(function() {
          // $scope.loading= false;
        });        
    }

    $scope.showSuccessRate = function(data) {
      // var success = {
      //   status: 'success',
      //   count: 0,
      //   sum: 0
      // };
      // var failed = {
      //   status: 'failed',
      //   count: 0,
      //   sum: 0
      // };

      // for(var i=0; i<data.length; i++ ) {
      //   if(data[i].status == 'success') {
      //     success = data[i];
      //     success.count = parseInt(success.count);
      //   }
      //   else if (data[i].status == 'failed') {
      //     failed = data[i]; 
      //     failed.count = parseInt(failed.count);
      //   }
      // }

      // var percentage = (success.count + failed.count)>0 ? Math.round(success.count / (success.count + failed.count) * 100) : 0;

      // // update chart
      // $scope.stats.transaction_status.value = success.count+'/'+(success.count+failed.count);
      // $scope.stats.transaction_status.percent = percentage;
      for(var i=0; i<data.length; i++){
        if(data[i].status == 'success')
          data[i].fillColor = $scope.colors.green;
        else
          data[i].fillColor = '#d1cfcf';
      }
      $scope.chart = AmCharts.makeChart('vmTransactionStatus',$scope.getBarChartOptions(data, $scope.colors, 'status'));
    }

    // $scope.showPlatform = function(data) {
    //   var platforms = data;
    //   var total = 0;
    //   for(var i=0; i<platforms.length; i++) {
    //     total += parseInt(platforms[i].count);
    //   }
    //   for(var i=0; i<platforms.length; i++) {
    //     platforms[i].percentage = (parseInt(platforms[i].count) / total * 100).toFixed(2);
    //     platforms[i].color = $scope.chartColors[i];
    //   }

    //   $scope.platforms = platforms;
    // };

    // $scope.formatPlatform = function(platform) {
    //   return platform.name + '(' + Math.round(platform.percentage) + ' %)';
    // };


    // chart options
    $scope.getBarChartOptions = function(data, colors, categoryField) { 
      
      var options = {
        color: layoutColors.defaultText,
        data: data,
        // title: 'Metode',
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
              var hoverInfo = 'Jumlah:<br> <b>'+value+'</b>';
              return hoverInfo;
            },
            lineAlpha: 0,
            fillColorsField: 'fillColor',
            fillAlphas: 1,
            type: 'column',
            valueField: 'count',
          }
        ],
        rotate: true,
        categoryField: categoryField,
      };

      return vmHelper.getBarChartOptions(options);
    };

    $scope.drawPlatformChart = function(data) {
      // var chart = AmCharts.makeChart( "vmTransactionPlatform", {
      //   "type": "pie",
      //   "theme": "light",
      //   "dataProvider": data,
      //   "valueField": "count",
      //   "titleField": "name",
      //    "balloon":{
      //    "fixedPosition":true
      //   },
      //   "export": {
      //     "enabled": true
      //   },
      //   "colors": $scope.chartColors,
      //   "radius": 60,
      //   "marginTop": 0,
      //   "marginBottom": 0,
      //   "marginLeft": 20,
      //   "marginRight": 20,
      //   "pullOutRadius": 0,
      //   "startDuration": 0,
      // } );
      for(var i=0; i<data.length; i++){
        data[i].fillColor = $scope.chartColors[i%4];
      }
      $scope.chart = AmCharts.makeChart('vmTransactionPlatform',$scope.getBarChartOptions(data, $scope.colors, 'name'));
    };

    $scope.showTransaction = function(data) {
      // transaction count
      var stat = {};
      stat.description = $scope.stats.transaction_count.description;
      stat.info = $scope.stats.transaction_count.info;
      stat.showPie = $scope.stats.transaction_count.showPie;
      stat.showChange = $scope.stats.transaction_count.showChange;
      stat.value = parseInt(data.count.current.count);
      stat.prevValue = parseInt(data.count.prev.count);
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
      stat.colSize = $scope.stats.transaction_count.colSize;
      stat.change = vmHelper.formatNumber(stat.change,false,false);
      $scope.stats.transaction_count = stat;

      // transaction average value
      var stat = {};
      stat.description = $scope.stats.transaction_avg.description;
      stat.info = $scope.stats.transaction_avg.info;
      stat.showPie = $scope.stats.transaction_avg.showPie;
      stat.showChange = $scope.stats.transaction_avg.showChange;
      stat.value = parseInt(data.value.current.average);
      stat.prevValue = parseInt(data.value.prev.average);
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
      stat.colSize = $scope.stats.transaction_avg.colSize;
      // format currency
      stat.value = vmHelper.formatNumber(stat.value,true,false);
      stat.change = vmHelper.formatNumber(stat.change,false,false);
      $scope.stats.transaction_avg = stat;

      // transaction value
      stat = {};
      stat.description = $scope.stats.transaction_value.description;
      stat.info = $scope.stats.transaction_value.info;
      stat.showPie = $scope.stats.transaction_value.showPie;
      stat.showChange = $scope.stats.transaction_value.showChange;
      stat.value = data.value.current.value;
      stat.prevValue = parseInt(data.value.prev.value);
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
      stat.colSize = $scope.stats.transaction_value.colSize;
      // format numbers
      stat.value = vmHelper.formatNumber(stat.value,true,false);
      stat.change = vmHelper.formatNumber(stat.change,false,false);
      $scope.stats.transaction_value = stat;
    }

    $scope.showBuyerStats = function(data) {
      
        //transaction count
        var stat = {};
        stat.description = $scope.stats.unique_buyers.description;
        stat.info = $scope.stats.unique_buyers.info;
        stat.showPie = $scope.stats.unique_buyers.showPie;
        stat.showChange = $scope.stats.unique_buyers.showChange;
        stat.value = parseInt(data.current_period);
        stat.prevValue = parseInt(data.prev_period);
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
        stat.colSize = $scope.stats.unique_buyers.colSize;
        stat.change = vmHelper.formatNumber(stat.change,false,false);
        $scope.stats.unique_buyers = stat;
      
    }


    // TRANSACTION HISTORY
    $scope.getHistory = function(startDate, endDate) {
      $scope.loading = true;
      // transaction trend
      $http.get('/api/virtualmarket/transaction?type=history&aggregate=sum&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          data.transaction = vmHelper.fixLineChartNullValues(data.transaction, data.granularity, ['count', 'value']); // add null points as zero
          $scope.transactionTrend = data; // update data
          $scope.drawTransactionTrend($scope.transactionTrend, $scope.transactionHistory.metric, $scope.colors);
        })
        .finally(function() {
          $scope.loading= false;
        });

      // buyer trend
      $http.get('/api/virtualmarket/buyer?type=history&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          data.buyer = vmHelper.fixLineChartNullValues(data.buyer, data.granularity, ['count']); // add null points as zero
          $scope.buyerTrend = data; // update data
          $scope.drawBuyerTrend($scope.buyerTrend, $scope.colors);
        })
        .finally(function() {
          
        });        
    };

     $scope.drawBuyerTrend =  function(data, colors) {
      var label = '';
      if($scope.chart != undefined) {
        $('#vmBuyerByHistory').empty();
      }
       
      if(data.buyer.length == 0) {
        $scope.noData = true;
      } else {
        $scope.chart = AmCharts.makeChart('vmBuyerByHistory',$scope.getBuyerChartOptions(data, label, colors));
        $scope.noData = false;
      }
    };

    $scope.getBuyerChartOptions = function(data, label, colors) { 
      var dateFormat;
      if(data.granularity == 'month')
        dateFormat = 'YYYY-MM';
      else if(data.granularity == 'day')
        dateFormat = 'YYYY-MM-DD';

      var options = {
        color: layoutColors.defaultText,
        data: data.buyer,
        title: 'Jumlah Pembeli',
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
              var hoverInfo = 'Jumlah Pembeli:<br> <b>'+value+'</b>';
              return hoverInfo;
            },
            bullet: 'round',
            bulletSize: 8,
            lineColor: colors.blue,
            lineThickness: 2,
            type: 'line',
            valueField: 'count'
          }
        ],
        dataDateFormat: dateFormat,
        categoryField: 'date',
        categoryLabelFunction: function(valueText, date, categoryAxis) {
          if(data.granularity == 'month')
            return vmHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
          else if(data.granularity == 'day')
            return date.getDate()+' '+vmHelper.formatMonth(date.getMonth());
        }
      };
      
      return vmHelper.getLineChartOptions(options);
    };

    // chart options
    $scope.getTransactionChartOptions = function(data, metric, label, colors) {
      var title = '';
      if(metric == 'count')
        title = 'Jumlah Transaksi';
      else if(metric == 'value')
        title = 'Nilai Transaksi';

      var dateFormat;
      if(data.granularity == 'month')
        dateFormat = 'YYYY-MM';
      else if(data.granularity == 'day')
        dateFormat = 'YYYY-MM-DD';

      var options = {
        color: layoutColors.defaultText,
        data: data.transaction,
        title: title,
        gridColor: layoutColors.border,
        valueLabelFunction: function(y) {
          return vmHelper.formatNumber(y,false,true);
        }, 
        graphs: [
          {
            id: 'g1',
            balloonFunction: function(item, graph) {
              var value = item.values.value;
              var hoverInfo = '';
              if(metric == 'count')
                hoverInfo += 'Jumlah Transaksi:<br> <b>'+value+'</b>';
              else if(metric == 'value')
                hoverInfo += 'Nilai Transaksi:<br> <b>'+vmHelper.formatNumber(value,true,false)+'</b>';
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
        dataDateFormat: dateFormat,
        categoryField: 'date',
        categoryLabelFunction: function(valueText, date, categoryAxis) {
          if(data.granularity == 'month')
            return vmHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
          else if(data.granularity == 'day')
            return date.getDate()+' '+vmHelper.formatMonth(date.getMonth());
        }
      };
      
      return vmHelper.getLineChartOptions(options);
    };

    $scope.drawTransactionTrend =  function(data, metric, colors) {
      var label = '';
      if(metric == 'count')
        label = 'Jumlah Transaksi'
      else if(metric == 'value')
        label = 'Nilai Transaksi'

      if($scope.chart != undefined) {
        $('#vmTransactionByHistory').empty();
      }

      if(data.transaction.length == 0) {
        $scope.noData = true;
      } else {
        $scope.chart = AmCharts.makeChart('vmTransactionByHistory',$scope.getTransactionChartOptions(data, metric, label, colors));
        $scope.noData = false;
      }
    };

    $scope.changeMetric = function() {
      $scope.drawTransactionTrend($scope.transactionTrend, $scope.transactionHistory.metric, $scope.colors);
    };

  }
})();