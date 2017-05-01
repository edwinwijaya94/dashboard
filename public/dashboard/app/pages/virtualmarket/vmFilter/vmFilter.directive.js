/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket')
      .directive('vmFilter', vmFilter);

  /** @ngInject */
  function vmFilter() {
    return {
      restrict: 'E',
      // controller: 'vmFilterCtrl',
      templateUrl: 'app/pages/virtualmarket/vmFilter/vmFilter.html'
    };
  }
})();