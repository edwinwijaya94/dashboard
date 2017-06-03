
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.productManager')
      .controller('unitFormCtrl', unitFormCtrl);

  /** @ngInject */
  function unitFormCtrl($scope, $timeout, $http, $rootScope, baConfig, baUtil, pmHelper, unitFormService, toastr) {
    var layoutColors = baConfig.colors;
    // $scope.colors = [layoutColors.primary, layoutColors.warning, layoutColors.danger, layoutColors.info, layoutColors.success, layoutColors.primaryDark];

    // EVENTS
    $scope.notifyUnitList = function() {
      $scope.$emit('addUnit');
    };

    // COLORS
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);

    $scope.colors = pmHelper.colors.primary;

    // INIT
    if($scope.mode == 'create') {
      $scope.submitText = 'Tambah';
      $scope.unit = {};
      $scope.unit.type = 'common';
    }
    if($scope.mode == 'edit') {
      $scope.submitText = 'Ubah';
    }

    // SUBMIT FORM
    $scope.submitForm = function() {
      var callback = function() {
        $scope.notifyUnitList();
        $scope.resetForm();
        $scope.showMessage();
        if($scope.mode == 'edit') {
          $rootScope.editModalInstance.close('a');
        }
      };

      var hostname = 'http://'+window.location.hostname+':8001';
      if($scope.mode == 'create')
        var uploadUrl = hostname+'/api/virtualmarket/units/add';
      else if($scope.mode == 'edit')
        var uploadUrl = hostname+'/api/virtualmarket/units/edit/'+$scope.unit.id;
      // reassign convertInGram value
      if($scope.unit.type == 'uncommon')
        $scope.unit.convertInGram = 1;

      unitFormService.sendForm($scope.unit, uploadUrl, callback);
    };

    $scope.resetForm = function() {
      $scope.unit = {
        type: 'common'
      };
      // angular.element("input[type='file']").val(null);
    };

    $scope.showMessage = function() {
      var message;
      if($scope.mode == 'create')
        message = 'Satuan berhasil ditambahkan';
      else if($scope.mode == 'edit')
        message = 'Satuan berhasil diubah';
      toastr.success(message);
    };
  }
})();