/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket')
      .directive('vmProduct', vmProduct);

  /** @ngInject */
  function vmProduct() {
    return {
      restrict: 'E',
      // controller: 'vmProductCtrl',
      templateUrl: 'app/pages/virtualmarket/vmProduct/vmProduct.html'
    };
  }
})();