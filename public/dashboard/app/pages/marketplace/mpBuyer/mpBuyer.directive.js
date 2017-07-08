/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.marketplace')
      .directive('mpBuyer', mpBuyer);
      
  /** @ngInject */
  function mpBuyer() {
    return {
      restrict: 'E',
      // controller: 'mpBuyerCtrl',
      templateUrl: 'app/pages/marketplace/mpBuyer/mpBuyer.html'
    };
  }
})();