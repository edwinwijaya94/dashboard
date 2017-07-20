
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
      data: [
        // {
        //   abbreviation: 'dgng'
        // },
        // {
        //   abbreviation: 'bym'
        // },
        // {
        //   abbreviation: 'kntg'
        // },
      ]
    };

    $scope.updatedSmsList = [
      {
        id: 1,
        abbreviation: 'dgng'
      },
      {
        id: 2,
        abbreviation: 'bym'
      },
      {
        id: 3,
        abbreviation: 'kntg'
      },
    ];

    

    //SMS LIST
    $scope.getSmsList = function() {
      $http.get(hostname+'/api/sms')
        .then(function(res) {
          $scope.updatedSmsList = res.data.sms;
        })
        .finally(function() {
          
        });
        // copy references
        $scope.smsList.data = [].concat($scope.updatedSmsList);
    };

    // get user list
    $scope.getSmsList();

    $scope.submit = function(sms) {
      var data = {}
      data.id = sms.id;
      data.meaning = sms.meaning;
      $http.post(hostname+'/api/sms', data)
        .then(function(res) {
          $scope.updatedSmsList = res.data.sms;
        })
        .finally(function() {
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