
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.productManager')
      .directive('productForm', productForm);

  /** @ngInject */
  function productForm() {
    return {
      restrict: 'E',
      // controller: 'productFormCtrl',
      templateUrl: 'app/pages/productManager/product/productForm/productForm.html'
    };
  }
})();