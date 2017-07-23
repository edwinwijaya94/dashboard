
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.marketplace')
      .controller('mpOverviewCtrl', mpOverviewCtrl);

  /** @ngInject */
  function mpOverviewCtrl($scope, $timeout, $http, baConfig, baUtil, mpHelper) {
    var layoutColors = baConfig.colors;
    // $scope.colors = [layoutColors.primary, layoutColors.warning, layoutColors.danger, layoutColors.info, layoutColors.success, layoutColors.primaryDark];
    
    // COLORS
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.6);
    var pieColor = mpHelper.colors.primary.green;

    $scope.colors = mpHelper.colors.primary;
    $scope.chartColors = [$scope.colors.blue, $scope.colors.yellow, $scope.colors.green, $scope.colors.red];
    // var colors = layoutColors.dashboard;
    // $scope.chartColors = [layoutColors.info, layoutColors.danger, layoutColors.warning, layoutColors.success];
    
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
        colSize: 4,
      },
      transaction_value: {
        color: pieColor,
        description: 'Nilai Transaksi',
        info: '',
        value: mpHelper.formatNumber(0,true,false),
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
        description: 'Pembeli',
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
      // transaction_avg: {
      //   color: pieColor,
      //   description: 'Rata Rata Transaksi',
      //   info: '',
      //   value: mpHelper.formatNumber(0,true,false),
      //   percent: 0,
      //   showPie: false,
      //   showChange: true,
      //   change: 0,
      //   prevValue: 0,
      //   icon:'ion-arrow-up-b',
      //   iconColor: $scope.colors.green,
      //   colSize: 3,
      // },
      avg_rating: {
        color: pieColor,
        description: 'Rating',
        info: '',
        value: mpHelper.formatNumber(0,true,false),
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
    $scope.$on('updateMp', function(event, startDate, endDate) {
      $scope.getData(startDate, endDate);  
    });

    $scope.getData = function(startDate, endDate) {
      $scope.getStats(startDate, endDate);
      $scope.getHistory(startDate, endDate);
      $scope.getSentraToplist(startDate, endDate);
      $scope.getProductToplist(startDate, endDate);
    }

    // TRANSACTION STATS AND PAYMENT METHOD
    $scope.getStats = function(startDate, endDate) {
      // $scope.loading = true;
      // transaction stats
      $http.get('/api/marketplace/transaction?type=stats&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          $scope.showTransaction(data.transaction);
          $scope.showSuccessRate(data.transaction_status);
          $scope.drawPaymentMethodChart(data.payment_method);
        })
        .finally(function() {
          // $scope.loading= false;
        });

      // buyer stats
      $http.get('/api/marketplace/buyer?type=stats&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          $scope.showBuyerStats(data.unique_buyers);
        })
        .finally(function() {
          // $scope.loading= false;
        });

      // rating stats
      $http.get('/api/marketplace/feedback?type=stats&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          $scope.showRatingStats(data.rating);
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
      $scope.chart = AmCharts.makeChart('mpTransactionStatus',$scope.getBarChartOptions(data, $scope.colors, 'status'));
    }

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

      return mpHelper.getBarChartOptions(options);
    };

    $scope.drawPaymentMethodChart = function(data) {
      for(var i=0; i<data.length; i++){
        data[i].fillColor = layoutColors.warning;
      }
      $scope.chart = AmCharts.makeChart('mpPaymentMethod',$scope.getBarChartOptions(data, $scope.colors, 'name'));
    };

    $scope.showTransaction = function(data) {
      //transaction count
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
      stat.value = mpHelper.formatNumber(stat.value,false,false);
      stat.change = mpHelper.formatNumber(stat.change,false,false)+'%';
      $scope.stats.transaction_count = stat;

      // transaction average value
      // stat = {};
      // stat.description = $scope.stats.transaction_avg.description;
      // stat.info = $scope.stats.transaction_avg.info;
      // stat.showPie = $scope.stats.transaction_avg.showPie;
      // stat.showChange = $scope.stats.transaction_avg.showChange;
      // stat.value = parseInt(data.value.current.average);
      // stat.prevValue = parseInt(data.value.prev.average);
      // var change = ((stat.value-stat.prevValue)/(stat.prevValue)*100).toFixed(2);
      // stat.change = isFinite(change)? change:0;
      // if(stat.change>=0) {
      //   stat.icon = 'ion-arrow-up-b';
      //   stat.iconColor = $scope.colors.green;
      // } else {
      //   stat.change *= -1;
      //   stat.icon = 'ion-arrow-down-b';
      //   stat.iconColor = $scope.colors.red;
      // }
      // stat.colSize = $scope.stats.transaction_avg.colSize;
      // // format currency
      // stat.value = mpHelper.formatNumber(stat.value,true,false);
      // stat.change = mpHelper.formatNumber(stat.change,false,false);
      // $scope.stats.transaction_avg = stat;

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
      stat.value = mpHelper.formatNumber(stat.value,true,true,2);
      stat.change = mpHelper.formatNumber(stat.change,false,false)+'%';
      $scope.stats.transaction_value = stat;
    }

    $scope.showBuyerStats = function(data) {
      
      // buyer count
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
      stat.value = mpHelper.formatNumber(stat.value,false,false);
      stat.change = mpHelper.formatNumber(stat.change,false,false)+'%';
      $scope.stats.unique_buyers = stat;
      
    }

    $scope.showRatingStats = function(data) {
      // rating avg
      var stat = {};
      stat.description = $scope.stats.avg_rating.description;
      stat.info = $scope.stats.avg_rating.info;
      stat.showPie = $scope.stats.avg_rating.showPie;
      stat.showChange = $scope.stats.avg_rating.showChange;
      stat.value = parseFloat(data.current);
      stat.prevValue = parseFloat(data.prev);
      var change = (stat.value-stat.prevValue).toFixed(2);
      stat.change = isFinite(change)? change:0;
      if(stat.change>=0) {
        stat.icon = 'ion-arrow-up-b';
        stat.iconColor = $scope.colors.green;
      } else {
        stat.change *= -1;
        stat.icon = 'ion-arrow-down-b';
        stat.iconColor = $scope.colors.red;
      }
      stat.colSize = $scope.stats.avg_rating.colSize;
      stat.value = isFinite(stat.value)? mpHelper.formatNumber(stat.value,false,false): '-';
      stat.change = mpHelper.formatNumber(stat.change,false,false);
      $scope.stats.avg_rating = stat;
    }

    // TRANSACTION HISTORY
    $scope.getHistory = function(startDate, endDate) {
      $scope.loading = true;
      // transaction trend
      $http.get('/api/marketplace/transaction?type=history&aggregate=sum&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          data.transaction = mpHelper.fixLineChartNullValues(data.transaction, data.granularity, ['count', 'value']); // add null points as zero
          $scope.transactionTrend = data; // update data
          $scope.drawTransactionTrend($scope.transactionTrend, $scope.transactionHistory.metric, $scope.colors);
        })
        .finally(function() {
          $scope.loading= false;
        });

      // buyer trend
      $http.get('/api/marketplace/buyer?type=history&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          data.buyer = mpHelper.fixLineChartNullValues(data.buyer, data.granularity, ['count']); // add null points as zero
          $scope.buyerTrend = data; // update data
          $scope.drawBuyerTrend($scope.buyerTrend, $scope.colors);
        })
        .finally(function() {
          
        });        
    };

    $scope.drawBuyerTrend =  function(data, colors) {
      var label = '';
      if($scope.chart != undefined) {
        $('#mpBuyerByHistory').empty();
      }
       
      if(data.buyer.length == 0) {
        $scope.noData = true;
      } else {
        $scope.chart = AmCharts.makeChart('mpBuyerByHistory',$scope.getBuyerChartOptions(data, label, colors));
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
            return mpHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
          else if(data.granularity == 'day')
            return date.getDate()+' '+mpHelper.formatMonth(date.getMonth());
        }
      };
      
      return mpHelper.getLineChartOptions(options);
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

      var valueLabelFunction = function(y) {
        return mpHelper.formatNumber(y,false,true);
      };

      var options = {
        color: layoutColors.defaultText,
        data: data.transaction,
        title: title,
        gridColor: layoutColors.border,
        // valueLabelFunction: function(y) {
        //   return mpHelper.formatNumber(y,false,true);
        // }, 
        graphs: [
          {
            id: 'g1',
            valueAxis: 'v1',
            title: 'Jumlah Transaksi',
            balloonText: '',
            bullet: 'round',
            bulletSize: 8,
            lineColor: layoutColors.warning,
            lineThickness: 2,
            type: 'line',
            valueField: 'count'
          },
          {
            id: 'g2',
            valueAxis: 'v2',
            title: 'Nilai Transaksi',
            balloonText: 'Jumlah: <b>[[count]]</b><br>Nilai: <b>Rp [[value]]</b>',
            bullet: 'round',
            bulletSize: 8,
            lineColor: layoutColors.success,
            lineThickness: 2,
            type: 'line',
            valueField: 'value'
          }
        ],
        dataDateFormat: dateFormat,
        categoryField: 'date',
        categoryLabelFunction: function(valueText, date, categoryAxis) {
          if(data.granularity == 'month')
            return mpHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
          else if(data.granularity == 'day')
            return date.getDate()+' '+mpHelper.formatMonth(date.getMonth());
        },
        valueAxes: [{
          id:'v1',
          axisColor: layoutColors.warning,
          axisThickness: 2,
          axisAlpha: 1,
          position: 'left',
          labelFunction: valueLabelFunction,
          minimum: 0,
          integersOnly: true,
        }, {
          id:'v2',
          axisColor: layoutColors.success,
          axisThickness: 2,
          axisAlpha: 1,
          position: 'right',
          labelFunction: valueLabelFunction,
          minimum: 0,
          integersOnly: true,
        },],
      };

      var chartOptions = mpHelper.getLineChartOptions(options);
      chartOptions.legend = {
        useGraphSettings: true,
        valueFunction: function(graphDataItem, valueText) {
          return '';
        },
        valueWidth:0
      };
      return chartOptions;
    };

    $scope.drawTransactionTrend =  function(data, metric, colors) {
      var label = '';
      if(metric == 'count')
        label = 'Jumlah Transaksi'
      else if(metric == 'value')
        label = 'Nilai Transaksi'

      if($scope.chart != undefined) {
        $('#mpTransactionByHistory').empty();
      }

      if(data.transaction.length == 0) {
        $scope.noData = true;
      } else {
        $scope.chart = AmCharts.makeChart('mpTransactionByHistory',$scope.getTransactionChartOptions(data, metric, label, colors));
        $scope.noData = false;
      }
    };

    $scope.changeMetric = function() {
      $scope.drawTransactionTrend($scope.transactionTrend, $scope.transactionHistory.metric, $scope.colors);
    };

    $scope.getSentraToplist = function(startDate, endDate) {
      // sentra
      $http.get('/api/marketplace/sentra?type=toplist&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;

          $scope.updatedSentraList = data.sentra;
          // copy references
          $scope.sentraList = [].concat($scope.updatedSentraList);
        })
        .finally(function() {
          
        });        
    }

    $scope.getProductToplist = function(startDate, endDate) {
      // produk
      $http.get('/api/marketplace/product?type=toplist&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;

          $scope.updatedProductList = data.product;
          // copy references
          $scope.productList = [].concat($scope.updatedProductList);
        })
        .finally(function() {
          
        });        
    }

    $scope.formatNumber = function(value) {
      return mpHelper.formatNumber(parseInt(value),false,false);
    }

    $scope.sorter = {
      orders: function(value) {
        return parseInt(value.orders);
      },
      value: function(value) {
        return parseInt(value.value);
      },
      avg_price: function(value) {
        return parseInt(value.avg_price);
      },
    }
  }
})();