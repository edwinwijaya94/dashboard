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
    $scope.categoryData={};
    $scope.formMode = 'create';

    // notify
    $scope.$on('addProduct', function(event) {
      
        $timeout(function() {
          $rootScope.$broadcast('updateProductList');  
        }, 1000);
    });
    $scope.$on('addCategory', function(event) {
      
        $timeout(function() {
          $rootScope.$broadcast('updateCategoryList');  
        }, 1000);
    });
  }

 
})();