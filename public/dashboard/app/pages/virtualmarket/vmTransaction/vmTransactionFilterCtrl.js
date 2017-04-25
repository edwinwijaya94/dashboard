/**
 * Created by n.poltoratsky
 * on 23.06.2016.
 */
(function(){
    'use strict';

    angular.module('BlurAdmin.pages.virtualmarket')
        .controller('vmTransactionFilterCtrl', vmTransactionFilterCtrl);

    /** @ngInject */
    function vmTransactionFilterCtrl($scope, vmHelper) {

        $scope.startDate = vmHelper.defDate.start;
        $scope.endDate = vmHelper.defDate.end;

        $scope.notifyCharts = function() {
            var startDate = $scope.startDate.format('YYYY-MM-DD');
            var endDate = $scope.endDate.format('YYYY-MM-DD');
            $scope.$emit('vmTransaction', startDate, endDate);
        }

        $scope.updateDateRange = function(start, end) {
            $scope.startDate = start;
            $scope.endDate = end;
            $scope.dateRange = start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY');
            $scope.notifyCharts();
        }

        angular.element(document.getElementById('vmTransactionDate')).daterangepicker({
            startDate: $scope.startDate,
            endDate: $scope.endDate,
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
        
        $scope.updateDateRange($scope.startDate, $scope.endDate);
    }
})();