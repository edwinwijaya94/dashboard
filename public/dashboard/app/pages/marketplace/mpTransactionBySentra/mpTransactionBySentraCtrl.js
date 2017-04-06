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
    console.log("ok");
    var layoutColors = baConfig.colors;
    $scope.colors = [layoutColors.primary, layoutColors.warning, layoutColors.danger, layoutColors.info, layoutColors.success, layoutColors.primaryDark];
    $http.get('/api/marketplace/transaction?group_by=seller_id&aggregate=sum&start_date=2016-01-01&end_date=2017-05-01').then(function(res) {
      var data = res.data.data;
      drawChart(data, $scope.colors);
    });

    angular.element($window).bind('resize', function () {
      //$window.Morris.Grid.prototype.redraw();
    });
  }

  // chart
  function drawChart(data, colors) {
    new Morris.Bar({
      element: 'mpTransactionBySentra',
      data: data,
      xkey: 'seller_id',
      ykeys: ['value'],
      labels: ['Nilai Transaksi'],
      preUnits: 'Rp ',
      barColors: colors
    });
  }
})();