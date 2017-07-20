/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.userManager')
      .directive('userList', userList);

  /** @ngInject */
  function userList() {
    return {
      restrict: 'E',
      templateUrl: 'app/pages/userManager/userList/userList.html'
    };
  }
})();