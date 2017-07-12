/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.operational', ['easypiechart', 'ui.select', 'ngSanitize', 'uiGmapgoogle-maps'])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider, uiGmapGoogleMapApiProvider) {
    $stateProvider
        .state('operational', {
          url: '/operational',
          templateUrl: 'app/pages/operational/operational.html',
          title: 'Operasional',
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
