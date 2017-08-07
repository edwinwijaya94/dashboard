/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.smsManager', ['ui.select', 'ngSanitize'])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('smsManager', {
          url: '/sms-manager',
          title: 'Kelola Singkatan',
          templateUrl: 'app/pages/smsManager/smsManager.html',
          // controller: 'ProfilePageCtrl',
          sidebarMeta: {
            icon: 'ion-android-home',
            order: 5,
            authRoles: ['staf_pasar', 'dashboard_admin']
          },
        });
  }

})();
