/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.theme.components')
    .controller('BaSidebarCtrl', BaSidebarCtrl);

  /** @ngInject */
  function BaSidebarCtrl($scope, $location, baSidebarService) {

    // get user role
    var $http = angular.injector(["ng"]).get("$http");
    $http.get('/user/auth')
      .then(function(res) {
        var data = res.data;
        var userRole = data.user.role;
        if(userRole == 'dashboard_admin' || userRole == 'staf_dinas')
          var path = '/virtualmarket';
        else
          var path = '/operational';
        if(window.location.pathname + window.location.search + window.location.hash == '/')
          $scope.$apply(function() { $location.path(path); });
        $scope.menuItems = baSidebarService.getMenuItems(userRole);
        $scope.defaultSidebarState = $scope.menuItems[0].stateRef;        
      })
      .finally(function() {
      });

    // $scope.menuItems = baSidebarService.getMenuItems();
    // $scope.defaultSidebarState = $scope.menuItems[0].stateRef;

    $scope.hoverItem = function ($event) {
      $scope.showHoverElem = true;
      $scope.hoverElemHeight =  $event.currentTarget.clientHeight;
      var menuTopValue = 66;
      $scope.hoverElemTop = $event.currentTarget.getBoundingClientRect().top - menuTopValue;
    };

    $scope.$on('$stateChangeSuccess', function () {
      if (baSidebarService.canSidebarBeHidden()) {
        baSidebarService.setMenuCollapsed(true);
      }
    });
  }
})();