
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.productManager')
      .controller('productListCtrl', productListCtrl);

  /** @ngInject */
  function productListCtrl($scope, $timeout, $http, baConfig, baUtil, pmHelper) {
    var layoutColors = baConfig.colors;
    // $scope.colors = [layoutColors.primary, layoutColors.warning, layoutColors.danger, layoutColors.info, layoutColors.success, layoutColors.primaryDark];
    
    // COLORS
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);
    $scope.colors = pmHelper.colors.primary;

    // EVENTS
    $scope.$on('updateProductList', function(event) {
      $scope.getProductList();
    });

    // MODELS
    $scope.productList = {
      pageSize: 5,
      data: []
    };

    //PRODUCT LIST
    $scope.getProductList = function() {
      var hostname = 'http://'+window.location.hostname+':8001';
      $http.get(hostname+'/api/virtualmarket/product')
        .then(function(res) {
          $scope.updatedProductList = res.data.products;
        })
        .finally(function() {
          
        });
        // copy references
        $scope.productList.data = [].concat($scope.updatedProductList);
    };

    // get product list
    $scope.getProductList();

    $scope.formatPrice = function(price) {
      return pmHelper.formatNumber(price,false,false);
    };
  }
})();