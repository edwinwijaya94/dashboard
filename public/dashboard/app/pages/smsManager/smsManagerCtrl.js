/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.smsManager')
      .controller('smsManagerCtrl', smsManagerCtrl);

  /** @ngInject */
  function smsManagerCtrl($scope, $rootScope, $window, $http, $timeout, baConfig) {
    
    $scope.smsData={};
    // $scope.formMode = 'create';

    // notify
    $scope.$on('addSms', function(event) {
      
        $timeout(function() {
          $rootScope.$broadcast('updateSmsList');  
        }, 1000);
    });
  }

 
})();