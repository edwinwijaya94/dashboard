
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.productManager')
      .directive('categoryForm', categoryForm);

  /** @ngInject */
  function categoryForm() {
    return {
      restrict: 'E',
      scope: {
        category: '=category',
        mode: '=mode'
      },
      templateUrl: 'app/pages/productManager/category/categoryForm/categoryForm.html'
    };
  }
})();