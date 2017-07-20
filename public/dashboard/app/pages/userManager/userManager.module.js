/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.userManager', ['ui.select', 'ngSanitize'])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('users', {
          url: '/users',
          title: 'Kelola Akun',
          templateUrl: 'app/pages/userManager/userManager.html',
          // controller: 'ProfilePageCtrl',
        });
  }

})();
