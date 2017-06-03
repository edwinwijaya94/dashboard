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
    
    $scope.productData={};
    $scope.formMode = 'create';

    //notify all charts ctrl in virtual market dashboard
    $scope.$on('addProduct', function(event, startDate, endDate) {
      
        $timeout(function() {
          $rootScope.$broadcast('updateProductList');  
        }, 1000);
    });
  }

 
})();