/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.productManager')
      .directive('categoryList', categoryList);

  /** @ngInject */
  function categoryList() {
    return {
      restrict: 'E',
      templateUrl: 'app/pages/productManager/category/categoryList/categoryList.html'
    };
  }
})();