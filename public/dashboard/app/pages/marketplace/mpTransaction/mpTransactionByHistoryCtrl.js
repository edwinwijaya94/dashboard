/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.marketplace')
      .controller('mpTransactionByHistoryCtrl', mpTransactionByHistoryCtrl);

  /** @ngInject */
  function mpTransactionByHistoryCtrl($scope, $window, $http, baConfig) {
    var layoutColors = baConfig.colors;

    $scope.colors = [layoutColors.primary, layoutColors.warning, layoutColors.danger, layoutColors.info, layoutColors.success, layoutColors.primaryDark];
    $scope.$on('updateMpTransaction', function(event, startDate, endDate) {  
      $scope.getData(startDate, endDate);
    });

    $scope.getData = function(startDate, endDate) {
      $scope.loading = true;
      $http.get('/api/marketplace/transaction?group_by=history&aggregate=sum&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var resp = res.data.data;
          var data = [];
          var i;
          for(i=0; i<resp.length; i++) {
            var x = {};
            x.time = resp[i].yr+'-'+resp[i].mo;
            x.value = resp[i].value;
            data.push(x);
          }
          $scope.drawChart(data, $scope.colors);
        })
        .finally(function() {
          $scope.loading= false;
        });    
    }

    // chart
    $scope.drawChart =  function(data, colors) {
      if($scope.chart == undefined) {
        $scope.chart = new Morris.Line({
          element: 'mpTransactionByHistory',
          data: data,
          xkey: 'time',
          ykeys: ['value'],
          labels: ['Nilai Transaksi'],
          preUnits: 'Rp ',
          lineColors: colors
        });
      } else {
        $scope.chart.setData(data);
      }
    }

    angular.element($window).bind('resize', function () {
      //$window.Morris.Grid.prototype.redraw();
    });
  }

  
})();