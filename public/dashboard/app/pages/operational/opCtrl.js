/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.operational')
      .controller('opCtrl', opCtrl);

  /** @ngInject */
  function opCtrl($scope, $rootScope, $window, $http, $timeout, baConfig, opHelper) {
    
    //notify all charts ctrl in virtual market dashboard
    $scope.$on('opFilter', function(event, startDate, endDate) {
      
        $timeout(function() {
          $rootScope.$broadcast('updateOp', startDate, endDate);  
        }, 1000);

        // get api config info
        $http.get('/api/operational/config?start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          var prevPeriod = {
            startDate: moment(data.prevPeriod.startDate,'YYYY-MM-DD  HH:mm:ss'),
            endDate: moment(data.prevPeriod.endDate,'YYYY-MM-DD  HH:mm:ss'),
          }
          var prevPeriodInfo = opHelper.formatDateRange(prevPeriod.startDate, prevPeriod.endDate);
          $rootScope.periodInfo = '*Data dibandingkan dengan periode sebelumnya ('+prevPeriodInfo+')';
        })
        .finally(function() {
          
        });
    });

    angular.element($window).bind('resize', function () {
      //$window.Morris.Grid.prototype.redraw();
    });
  }

 
})();