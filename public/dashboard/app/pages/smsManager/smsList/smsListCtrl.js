
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.smsManager')
      .controller('smsListCtrl', smsListCtrl);

  /** @ngInject */
  function smsListCtrl($scope, $timeout, $http, $rootScope, $uibModal, baConfig, baUtil, toastr) {
    var layoutColors = baConfig.colors;
    // $scope.colors = [layoutColors.primary, layoutColors.warning, layoutColors.danger, layoutColors.info, layoutColors.success, layoutColors.primaryDark];
    
    // COLORS
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);
    // $scope.colors = pmHelper.colors.primary;

    var hostname = 'http://'+window.location.hostname+':8001';

    // EVENTS
    $scope.$on('updateSmsList', function(event) {
      $scope.getUserList();
    });

    // MODELS
    $scope.smsList = {
      pageSize: 25,
      data: []
    };

    //SMS LIST
    $scope.getSmsList = function() {
      $http.get(hostname+'/api/virtualmarket/undefine/word')
        .then(function(res) {
          $scope.updatedSmsList = res.data.undefine;
        })
        .finally(function() {
          
        });
        // copy references
        $scope.smsList.data = [].concat($scope.updatedSmsList);
    };

    // get undefine word list
    $scope.getSmsList();

    $scope.submit = function(sms) {
      console.log(sms);
      var data = {}
      data.abbreviation = sms.undefine_word;
      data.word = sms.word;
      $http.post(hostname+'/api/virtualmarket/dictionary/add', data)
        .then(function(res) {

        })
        .finally(function() {
          $scope.showMessage('success', 'Singkatan berhasil dimasukkan');
          $scope.getSmsList();
        });
    }

    $scope.showMessage = function(status, message) {
      if(status == 'success')
        toastr.success(message);
      else if(status == 'error')
        toastr.error(message);
    };
  }
})();