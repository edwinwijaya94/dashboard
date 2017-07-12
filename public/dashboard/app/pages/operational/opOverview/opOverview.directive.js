/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.operational')
      .directive('opOverview', opOverview);

  /** @ngInject */
  function opOverview() {
    return {
      restrict: 'E',
      // controller: 'opOverviewCtrl',
      templateUrl: 'app/pages/operational/opOverview/opOverview.html'
    };
  }
})();