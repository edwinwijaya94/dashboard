/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.userManager')
      .controller('userManagerCtrl', userManagerCtrl);

  /** @ngInject */
  function userManagerCtrl($scope, $rootScope, $window, $http, $timeout, baConfig) {
    
    $scope.userData={};
    $scope.formMode = 'create';

    // notify
    $scope.$on('addUser', function(event) {
      
        $timeout(function() {
          $rootScope.$broadcast('updateUserList');  
        }, 1000);
    });
  }

 
})();