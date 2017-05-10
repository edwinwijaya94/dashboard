/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket')
      .directive('vmShopper', vmShopper);

  /** @ngInject */
  function vmShopper() {
    return {
      restrict: 'E',
      // controller: 'vmShopperCtrl',
      templateUrl: 'app/pages/virtualmarket/vmShopper/vmShopper.html'
    };
  }
})();