/**
 * Created by n.poltoratsky
 * on 23.06.2016.
 */
(function(){
  'use strict';

  angular.module('BlurAdmin.pages.operational')
      .controller('opFilterCtrl', opFilterCtrl);

  /** @ngInject */
  function opFilterCtrl($scope, $timeout, opHelper) {

    $scope.startDate = opHelper.defDate.start;
    $scope.endDate = opHelper.defDate.end;
    $scope.dateRange = opHelper.defDate.label;

    $scope.notifyCharts = function() {
      var startDate = $scope.startDate.format('YYYY-MM-DD HH:mm:ss');
      var endDate = $scope.endDate.format('YYYY-MM-DD HH:mm:ss');
      $scope.$emit('opFilter', startDate, endDate);
    }

    $scope.updateDateRange = function(start, end, selectedRange) {
      $scope.startDate = start;
      $scope.endDate = end;
      // $scope.dateRange = opHelper.formatDateRange(start, end);
      $scope.dateRange = selectedRange;
      $scope.notifyCharts();
    }
    $timeout(function() {
      angular.element(document.getElementById('opDatePicker')).daterangepicker({
        startDate: $scope.startDate,
        endDate: $scope.endDate,
        timePicker: true,
        timePicker24Hour: true,
        // locale: {
        //   "format": "MM/DD/YYYY",
        // },
        ranges: {
          'Hari ini': [moment().startOf('day'), moment()],
          '1 Jam': [moment().subtract(1, 'hour'), moment()],
          '2 Jam': [moment().subtract(2, 'hour'), moment()],
          '4 Jam': [moment().subtract(4, 'hour'), moment()],
          // 'Kemarin': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
          // '7 Hari': [moment().subtract(6, 'days'), moment()],
          // '30 Hari': [moment().subtract(29, 'days'), moment()],
          // '1 Tahun': [moment().subtract(364, 'days'), moment()],
          // 'Tahun Ini': [moment().startOf('year'), moment()],
          
        },
        maxDate: $scope.endDate,
        showDropdowns: true,
        // alwaysShowCalendars: true,
        showCustomRangeLabel: false,
      }, $scope.updateDateRange);
    }, 1000);
    
    $scope.updateDateRange($scope.startDate, $scope.endDate, $scope.dateRange);
  }
})();