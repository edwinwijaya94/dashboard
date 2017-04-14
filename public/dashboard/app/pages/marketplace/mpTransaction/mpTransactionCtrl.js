/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.marketplace')
      .controller('mpTransactionCtrl', mpTransactionCtrl);

  /** @ngInject */
  function mpTransactionCtrl($scope, $window, $http, $timeout, baConfig) {
    
    //notify all charts ctrl
    $scope.$on('mpTransaction', function(event, startDate, endDate) {
        $timeout(function() {
          $scope.$broadcast('updateMpTransaction', startDate, endDate);  
        })
    });

    angular.element($window).bind('resize', function () {
      //$window.Morris.Grid.prototype.redraw();
    });
  }

 
})();