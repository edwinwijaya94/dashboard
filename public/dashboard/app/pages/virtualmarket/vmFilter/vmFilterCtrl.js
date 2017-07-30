/**
 * Created by n.poltoratsky
 * on 23.06.2016.
 */
(function(){
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket')
      .controller('vmFilterCtrl', vmFilterCtrl);

  /** @ngInject */
  function vmFilterCtrl($scope, $timeout, vmHelper) {

    $scope.startDate = vmHelper.defDate.start;
    $scope.endDate = vmHelper.defDate.end;

    $scope.notifyCharts = function() {
      var startDate = $scope.startDate.format('YYYY-MM-DD');
      var endDate = $scope.endDate.format('YYYY-MM-DD');
      $scope.$emit('vmFilter', startDate, endDate);
    }

    $scope.updateDateRange = function(start, end) {
      $scope.startDate = start;
      $scope.endDate = end;
      $scope.dateRange = vmHelper.formatDateRange(start, end);
      $scope.notifyCharts();
    }
    $timeout(function() {
      angular.element(document.getElementById('vmDatePicker')).daterangepicker({
        startDate: $scope.startDate,
        endDate: $scope.endDate,
        // locale: {
        //   "format": "MM/DD/YYYY",
        // },
        ranges: {
          // 'Hari ini': [moment(), moment()],
          // 'Kemarin': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
          // '7 Hari': [moment().subtract(6, 'days'), moment()],
          'Bulan Ini': [moment().startOf('month'), moment()],
          '30 Hari': [moment().subtract(29, 'days'), moment()],
          '3 Bulan': [moment().subtract(3, 'months'), moment()],
          '1 Tahun': [moment().subtract(1, 'years'), moment()],
          'Tahun Ini': [moment().startOf('year'), moment()]
        },
        maxDate: $scope.endDate,
        showDropdowns: true,
        alwaysShowCalendars: true,
      }, $scope.updateDateRange);
    }, 1000);
    
    $scope.updateDateRange($scope.startDate, $scope.endDate);
  }
})();