
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.productManager')
      .controller('productFormCtrl', productFormCtrl);

  /** @ngInject */
  function productFormCtrl($scope, $timeout, $http, $rootScope, baConfig, baUtil, pmHelper, productFormService, toastr) {
    var layoutColors = baConfig.colors;
    // $scope.colors = [layoutColors.primary, layoutColors.warning, layoutColors.danger, layoutColors.info, layoutColors.success, layoutColors.primaryDark];

    // EVENTS
    $scope.notifyProductList = function() {
      $scope.$emit('addProduct');
    };

    $scope.loadImg = function(element) {
      $scope.currentFile = element.files[0];
       var reader = new FileReader();

      reader.onload = function(event) {
        $scope.product.imgUrl = event.target.result;
        $scope.product.showImg = true;
        $scope.$apply();

      }
      // when the file is read it triggers the onload event above.
      reader.readAsDataURL(element.files[0]);
    }

    // COLORS
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);

    $scope.colors = pmHelper.colors.primary;

    // INIT
    if($scope.mode == 'create') {
      $scope.product.showImg = false;
      $scope.product.isUploadImg = true;
      $scope.submitText = 'Tambah';
    }
    if($scope.mode == 'edit') {
      var hostname = 'http://'+window.location.hostname+':8001';
      $scope.product.imgUrl = hostname+'/api/virtualmarket/images/products/'+$scope.product.productImg
      $scope.product.showImg = true;
      $scope.product.isUploadImg = false;
      $scope.submitText = 'Ubah';
    }
      

    //FORM OPTIONS
    // category list
    $scope.getCategoryList = function() {
      var hostname = 'http://'+window.location.hostname+':8001';
      $http.get(hostname+'/api/virtualmarket/categories')
        .then(function(res) {
          $scope.categoryList = res.data.categories;
          
          if($scope.mode == 'create') {
            $scope.product.category = $scope.categoryList[0];  
          } else if($scope.mode == 'edit') {
            var i;
            for(i = 0; i < $scope.categoryList.length; i++) {
              if($scope.categoryList[i].id == $scope.product.categoryId)
                break;
            }
            $scope.product.category = $scope.categoryList[i];
          }
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
          
          if($scope.mode == 'create') {
            $scope.product.unit = $scope.unitList[0];
          } else if($scope.mode == 'edit') {
            var i;
            for(i = 0; i < $scope.unitList.length; i++) {
              if($scope.unitList[i].id == $scope.product.unitId)
                break;
            }
            $scope.product.unit = $scope.unitList[i];
          }
        })
        .finally(function() {
          
        });
    };
    $scope.getCategoryList();
    $scope.getUnitList();

    // SUBMIT FORM
    $scope.submitForm = function() {
      var callback = function() {
        $scope.notifyProductList();
        $scope.resetForm();
        $scope.showMessage();
        if($scope.mode == 'edit') {
          $rootScope.editModalInstance.close('a');
        }
      };

      var hostname = 'http://'+window.location.hostname+':8001';
      if($scope.mode == 'create')
        var uploadUrl = hostname+'/api/virtualmarket/product/add';
      else if($scope.mode == 'edit')
        var uploadUrl = hostname+'/api/virtualmarket/product/edit/'+$scope.product.id;
      
      productFormService.sendForm($scope.product, uploadUrl, callback);
    };

    $scope.resetForm = function() {
      $scope.product = {};    
      $scope.product.category = $scope.categoryList[0];
      $scope.product.unit = $scope.unitList[0];
      angular.element("input[type='file']").val(null);
    };

    $scope.showMessage = function() {
      var message;
      if($scope.mode == 'create')
        message = 'Produk berhasil ditambahkan';
      else if($scope.mode == 'edit')
        message = 'Produk berhasil diubah';
      toastr.success(message);
    };
  }
})();