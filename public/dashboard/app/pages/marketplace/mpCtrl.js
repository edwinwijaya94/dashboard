/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.marketplace')
      .controller('mpCtrl', mpCtrl);

  /** @ngInject */
  function mpCtrl($scope, $rootScope, $window, $http, $timeout, baConfig, mpHelper) {
    
    //notify all charts ctrl in marketplace dashboard
    $scope.$on('mpFilter', function(event, startDate, endDate) {
      
      $timeout(function() {
        $rootScope.$broadcast('updateMp', startDate, endDate);  
      }, 1000);

      // get api config info
      $http.get('/api/marketplace/config?start_date='+startDate+'&end_date='+endDate)
      .then(function(res) {
        var data = res.data.data;
        var prevPeriod = {
          startDate: moment(data.prevPeriod.startDate,'YYYY-MM-DD  HH:mm:ss'),
          endDate: moment(data.prevPeriod.endDate,'YYYY-MM-DD  HH:mm:ss'),
        }
        var prevPeriodInfo = mpHelper.formatDateRange(prevPeriod.startDate, prevPeriod.endDate);
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