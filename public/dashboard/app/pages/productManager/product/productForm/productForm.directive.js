
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.productManager')
      .directive('productForm', productForm);

  /** @ngInject */
  function productForm() {
    return {
      restrict: 'E',
      scope: {
        product: '=product',
        mode: '=mode'
      },
      templateUrl: 'app/pages/productManager/product/productForm/productForm.html'
      // link: function (scope, element, attrs) {
      //   console.log('Scope property:', scope.product);
      // }
    };
  }
})();