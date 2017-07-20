
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.userManager')
      .controller('userFormCtrl', userFormCtrl);

  /** @ngInject */
  function userFormCtrl($scope, $timeout, $http, $rootScope, baConfig, baUtil, toastr) {
    var layoutColors = baConfig.colors;
    // $scope.colors = [layoutColors.primary, layoutColors.warning, layoutColors.danger, layoutColors.info, layoutColors.success, layoutColors.primaryDark];

    // EVENTS
    $scope.notifyUserList = function() {
      $scope.$emit('addUser');
    };

    // COLORS
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);

    // $scope.colors = pmHelper.colors.primary;

    // INIT
    if($scope.mode == 'create') {
      $scope.submitText = 'Tambah';
      $scope.user = {
        isChangePassword: true,
      };
    }
    if($scope.mode == 'edit') {
      $scope.submitText = 'Ubah';
      $scope.user.isChangePassword = false;
    }

    $scope.getRoleList = function() {
      $http.get('/user/roles')
        .then(function(res) {
          $scope.roleList = res.data.role;

          if($scope.mode == 'create') {
            $scope.user.role = $scope.roleList[0];  
          } else if($scope.mode == 'edit') {
            var i;
            for(i = 0; i < $scope.roleList.length; i++) {
              if($scope.roleList[i].id == $scope.user.roleId)
                break;
            }
            $scope.user.role = $scope.roleList[i];
          }
        })
        .finally(function() {
          
        });
    };
    $scope.getRoleList();

    // SUBMIT FORM
    $scope.submitForm = function() {
      var callback = function() {
        $scope.notifyUserList();
        $scope.resetForm();
        $scope.showMessage();
        if($scope.mode == 'edit') {
          $rootScope.editModalInstance.close('a');
        }
      };

      // var hostname = 'http://'+window.location.hostname+':8001';
      if($scope.mode == 'create')
        var uploadUrl = '/user/add';
      else if($scope.mode == 'edit')
        var uploadUrl = '/user/edit';

      var data = {};
      if($scope.mode == 'edit')
        data.id = $scope.user.id;
      data.name = $scope.user.name;
      data.email = $scope.user.email;
      data.is_change_password = $scope.user.isChangePassword;
      if(data.is_change_password)
        data.password = $scope.user.password;
      data.role_id = $scope.user.role.id;

      $http.post(uploadUrl, data)
        .then(function(res) {
        })
        .finally(function() {
          callback();
        });
    };

    $scope.resetForm = function() {
      $scope.user = {
        
      };
    };

    $scope.showMessage = function() {
      var message;
      if($scope.mode == 'create')
        message = 'Pengguna berhasil ditambahkan';
      else if($scope.mode == 'edit')
        message = 'Pengguna berhasil diubah';
      toastr.success(message);
    };
  }
})();