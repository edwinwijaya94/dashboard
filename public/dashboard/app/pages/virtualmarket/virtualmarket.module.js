/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket', ['easypiechart'])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('virtualmarket', {
          url: '/virtualmarket',
          templateUrl: 'app/pages/virtualmarket/virtualmarket.html',
          title: 'Virtual Market',
          sidebarMeta: {
            icon: 'ion-android-home',
            order: 1,
          },
        });
  }

})();
