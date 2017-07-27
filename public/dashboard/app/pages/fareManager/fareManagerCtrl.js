/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.fareManager')
      .controller('fareManagerCtrl', fareManagerCtrl);

  /** @ngInject */
  function fareManagerCtrl($scope, $rootScope, $window, $http, $timeout, baConfig) {
    
    $scope.fareData={};
    // $scope.formMode = 'create';

    // notify
    $scope.$on('editFare', function(event) {
      
        $timeout(function() {
          $rootScope.$broadcast('updateFareList');  
        }, 1000);
    });
  }

 
})();