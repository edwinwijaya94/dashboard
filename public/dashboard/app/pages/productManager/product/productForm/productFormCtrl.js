
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.productManager')
      .controller('productFormCtrl', productFormCtrl);

  /** @ngInject */
  function productFormCtrl($scope, $timeout, $http, baConfig, baUtil, pmHelper, productFormService) {
    var layoutColors = baConfig.colors;
    // $scope.colors = [layoutColors.primary, layoutColors.warning, layoutColors.danger, layoutColors.info, layoutColors.success, layoutColors.primaryDark];
    
    // COLORS
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);

    $scope.colors = pmHelper.colors.primary;

    // MODELS
    // product form models
    $scope.productForm = {
      // unit: 'ons'
    };


    // CREATE PRODUCT
    $scope.createProduct = function() {
       productFormService.sendForm($scope.productForm);
    };

  }
})();