/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket')
      .controller('vmCtrl', vmCtrl);

  /** @ngInject */
  function vmCtrl($scope, $rootScope, $window, $http, $timeout, baConfig) {
    
    //notify all charts ctrl in virtual market dashboard
    $scope.$on('vmFilter', function(event, startDate, endDate) {
        console.log('vmfilter received');
        $timeout(function() {
          $rootScope.$broadcast('updateVm', startDate, endDate);  
        }, 1000);
    });

    angular.element($window).bind('resize', function () {
      //$window.Morris.Grid.prototype.redraw();
    });
  }

 
})();