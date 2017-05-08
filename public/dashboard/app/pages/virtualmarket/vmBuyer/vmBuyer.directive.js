/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket')
      .directive('vmBuyer', vmBuyer);

  /** @ngInject */
  function vmBuyer() {
    return {
      restrict: 'E',
      // controller: 'vmBuyerCtrl',
      templateUrl: 'app/pages/virtualmarket/vmBuyer/vmBuyer.html'
    };
  }
})();