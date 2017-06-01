
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.productManager')
      .controller('productFormCtrl', productFormCtrl);

  /** @ngInject */
  function productFormCtrl($scope, $timeout, $http, baConfig, baUtil, pmHelper, productFormService, toastr) {
    var layoutColors = baConfig.colors;
    // $scope.colors = [layoutColors.primary, layoutColors.warning, layoutColors.danger, layoutColors.info, layoutColors.success, layoutColors.primaryDark];

    // EVENTS
    $scope.notifyProductList = function() {
      $scope.$emit('addProduct');
    };

    // COLORS
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);

    $scope.colors = pmHelper.colors.primary;

    // MODELS
    $scope.productForm = {};


    // CREATE PRODUCT
    $scope.createProduct = function() {
      var callback = function() {
        $scope.notifyProductList();
        $scope.resetForm();
        $scope.showMessage();
      };
      productFormService.sendForm($scope.productForm, callback);
    };

    $scope.resetForm = function() {
      $scope.productForm = {};      
      angular.element("input[type='file']").val(null);
    };

    $scope.showMessage = function() {
      toastr.success('Produk berhasil ditambahkan');
    };
  }
})();