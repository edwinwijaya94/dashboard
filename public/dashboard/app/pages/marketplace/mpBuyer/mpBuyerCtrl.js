
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.marketplace')
      .controller('mpBuyerCtrl', mpBuyerCtrl);

  /** @ngInject */
  function mpBuyerCtrl($scope, $timeout, $http, baConfig, baUtil, mpHelper, uiGmapIsReady) {
    var layoutColors = baConfig.colors;
    // $scope.colors = [layoutColors.primary, layoutColors.warning, layoutColors.danger, layoutColors.info, layoutColors.success, layoutColors.primaryDark];
    
    // COLORS
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);
    var pieColor = mpHelper.colors.primary.green;

    $scope.colors = mpHelper.colors.primary;
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
    $scope.$on('updateMp', function(event, startDate, endDate) {
      $scope.getData(startDate, endDate);  
    });

    $scope.getData = function(startDate, endDate) {
      $scope.getStats(startDate, endDate);
      $scope.getHistory(startDate, endDate);
      // $scope.getMap(startDate, endDate);
    }

    // BUYER STATS
    $scope.getStats = function(startDate, endDate) {
      // $scope.loading = true;
      $http.get('/api/marketplace/buyer?type=stats&start_date='+startDate+'&end_date='+endDate)
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
        // format numbers
        stat.change = mpHelper.formatNumber(stat.change,false,false);
        $scope.stats[metric] = stat;
      }
    }

    // BUYER HISTORY
    $scope.getHistory = function(startDate, endDate) {
      $scope.loading = true;
      $http.get('/api/marketplace/buyer?type=history&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          data.buyer = mpHelper.fixLineChartNullValues(data.buyer, data.granularity, ['count']); // add null points as zero
          $scope.data = data; // update data
          $scope.drawChart($scope.data, $scope.colors);
        })
        .finally(function() {
          $scope.loading= false;
        });    
    };

    // chart options
    $scope.getChartOptions = function(data, label, colors) { 
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
            lineColor: colors.green,
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

    $scope.drawChart =  function(data, colors) {
      var label = '';
      if($scope.chart != undefined) {
        $('#mpBuyerByHistory').empty();
      }
       
      if(data.buyer.length == 0) {
        $scope.noData = true;
      } else {
        $scope.chart = AmCharts.makeChart('mpBuyerByHistory',$scope.getChartOptions(data, label, colors));
        $scope.noData = false;
      }
    };

    // MAPS CONTROL
    $scope.buyerMap = {};
    $scope.buyerMap.showDetail = function(index) {
      console.log(id);
    }
    // $scope.buyerMap.circles = [];
    $scope.buyerMap.config = {
      center: { latitude: -0.2298, longitude: 100.6309 },
      zoom: 13,
      options: {scrollwheel: false}
    };

    $scope.getMap = function(startDate, endDate) {
      // $scope.buyerMap.circles = [];
      $scope.buyerMap.points = [];
      uiGmapIsReady.promise(1).then(function(instances) {
        instances.forEach(function(inst) {
          var map = inst.map
          $http.get('/api/marketplace/buyer?type=map&start_date='+startDate+'&end_date='+endDate)
            .then(function(res) {
              var data = res.data.data;
              for(let i=0; i<data.length; i++) { // use 'let' for binding index on loop
                var point = {
                  id: i,
                  latitude: data[i].latitude,
                  longitude: data[i].longitude
                };
                $scope.buyerMap.points.push(point);
              }
            })
            .finally(function() {
              // $scope.loading= false;
            });    
          

        });
      });
    };

  }
})();