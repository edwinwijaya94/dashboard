/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.productManager')
      .directive('unitList', unitList);

  /** @ngInject */
  function unitList() {
    return {
      restrict: 'E',
      templateUrl: 'app/pages/productManager/unit/unitList/unitList.html'
    };
  }
})();