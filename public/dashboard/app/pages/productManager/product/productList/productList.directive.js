/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.productManager')
      .directive('productList', productList);

  /** @ngInject */
  function productList() {
    return {
      restrict: 'E',
      // controller: 'productListCtrl',
      templateUrl: 'app/pages/productManager/product/productList/productList.html'
    };
  }
})();