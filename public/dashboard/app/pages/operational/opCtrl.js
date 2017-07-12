/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.operational')
      .controller('opCtrl', opCtrl);

  /** @ngInject */
  function opCtrl($scope, $rootScope, $window, $http, $timeout, baConfig) {
    
    //notify all charts ctrl in virtual market dashboard
    $scope.$on('opFilter', function(event, startDate, endDate) {
      
        $timeout(function() {
          $rootScope.$broadcast('updateOp', startDate, endDate);  
        }, 1000);
    });

    angular.element($window).bind('resize', function () {
      //$window.Morris.Grid.prototype.redraw();
    });
  }

 
})();