/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket', ['easypiechart', 'ui.select', 'ngSanitize', 'uiGmapgoogle-maps'])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider, uiGmapGoogleMapApiProvider) {
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

    uiGmapGoogleMapApiProvider.configure({
          key: 'AIzaSyBjNwqA1TB6RC_5rnlIE4Aqfijd3iHoRRs',
          v: '3.27', //defaults to latest 3.X anyhow
          libraries: 'weather,geometry,visualization'
        });
  }

})();
