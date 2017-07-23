
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.marketplace')
      .controller('mpSentraCtrl', mpSentraCtrl);

  /** @ngInject */
  function mpSentraCtrl($scope, $timeout, $http, baConfig, baUtil, mpHelper) {
    var layoutColors = baConfig.colors;
    
    // COLORS
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);
    var pieColor = mpHelper.colors.primary.green;

    $scope.colors = mpHelper.colors.primary;
    $scope.chartColors = [$scope.colors.blue, $scope.colors.yellow, $scope.colors.green, $scope.colors.red];
    
    // INIT DATA
    $scope.stats = {
      rating: {
        description: 'Rating',
        transactions: 0,
        value: 0
      }
    };

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
        colSize: 3,
      },
    };


    
    $scope.initShopperList = function() {
      $scope.shopperPageIndex = 1;
      $scope.shopperPageSize = 5;
      $scope.shopperList = {
        totalRows: 0,
        avgRating: 0 + ' / 5',
        displayedPages: 1,
        shopper:[]
      };
    };

    $scope.sentraList = {
      selected: {},
      sentras: []
    };

    $scope.noData = false;

    // EVENTS
    $scope.$on('updateMp', function(event, startDate, endDate) {
      $scope.startDate = startDate;
      $scope.endDate = endDate;
      $scope.initShopperList();
      $scope.getData(startDate, endDate);  
    });

    $scope.getData = function(startDate, endDate) {
      $scope.getSentraData(startDate, endDate, $scope.sentraList.selected.id);
    };

    $scope.getSentraList = function() {
      $http.get('/api/marketplace/sentra?type=list')
        .then(function(res) {
          var data = res.data.data;
          $scope.sentraList.sentras = data;
          $scope.sentraList.selected = data[0];
        })
        .finally(function() {
          // $scope.loading= false;
        });    
    };
    $scope.getSentraList();

    $scope.selectSentra = function(item, model) {
      $scope.sentraList.selected = item; // update selected option
      $scope.getData($scope.startDate, $scope.endDate);
    };


    // SENTRA DATA
    $scope.getSentraData = function(startDate, endDate, sentraId) {
      $http.get('/api/marketplace/sentra?type=data&start_date='+startDate+'&end_date='+endDate+'&sentra_id='+sentraId)
        .then(function(res) {
          var data = res.data.data;
          $scope.showSentraData(data);
        })
        .finally(function() {
          // $scope.loading= false;
        });    
    };

    $scope.showSentraData = function(data) {
      $scope.showTransaction(data.transaction, data.granularity);
      $scope.showBuyer(data.buyer, data.granularity);
      $scope.showProduct(data.product);
      $scope.showRating(data.rating);
    }

    $scope.showTransaction = function(data, granularity) {
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
      stat.change = mpHelper.formatNumber(stat.change,false,false)+'%';
      $scope.stats.transaction_count = stat;

      // // transaction average value
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
      // stat.change = mpHelper.formatNumber(stat.change,false,false)+'%';
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
      stat.value = mpHelper.formatNumber(stat.value,true,true, 2);
      stat.change = mpHelper.formatNumber(stat.change,false,false)+'%';
      $scope.stats.transaction_value = stat;

      // transaction trend
      if($scope.chart != undefined) {
        $('#mpSentraTransactionByHistory').empty();
      }

      if(data.history.length == 0) {
        $scope.noData = true;
      } else {
        $scope.chart = AmCharts.makeChart('mpSentraTransactionByHistory',$scope.getTransactionChartOptions(data.history, granularity, $scope.colors));
        $scope.noData = false;
      }

      // transaction status
      for(var i=0; i<data.status.length; i++){
        if(data.status[i].status == 'success')
          data.status[i].fillColor = $scope.colors.green;
        else
          data.status[i].fillColor = '#d1cfcf';
      }
      $scope.chart = AmCharts.makeChart('mpSentraTransactionStatus',$scope.getBarChartOptions(data.status, $scope.colors, 'status'));
      
    }

    // chart options
    $scope.getTransactionChartOptions = function(data, granularity, colors) {
      // var title = '';
      // if(metric == 'count')
      //   title = 'Jumlah Transaksi';
      // else if(metric == 'value')
      //   title = 'Nilai Transaksi';

      var dateFormat;
      if(granularity == 'month')
        dateFormat = 'YYYY-MM';
      else if(granularity == 'day')
        dateFormat = 'YYYY-MM-DD';

      var valueLabelFunction = function(y) {
        return mpHelper.formatNumber(y,false,true);
      };

      var options = {
        color: layoutColors.defaultText,
        data: data,
        title: '',
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
          if(granularity == 'month')
            return mpHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
          else if(granularity == 'day')
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

    $scope.showBuyer = function(data, granularity) {
      
        // buyer count
        var stat = {};
        stat.description = $scope.stats.unique_buyers.description;
        stat.info = $scope.stats.unique_buyers.info;
        stat.showPie = $scope.stats.unique_buyers.showPie;
        stat.showChange = $scope.stats.unique_buyers.showChange;
        stat.value = parseInt(data.count.current);
        stat.prevValue = parseInt(data.count.prev);
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
        stat.change = mpHelper.formatNumber(stat.change,false,false)+'%';
        $scope.stats.unique_buyers = stat;

        // buyer trend
        if($scope.chart != undefined) {
          $('#mpSentraBuyerByHistory').empty();
        }
         
        if(data.history.length == 0) {
          $scope.noData = true;
        } else {
          $scope.chart = AmCharts.makeChart('mpSentraBuyerByHistory',$scope.getBuyerChartOptions(data.history, granularity, $scope.colors));
          $scope.noData = false;
        }
      
    };

    $scope.getBuyerChartOptions = function(data, granularity, colors) { 
      var dateFormat;
      if(granularity == 'month')
        dateFormat = 'YYYY-MM';
      else if(granularity == 'day')
        dateFormat = 'YYYY-MM-DD';

      var options = {
        color: layoutColors.defaultText,
        data: data,
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
          if(granularity == 'month')
            return mpHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
          else if(granularity == 'day')
            return date.getDate()+' '+mpHelper.formatMonth(date.getMonth());
        }
      };
      
      return mpHelper.getLineChartOptions(options);
    };

    // PRODUCT
    $scope.showProduct = function(data) {

      $scope.updatedProductList = data;
      // copy references
      $scope.productList = [].concat($scope.updatedProductList);
    }


    // RATING
    $scope.showRating = function(data) {
      // rating avg
      var stat = {};
      stat.description = $scope.stats.avg_rating.description;
      stat.info = $scope.stats.avg_rating.info;
      stat.showPie = $scope.stats.avg_rating.showPie;
      stat.showChange = $scope.stats.avg_rating.showChange;
      stat.value = parseFloat(data.average.current);
      stat.prevValue = parseFloat(data.average.prev);
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

    $scope.formatNumber = function(value) {
      return mpHelper.formatNumber(parseInt(value),false,false);
    };

    $scope.formatRating = function(rating) {
      return mpHelper.formatNumber(rating,false,false);
    };
  }
})();