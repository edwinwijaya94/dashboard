
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.productManager')
      .directive('unitForm', unitForm);

  /** @ngInject */
  function unitForm() {
    return {
      restrict: 'E',
      scope: {
        unit: '=unit',
        mode: '=mode'
      },
      templateUrl: 'app/pages/productManager/unit/unitForm/unitForm.html'
    };
  }
})();