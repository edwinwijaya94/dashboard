/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.productManager')
      .controller('pmCtrl', pmCtrl);

  /** @ngInject */
  function pmCtrl($scope, $rootScope, $window, $http, $timeout, baConfig) {
    
    //notify all charts ctrl in virtual market dashboard
    // $scope.$on('vmFilter', function(event, startDate, endDate) {
      
    //     $timeout(function() {
    //       $rootScope.$broadcast('updateVm', startDate, endDate);  
    //     }, 1000);
    // });

    // angular.element($window).bind('resize', function () {
    //   //$window.Morris.Grid.prototype.redraw();
    // });
  }

 
})();