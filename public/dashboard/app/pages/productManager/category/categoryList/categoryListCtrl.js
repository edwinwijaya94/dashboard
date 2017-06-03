
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.productManager')
      .controller('categoryListCtrl', categoryListCtrl);

  /** @ngInject */
  function categoryListCtrl($scope, $timeout, $http, $rootScope, $uibModal, baConfig, baUtil, pmHelper) {
    var layoutColors = baConfig.colors;
    // $scope.colors = [layoutColors.primary, layoutColors.warning, layoutColors.danger, layoutColors.info, layoutColors.success, layoutColors.primaryDark];
    
    // COLORS
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);
    $scope.colors = pmHelper.colors.primary;

    // EVENTS
    $scope.$on('updateCategoryList', function(event) {
      $scope.getCategoryList();
    });

    // MODELS
    $scope.categoryList = {
      pageSize: 25,
      data: []
    };
    $scope.showEditForm = false;

    //CATEGORY LIST
    $scope.getCategoryList = function() {
      var hostname = 'http://'+window.location.hostname+':8001';
      $http.get(hostname+'/api/virtualmarket/categories')
        .then(function(res) {
          $scope.updatedCategoryList = res.data.categories;
        })
        .finally(function() {
          
        });
        // copy references
        $scope.categoryList.data = [].concat($scope.updatedCategoryList);
    };

    // get category list
    $scope.getCategoryList();

    // edit category
    $scope.editCategory = function(category) {
      $scope.categoryData = {
        id: category.id,
        name: category.name,
        categoryImg: category.category_img
      };

      $scope.showEditForm = true;
      $scope.formMode = 'edit';

      // open edit modal
      var page = 'app/pages/productManager/category/categoryEditModal.html';
      var size = 'lg';
      $rootScope.editModalInstance = $uibModal.open({
        animation: true,
        templateUrl: page,
        size: size,
        scope: $scope,
        windowClass: 'pv-category-modal'
      });
    };    

    // delete product
    $scope.confirmDelete = function(category) {
      $scope.categoryDelete = {
        id: category.id,
        name: category.name
      };      
      var page = 'app/pages/productManager/category/categoryDeleteModal.html';
      var size = 'lg';
      $rootScope.deleteModalInstance = $uibModal.open({
        animation: true,
        templateUrl: page,
        size: size,
        scope: $scope,
        windowClass: 'pv-category-modal'
      });
    };

    // always call confirmDelete() before call deleteProduct()
    $scope.deleteCategory = function() {

      var id = $scope.categoryDelete.id;
      var hostname = 'http://'+window.location.hostname+':8001';
      $http.delete(hostname+'/api/virtualmarket/category/'+id)
        .then(function(res) {
          $scope.getCategoryList(); // get updated category list
          $scope.showMessage();
        })
        .finally(function() {
          
        });
    };    

    $scope.showMessage = function() {
      var message = 'Kategori berhasil dihapus';
      toastr.success(message);
    };
  }
})();