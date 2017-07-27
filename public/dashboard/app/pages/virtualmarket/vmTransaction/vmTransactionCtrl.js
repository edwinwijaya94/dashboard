
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
        colSize: 4,
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
        colSize: 4,
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
        colSize: 2,
      },
      transaction_avg: {
        color: pieColor,
        description: 'Rata-Rata Transaksi',
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
      // avg_rating: {
      //   color: pieColor,
      //   description: 'Rating',
      //   info: '',
      //   value: vmHelper.formatNumber(0,false,false),
      //   percent: 0,
      //   showPie: false,
      //   showChange: true,
      //   change: 0,
      //   prevValue: 0,
      //   icon:'ion-arrow-up-b',
      //   iconColor: $scope.colors.green,
      //   colSize: 2,
      // },
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
      $scope.getProductList(startDate, endDate);
      $scope.getFeedback(startDate, endDate);
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
      for(var i=0; i<data.length; i++){
        if(data[i].status == 'success')
          data[i].fillColor = $scope.colors.green;
        else
          data[i].fillColor = '#d1cfcf';
      }
      $scope.chart = AmCharts.makeChart('vmTransactionStatus',$scope.getBarChartOptions(data, $scope.colors, 'status'));
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

      return vmHelper.getBarChartOptions(options);
    };

    $scope.drawPlatformChart = function(data) {
      for(var i=0; i<data.length; i++){
        data[i].fillColor = $scope.colors.yellow;
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
      // format number
      stat.value = vmHelper.formatNumber(parseInt(stat.value),false,false);
      stat.change = vmHelper.formatNumber(stat.change,false,false)+'%';
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
      stat.change = vmHelper.formatNumber(stat.change,false,false)+'%';
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
      stat.value = vmHelper.formatNumber(parseInt(stat.value),true,true, 2);
      stat.change = vmHelper.formatNumber(stat.change,false,false)+'%';
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
        stat.change = vmHelper.formatNumber(stat.change,false,false)+'%';
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

      var valueLabelFunction = function(y) {
        return vmHelper.formatNumber(y,false,true);
      };

      var options = {
        color: layoutColors.defaultText,
        data: data.transaction,
        title: title,
        gridColor: layoutColors.border,
        // valueLabelFunction: function(y) {
        //   return vmHelper.formatNumber(y,false,true);
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
            // balloonFunction: function(item, graph) {
            //   var value = item.values.value;
            //   var hoverInfo = '';
            //   hoverInfo += 'Jumlah: <b>'+'[[count]]'+'</b><br> ';
            //   hoverInfo += 'Nilai: <b>'+vmHelper.formatNumber(value,true,false)+'</b>';
            //   return hoverInfo;
            // },
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
        categoryAxis: {
             gridThickness: 0
        },
        categoryLabelFunction: function(valueText, date, categoryAxis) {
          if(data.granularity == 'month')
            return vmHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
          else if(data.granularity == 'day')
            return date.getDate()+' '+vmHelper.formatMonth(date.getMonth());
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
      
      var chartOptions = vmHelper.getLineChartOptions(options);
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

    // PRODUCT
    $scope.initProductList = function() {
      $scope.productPageIndex = 1;
      $scope.productPageSize = 5;
      $scope.productList = {
        totalRows: 0,
        // page: 1,
        // rowsPerPage: 5,
        displayedPages: 1,
        product:[]
      };
    }
    $scope.initProductList();

    $scope.getProductList = function(startDate, endDate, page, rows) {
      $scope.loading = true;
      $http.get('/api/virtualmarket/product?type=toplist&start_date='+startDate+'&end_date='+endDate+'&page='+page+'&rows='+rows)
        .then(function(res) {
          var data = res.data.data;
          $scope.showProducts(data);
        })
        .finally(function() {
          $scope.loading= false;
        });    
    };

    $scope.showProducts = function(data) {
      $scope.productList.totalRows = data.total_rows;
      // $scope.productList.product = data.product;

      $scope.updatedProductList = data.product;
      // copy references
      $scope.productList.product = [].concat($scope.updatedProductList);
    };

    $scope.formatNumber = function(number) {
      return vmHelper.formatNumber(number,false,false);
    };

    $scope.changeProductPage = function(newPage) {
      // $scope.getProductList($scope.startDate, $scope.endDate, $scope.productList.page, $scope.productList.rowsPerPage);
      $scope.productPageIndex = newPage;
    };

    // GARENDONG
    $scope.initShopperList = function() {
      $scope.shopperPageIndex = 1;
      $scope.shopperPageSize = 5;
      $scope.shopperList = {
        totalRows: 0,
        avgRating: 0 + ' / 5',
        // pageIndex: 1,
        // pageSize: 5,
        displayedPages: 1,
        shopper:[]
      };
    };
    $scope.initShopperList();

    $scope.shopperListOptions = {
      selected: {
        label: 'Rating Tertinggi',
        value: 'highest',
        color: $scope.colors.green
      },
      options: [
        {
          label: 'Rating Tertinggi',
          value: 'highest',
          color: $scope.colors.green
        },
        {
          label: 'Rating Terendah',
          value: 'lowest',
          color: $scope.colors.red
        }
      ]
    };

    $scope.getShopperList = function(startDate, endDate, page, rows, sort) {
      // $scope.loading = true;
      $http.get('/api/virtualmarket/shopper?type=list&start_date='+startDate+'&end_date='+endDate+'&page='+page+'&rows='+rows+'&sort='+sort)
        .then(function(res) {
          $scope.shopperData = res.data.data;
          $scope.showShopperData($scope.shopperData, '');
        })
        .finally(function() {
          // $scope.loading= false;
        });    
    };

    $scope.showShopperData = function(data, sortBy) {

      $scope.stats.avg_rating.value = $scope.formatRating(data.avg_rating.current);
      var ratingChange = (data.avg_rating.current-data.avg_rating.prev);
      ratingChange = isFinite(ratingChange)? ratingChange:0;
      if(ratingChange>=0) {
        $scope.stats.avg_rating.icon = 'ion-arrow-up-b';
        $scope.stats.avg_rating.iconColor = $scope.colors.green;
      } else {
        ratingChange *= -1;
        $scope.stats.avg_rating.icon = 'ion-arrow-down-b';
        $scope.stats.avg_rating.iconColor = $scope.colors.red;
      }
      $scope.stats.avg_rating.change = $scope.formatRating(parseFloat(ratingChange.toFixed(2)));

      // shopper list
      $scope.updatedShopperList = data.shopper;
      // copy references
      $scope.shopperList.shopper = [].concat($scope.updatedShopperList);
    };

    $scope.getFeedback = function(startDate, endDate) {
      $http.get('/api/virtualmarket/feedback?type=stats&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          $scope.showFeedbackReason(data.feedback);
        })
        .finally(function() {
          // $scope.loading= false;
        });          
    };

    $scope.showFeedbackReason = function(data) {
      if($scope.chart != undefined) {
        $('#vmFeedbackReason').empty();
      }

      if(data.length == 0) {
        $scope.noData = true;
      } else {
        for(var i=0; i<data.length; i++){
          data[i].fillColor = $scope.colors.yellow;
        }
        $scope.chart = AmCharts.makeChart('vmFeedbackReason',$scope.getBarChartOptions(data, $scope.colors, 'reason'));
        $scope.noData = false;
      }
    }

    $scope.formatRating = function(rating) {
      return vmHelper.formatNumber(rating,false,false);
    };

  }
})();