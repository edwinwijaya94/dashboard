
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.userManager')
      .directive('userForm', userForm);

  /** @ngInject */
  function userForm() {
    return {
      restrict: 'E',
      scope: {
        user: '=user',
        mode: '=mode'
      },
      templateUrl: 'app/pages/userManager/userForm/userForm.html'
    };
  }
})();