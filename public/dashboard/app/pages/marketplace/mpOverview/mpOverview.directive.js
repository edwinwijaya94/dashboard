/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.marketplace')
      .directive('mpOverview', mpOverview);

  /** @ngInject */
  function mpOverview() {
    return {
      restrict: 'E',
      // controller: 'mpOverviewCtrl',
      templateUrl: 'app/pages/marketplace/mpOverview/mpOverview.html'
    };
  }
})();