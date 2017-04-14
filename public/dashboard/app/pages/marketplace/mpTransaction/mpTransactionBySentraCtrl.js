/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.marketplace')
      .controller('mpTransactionBySentraCtrl', mpTransactionBySentraCtrl);

  /** @ngInject */
  function mpTransactionBySentraCtrl($scope, $window, $http, baConfig) {
    
    var layoutColors = baConfig.colors;
    $scope.colors = [layoutColors.primary, layoutColors.warning, layoutColors.danger, layoutColors.info, layoutColors.success, layoutColors.primaryDark];
    
    $scope.$on('updateMpTransaction', function(event, startDate, endDate) {  
      $scope.getData(startDate, endDate);
    });
    
    $scope.getData = function(startDate, endDate) {
      $scope.loading = true;
      $http.get('/api/marketplace/transaction?group_by=sentra&aggregate=sum&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          $scope.drawChart(data, $scope.colors);
        })
        .finally(function() {
          $scope.loading= false;
        });
    }

    $scope.drawChart = function(data, colors) {
      if($scope.chart == undefined) {
        $scope.chart = new Morris.Bar({
          element: 'mpTransactionBySentra',
          data: data,
          xkey: 'seller_id',
          ykeys: ['value'],
          labels: ['Nilai Transaksi'],
          preUnits: 'Rp ',
          barColors: colors
        });
      } else {
        $scope.chart.setData(data);
      }
    }

    angular.element($window).bind('resize', function () {
      //$window.Morris.Grid.prototype.redraw();
    });
  }

  // chart
  
})();