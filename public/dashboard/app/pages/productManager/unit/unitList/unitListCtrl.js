
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.productManager')
      .controller('unitListCtrl', unitListCtrl);

  /** @ngInject */
  function unitListCtrl($scope, $timeout, $http, $rootScope, $uibModal, baConfig, baUtil, pmHelper, toastr) {
    var layoutColors = baConfig.colors;
    // $scope.colors = [layoutColors.primary, layoutColors.warning, layoutColors.danger, layoutColors.info, layoutColors.success, layoutColors.primaryDark];
    
    // COLORS
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);
    $scope.colors = pmHelper.colors.primary;

    // EVENTS
    $scope.$on('updateUnitList', function(event) {
      $scope.getUnitList();
    });

    // MODELS
    $scope.unitList = {
      pageSize: 25,
      data: []
    };
    $scope.showEditForm = false;

    //UNIT LIST
    $scope.getUnitList = function() {
      var hostname = 'http://'+window.location.hostname+':8001';
      $http.get(hostname+'/api/virtualmarket/units')
        .then(function(res) {
          $scope.updatedUnitList = res.data.units;
        })
        .finally(function() {
          
        });
        // copy references
        $scope.unitList.data = [].concat($scope.updatedUnitList);
    };

    // get unit list
    $scope.getUnitList();

    // edit unit
    $scope.editUnit = function(unit) {
      var hostname = 'http://'+window.location.hostname+':8001';
      $http.get(hostname+'/api/virtualmarket/units/'+unit.id)
      .then(function(res) {
        var data = res.data;
        $scope.unitData = {
          id: data.unit.id,
          name: data.unit.unit,
          type: data.unit.unit_type,
        };
        if(data.unit.unit_type == 'common')
          $scope.unitData.convertInGram = data.converter.in_gram;
        else if(data.unit.unit_type == 'uncommon')
          $scope.unitData.convertInGram = 1;
      })
      .finally(function() {
        
      });
      $scope.showEditForm = true;
      $scope.formMode = 'edit';

      // open edit modal
      var page = 'app/pages/productManager/unit/unitEditModal.html';
      var size = 'lg';
      $rootScope.editModalInstance = $uibModal.open({
        animation: true,
        templateUrl: page,
        size: size,
        scope: $scope,
        windowClass: 'pv-unit-modal'
      });
    };    

    // delete product
    $scope.confirmDelete = function(unit) {
      $scope.unitDelete = {
        id: unit.id,
        name: unit.unit
      };      
      var page = 'app/pages/productManager/unit/unitDeleteModal.html';
      var size = 'lg';
      $rootScope.deleteModalInstance = $uibModal.open({
        animation: true,
        templateUrl: page,
        size: size,
        scope: $scope,
        windowClass: 'pv-unit-modal'
      });
    };

    // always call confirmDelete() before call deleteProduct()
    $scope.deleteUnit = function() {

      var id = $scope.unitDelete.id;
      var hostname = 'http://'+window.location.hostname+':8001';
      $http.post(hostname+'/api/virtualmarket/units/delete/'+id)
        .then(function(res) {
          $scope.getUnitList(); // get updated unit list
          $rootScope.deleteModalInstance.close('a');
          $scope.showMessage();
        })
        .finally(function() {
          
        });
    };    

    $scope.formatUnitType = function(type) {
      if(type == 'common')
        return 'Massa';
      else if (type == 'uncommon')
        return 'Lainnya';
    };

    $scope.showMessage = function() {
      var message = 'Satuan berhasil dihapus';
      toastr.success(message);
    };
  }
})();