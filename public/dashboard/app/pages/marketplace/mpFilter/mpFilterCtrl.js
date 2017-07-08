/**
 * Created by n.poltoratsky
 * on 23.06.2016.
 */
(function(){
  'use strict';

  angular.module('BlurAdmin.pages.marketplace')
      .controller('mpFilterCtrl', mpFilterCtrl);

  /** @ngInject */
  function mpFilterCtrl($scope, $timeout, mpHelper) {

    $scope.startDate = mpHelper.defDate.start;
    $scope.endDate = mpHelper.defDate.end;

    $scope.notifyCharts = function() {
      var startDate = $scope.startDate.format('YYYY-MM-DD');
      var endDate = $scope.endDate.format('YYYY-MM-DD');
      $scope.$emit('mpFilter', startDate, endDate);
      console.log("HI");
    }

    $scope.updateDateRange = function(start, end) {
      $scope.startDate = start;
      $scope.endDate = end;
      $scope.dateRange = mpHelper.formatDateRange(start, end);
      $scope.notifyCharts();
    }
    $timeout(function() {
      angular.element(document.getElementById('mpDatePicker')).daterangepicker({
        startDate: $scope.startDate,
        endDate: $scope.endDate,
        // locale: {
        //   "format": "MM/DD/YYYY",
        // },
        ranges: {
          'Hari ini': [moment(), moment()],
          'Kemarin': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
          '7 Hari': [moment().subtract(6, 'days'), moment()],
          '30 Hari': [moment().subtract(29, 'days'), moment()],
          '1 Tahun': [moment().subtract(364, 'days'), moment()],
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