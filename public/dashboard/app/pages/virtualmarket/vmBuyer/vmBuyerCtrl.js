
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket')
      .controller('vmBuyerCtrl', vmBuyerCtrl);

  /** @ngInject */
  function vmBuyerCtrl($scope, $timeout, $http, baConfig, baUtil, vmHelper, uiGmapGoogleMapApi) {
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
        // format numbers
        stat.change = vmHelper.formatNumber(stat.change,false,false);
        $scope.stats[metric] = stat;
      }
    }

    // BUYER HISTORY
    $scope.getHistory = function(startDate, endDate) {
      $scope.loading = true;
      $http.get('/api/virtualmarket/buyer?type=history&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          data.buyer = vmHelper.fixLineChartNullValues(data.buyer, data.granularity, ['count']); // add null points as zero
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
            return vmHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
          else if(data.granularity == 'day')
            return date.getDate()+' '+vmHelper.formatMonth(date.getMonth());
        }
      };
      
      return vmHelper.getLineChartOptions(options);
    };

    $scope.drawChart =  function(data, colors) {
      var label = '';
      if($scope.chart != undefined) {
        $('#vmBuyerByHistory').empty();
      }
       
      if(data.buyer.length == 0) {
        $scope.noData = true;
      } else {
        $scope.chart = AmCharts.makeChart('vmBuyerByHistory',$scope.getChartOptions(data, label, colors));
        $scope.noData = false;
      }
    };

    // MAPS CONTROL
    $scope.buyerMap = {};
    $scope.buyerMap.showDetail = function(index) {
      console.log(id);
    }
    $scope.buyerMap.circles = [];
    $scope.buyerMap.options = {
      center: { latitude: -0.2298, longitude: 100.6309 },
      zoom: 13
    };

    uiGmapGoogleMapApi.then(function(maps) {
      var geocoder =  new google.maps.Geocoder();
      var districts = ['Payakumbuh Barat', 'Payakumbuh Timur', 'Payakumbuh Selatan', 'Payakumbuh Utara', 'Lamposi Tigo Nagari'];
      for(let i=0; i<districts.length; i++) { // use 'let' for binding index on loop
        geocoder.geocode( { 'address': districts[i]+', id'}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            var circle = {
              id: i+1,
              center: {
                  latitude: results[0].geometry.location.lat(),
                  longitude: results[0].geometry.location.lng()
              },
              radius: (Math.floor(Math.random() * 2000) + 500),
              stroke: {
                  color: 'white',
                  weight: 2,
                  opacity: 1
              },
              fill: {
                  color: 'red',
                  opacity: 0.5
              },
              geodesic: true, // optional: defaults to false
              draggable: false, // optional: defaults to false
              clickable: true, // optional: defaults to true
              editable: false, // optional: defaults to false
              visible: true, // optional: defaults to true
              control: {}
            };
            $scope.buyerMap.circles.push(circle);
            
          } else {
            console.log('error gmaps geocoder');
          }
        });
      }
      console.log($scope.buyerMap.circles);

    });
  }
})();