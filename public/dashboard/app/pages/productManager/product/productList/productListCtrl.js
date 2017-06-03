
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.productManager')
      .controller('productListCtrl', productListCtrl);

  /** @ngInject */
  function productListCtrl($scope, $timeout, $http, $rootScope, $uibModal, baConfig, baUtil, pmHelper) {
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
      pageSize: 25,
      data: []
    };
    $scope.showEditForm = false;

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

    // edit product
    $scope.editProduct = function(product) {
      $scope.productData = {
        id: product.id,
        name: product.name,
        categoryId: product.category_id,
        productImg: product.product_img,
        price: product.price_min,
        quantity: product.default_quantity,
        unitId: product.default_unit_id
      };

      $scope.showEditForm = true;
      $scope.formMode = 'edit';

      // open edit modal
      var page = 'app/pages/productManager/product/productEditModal.html';
      var size = 'lg';
      $rootScope.editModalInstance = $uibModal.open({
        animation: true,
        templateUrl: page,
        size: size,
        scope: $scope,
        windowClass: 'pv-product-modal'
      });
    };    

    // delete product
    $scope.confirmDelete = function(product) {
      $scope.productDelete = {
        id: product.id,
        name: product.name
      };      
      var page = 'app/pages/productManager/product/productDeleteModal.html';
      var size = 'lg';
      $rootScope.deleteModalInstance = $uibModal.open({
        animation: true,
        templateUrl: page,
        size: size,
        scope: $scope,
        windowClass: 'pv-product-modal'
      });
    };

    // always call confirmDelete() before call deleteProduct()
    $scope.deleteProduct = function() {

      var id = $scope.productDelete.id;
      var hostname = 'http://'+window.location.hostname+':8001';
      $http.delete(hostname+'/api/virtualmarket/product/'+id)
        .then(function(res) {
          $scope.getProductList(); // get updated product list
          $scope.showMessage();
        })
        .finally(function() {
          
        });
    };    

    $scope.formatPrice = function(price) {
      return pmHelper.formatNumber(price,false,false);
    };

    $scope.showMessage = function() {
      var message = 'Produk berhasil dihapus';
      toastr.success(message);
    };
  }
})();