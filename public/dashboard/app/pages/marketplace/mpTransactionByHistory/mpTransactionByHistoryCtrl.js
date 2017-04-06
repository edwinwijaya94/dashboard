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
    $http.get('/api/marketplace/transaction?group_by=history&aggregate=sum&start_date=2016-01-01&end_date=2017-05-01').then(function(res) {
      var resp = res.data.data;
      var data = [];
      var i;
      for(i=0; i<resp.length; i++) {
        var x = {};
        x.time = resp[i].yr+'-'+resp[i].mo;
        x.value = resp[i].value;
        data.push(x);
      }
      drawChart(data, $scope.colors);
    });

    angular.element($window).bind('resize', function () {
      //$window.Morris.Grid.prototype.redraw();
    });
  }

  // chart
  function drawChart(data, colors) {
    new Morris.Line({
      element: 'mpTransactionByHistory',
      data: data,
      xkey: 'time',
      ykeys: ['value'],
      labels: ['Nilai Transaksi'],
      preUnits: 'Rp ',
      lineColors: colors
    });
  }
})();