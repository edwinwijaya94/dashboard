/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket')
      .directive('vmOverview', vmOverview);

  /** @ngInject */
  function vmOverview() {
    return {
      restrict: 'E',
      // controller: 'vmOverviewCtrl',
      templateUrl: 'app/pages/virtualmarket/vmOverview/vmOverview.html'
    };
  }
})();