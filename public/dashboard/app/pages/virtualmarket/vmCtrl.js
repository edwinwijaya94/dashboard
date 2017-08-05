/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket')
      .controller('vmCtrl', vmCtrl);

  /** @ngInject */
  function vmCtrl($scope, $rootScope, $window, $http, $timeout, baConfig, vmHelper) {
    
    //notify all charts ctrl in virtual market dashboard
    $scope.$on('vmFilter', function(event, startDate, endDate) {
      
        $timeout(function() {
          $rootScope.$broadcast('updateVm', startDate, endDate);  
        }, 1000);

        // get api config info
        $http.get('/api/virtualmarket/config?start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          var prevPeriod = {
            startDate: moment(data.prevPeriod.startDate,'YYYY-MM-DD  HH:mm:ss'),
            endDate: moment(data.prevPeriod.endDate,'YYYY-MM-DD  HH:mm:ss'),
          }
          var prevPeriodInfo = vmHelper.formatDateRange(prevPeriod.startDate, prevPeriod.endDate);
          $scope.periodInfo = '*Data dibandingkan dengan periode sebelumnya ('+prevPeriodInfo+')';
        })
        .finally(function() {
          
        });
    });

    angular.element($window).bind('resize', function () {
      //$window.Morris.Grid.prototype.redraw();
    });
  }

 
})();