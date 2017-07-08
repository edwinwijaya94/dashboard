/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.marketplace')
      .controller('mpCtrl', mpCtrl);

  /** @ngInject */
  function mpCtrl($scope, $rootScope, $window, $http, $timeout, baConfig) {
    
    //notify all charts ctrl in marketplace dashboard
    $scope.$on('mpFilter', function(event, startDate, endDate) {
      console.log('called');
      $timeout(function() {
        $rootScope.$broadcast('updateMp', startDate, endDate);  
      }, 1000);
    });

    angular.element($window).bind('resize', function () {
      //$window.Morris.Grid.prototype.redraw();
    });
  }

 
})();