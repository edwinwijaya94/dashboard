
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

    //FORM OPTIONS
    // category list
    $scope.getCategoryList = function() {
      var hostname = 'http://'+window.location.hostname+':8001';
      $http.get(hostname+'/api/virtualmarket/categories')
        .then(function(res) {
          $scope.categoryList = res.data.categories;
          $scope.productForm.category = $scope.categoryList[0];
        })
        .finally(function() {
          
        });
    };
    // units list
    $scope.getUnitList = function() {
      var hostname = 'http://'+window.location.hostname+':8001';
      $http.get(hostname+'/api/virtualmarket/units')
        .then(function(res) {
          $scope.unitList = res.data.units;
          $scope.productForm.unit = $scope.unitList[0];
        })
        .finally(function() {
          
        });
    };
    $scope.getCategoryList();
    $scope.getUnitList();

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
      $scope.productForm.category = $scope.categoryList[0];
      $scope.productForm.unit = $scope.unitList[0];
      angular.element("input[type='file']").val(null);
    };

    $scope.showMessage = function() {
      toastr.success('Produk berhasil ditambahkan');
    };
  }
})();