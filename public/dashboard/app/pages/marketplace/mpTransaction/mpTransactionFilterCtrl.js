/**
 * Created by n.poltoratsky
 * on 23.06.2016.
 */
(function(){
    'use strict';

    angular.module('BlurAdmin.pages.marketplace')
        .controller('mpTransactionFilterCtrl', mpTransactionFilterCtrl);

    /** @ngInject */
    function mpTransactionFilterCtrl($scope) {

        $scope.startDate = moment().subtract(29, 'days');
        $scope.endDate = moment();

        $scope.notifyCharts = function() {
            var startDate = $scope.startDate.format('YYYY-MM-DD');
            var endDate = $scope.endDate.format('YYYY-MM-DD');
            $scope.$emit('mpTransaction', startDate, endDate);
        }

        $scope.updateDateRange = function(start, end) {
            $scope.startDate = start;
            $scope.endDate = end;
            $scope.dateRange = start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY');
            $scope.notifyCharts();
        }

        angular.element(document.getElementById('mpTransactionDate')).daterangepicker({
            startDate: $scope.startDate,
            endDate: $scope.endDate,
            ranges: {
               'Hari ini': [moment(), moment()],
               'Kemarin': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
               '7 Hari': [moment().subtract(6, 'days'), moment()],
               '30 Hari': [moment().subtract(29, 'days'), moment()],
               'Bulan Ini': [moment().startOf('month'), moment().endOf('month')],
               'Bulan Lalu': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            },
            maxDate: $scope.endDate,
            showDropdowns: true,
            alwaysShowCalendars: true,
        }, $scope.updateDateRange);
        
        $scope.updateDateRange($scope.startDate, $scope.endDate);
    }
})();