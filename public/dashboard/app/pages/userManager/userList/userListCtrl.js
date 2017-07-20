
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.userManager')
      .controller('userListCtrl', userListCtrl);

  /** @ngInject */
  function userListCtrl($scope, $timeout, $http, $rootScope, $uibModal, baConfig, baUtil, toastr) {
    var layoutColors = baConfig.colors;
    // $scope.colors = [layoutColors.primary, layoutColors.warning, layoutColors.danger, layoutColors.info, layoutColors.success, layoutColors.primaryDark];
    
    // COLORS
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);
    // $scope.colors = pmHelper.colors.primary;

    // EVENTS
    $scope.$on('updateUserList', function(event) {
      $scope.getUserList();
    });

    // MODELS
    $scope.userList = {
      pageSize: 25,
      data: []
    };
    $scope.showEditForm = false;

    //USER LIST
    $scope.getUserList = function() {
      // var hostname = 'http://'+window.location.hostname+':8001';
      $http.get('/user/all')
        .then(function(res) {
          $scope.updatedUserList = res.data.user;
        })
        .finally(function() {
          
        });
        // copy references
        $scope.userList.data = [].concat($scope.updatedUserList);
    };

    // get user list
    $scope.getUserList();

    // edit user
    $scope.editUser = function(user) {
      $http.get('/user/'+user.id)
      .then(function(res) {
        var user = res.data.user;
        $scope.userData = {
          id: user.id,
          name: user.name,
          email: user.email,
          // password: user.password,
          roleId: user.role_id
        };
        // if(data.unit.unit_type == 'common')
        //   $scope.unitData.convertInGram = data.converter.in_gram;
        // else if(data.unit.unit_type == 'uncommon')
        //   $scope.unitData.convertInGram = 1;
      })
      .finally(function() {
        
      });
      $scope.showEditForm = true;
      $scope.formMode = 'edit';

      // open edit modal
      var page = 'app/pages/userManager/userEditModal.html';
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
    $scope.confirmDelete = function(user) {
      $scope.userDelete = {
        id: user.id,
        email: user.email
      };      
      var page = 'app/pages/userManager/userDeleteModal.html';
      var size = 'lg';
      $rootScope.deleteModalInstance = $uibModal.open({
        animation: true,
        templateUrl: page,
        size: size,
        scope: $scope,
        windowClass: 'pv-user-modal'
      });
    };

    // always call confirmDelete() before call deleteProduct()
    $scope.deleteUser = function() {

      var id = $scope.userDelete.id;
      $http.post('/user/delete/'+id)
        .then(function(res) {
          $scope.getUserList(); // get updated unit list
          $rootScope.deleteModalInstance.close('a');

          var data = res.data;
          $scope.showMessage(data.status, data.message);
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

    $scope.showMessage = function(status, message) {
      if(status == 'success')
        toastr.success(message);
      else if(status == 'error')
        toastr.error(message);
    };
  }
})();