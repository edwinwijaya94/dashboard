
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.productManager')
      .controller('categoryFormCtrl', categoryFormCtrl);

  /** @ngInject */
  function categoryFormCtrl($scope, $timeout, $http, $rootScope, baConfig, baUtil, pmHelper, categoryFormService, toastr) {
    var layoutColors = baConfig.colors;
    // $scope.colors = [layoutColors.primary, layoutColors.warning, layoutColors.danger, layoutColors.info, layoutColors.success, layoutColors.primaryDark];

    // EVENTS
    $scope.notifyCategoryList = function() {
      $scope.$emit('addCategory');
    };

    $scope.loadImg = function(element) {
      $scope.currentFile = element.files[0];
       var reader = new FileReader();

      reader.onload = function(event) {
        $scope.category.imgUrl = event.target.result;
        $scope.category.showImg = true;
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
      $scope.category.showImg = false;
      $scope.category.isUploadImg = true;
      $scope.submitText = 'Tambah';
    }
    if($scope.mode == 'edit') {
      var hostname = 'http://'+window.location.hostname+':8001';
      $scope.category.imgUrl = hostname+'/api/virtualmarket/images/categories/'+$scope.category.categoryImg
      $scope.category.showImg = true;
      $scope.category.isUploadImg = false;
      $scope.submitText = 'Ubah';
    }    

    // SUBMIT FORM
    $scope.submitForm = function() {
      var callback = function() {
        $scope.notifyCategoryList();
        $scope.resetForm();
        $scope.showMessage();
        if($scope.mode == 'edit') {
          $rootScope.editModalInstance.close('a');
        }
      };

      var hostname = 'http://'+window.location.hostname+':8001';
      if($scope.mode == 'create')
        var uploadUrl = hostname+'/api/virtualmarket/categories/add';
      else if($scope.mode == 'edit')
        var uploadUrl = hostname+'/api/virtualmarket/categories/edit/'+$scope.category.id;
      
      categoryFormService.sendForm($scope.category, uploadUrl, callback);
    };

    $scope.resetForm = function() {
      $scope.category = {
        isUploadImg: true,
        isShowImg: false
      };
      angular.element("input[type='file']").val(null);
    };

    $scope.showMessage = function() {
      var message;
      if($scope.mode == 'create')
        message = 'Kategori berhasil ditambahkan';
      else if($scope.mode == 'edit')
        message = 'Kategori berhasil diubah';
      toastr.success(message);
    };
  }
})();