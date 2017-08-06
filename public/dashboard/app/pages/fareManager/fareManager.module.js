/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.fareManager', ['ui.select', 'ngSanitize'])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('fareManager', {
          url: '/fare-manager',
          title: 'Kelola Tarif',
          templateUrl: 'app/pages/fareManager/fareManager.html',
          // controller: 'ProfilePageCtrl',
          sidebarMeta: {
            icon: 'ion-android-home',
            order: 6,
            authRoles: ['staf_pasar', 'dashboard_admin']
          },
        });
  }

})();
