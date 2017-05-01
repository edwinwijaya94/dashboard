/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket')
      .controller('vmTransactionCtrl', vmTransactionCtrl);

  /** @ngInject */
  function vmTransactionCtrl($scope, $window, $http, $timeout, baConfig) {
    
    //notify all charts ctrl
    // $scope.$on('vmTransaction', function(event, startDate, endDate) {
    //     $timeout(function() {
    //       $scope.$broadcast('updateVmTransaction', startDate, endDate);  
    //     })
    // });

    // $scope.$on('updateVm', function(event, startDate, endDate) {
    //   console.log('updateVm received');
    
    // });

    angular.element($window).bind('resize', function () {
      //$window.Morris.Grid.prototype.redraw();
    });
  }

 
})();