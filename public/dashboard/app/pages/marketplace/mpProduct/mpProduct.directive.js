/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.marketplace')
      .directive('mpProduct', mpProduct);

  /** @ngInject */
  function mpProduct() {
    return {
      restrict: 'E',
      // controller: 'mpProductCtrl',
      templateUrl: 'app/pages/marketplace/mpProduct/mpProduct.html'
    };
  }
})();