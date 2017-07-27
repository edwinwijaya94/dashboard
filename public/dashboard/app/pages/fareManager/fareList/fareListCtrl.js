
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.fareManager')
      .controller('fareListCtrl', fareListCtrl);

  /** @ngInject */
  function fareListCtrl($scope, $timeout, $http, $rootScope, $uibModal, baConfig, baUtil, toastr) {
    var layoutColors = baConfig.colors;
    // $scope.colors = [layoutColors.primary, layoutColors.warning, layoutColors.danger, layoutColors.info, layoutColors.success, layoutColors.primaryDark];
    
    // COLORS
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);
    // $scope.colors = pmHelper.colors.primary;

    var hostname = 'http://'+window.location.hostname+':8001';

    // EVENTS
    $scope.$on('updateFareList', function(event) {
      $scope.getFareRates();
    });

    // MODELS

    //SMS LIST
    $scope.getFareRates = function() {
      $http.get(hostname+'/api/virtualmarket/getAllRates')
        .then(function(res) {
          $scope.fareRates = res.data;
        })
        .finally(function() {
          
        });
    };

    // get fares
    $scope.getFareRates();

    $scope.submitForm = function() {
      var fareRates = $scope.fareRates;
      var data = {};
      for(var i=0; i<fareRates.length; i++){
        data[fareRates[i].parameter] = fareRates[i].constant;
      }
      $http.post(hostname+'/api/virtualmarket/updateRates', data, {
                headers: {
                   'Content-Type': 'application/json; charset=utf-8'
                }})
        .then(function(res) {
          
        })
        .finally(function() {
          $scope.getFareRates();
          $scope.showMessage('success', 'Tarif berhasil diubah')
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