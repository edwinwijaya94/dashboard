/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket')
      .directive('vmCommodity', vmCommodity);

  /** @ngInject */
  function vmCommodity() {
    return {
      restrict: 'E',
      // controller: 'vmCommodityCtrl',
      templateUrl: 'app/pages/virtualmarket/vmCommodity/vmCommodity.html'
    };
  }
})();