/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket')
      .directive('vmTransaction', vmTransaction);

  /** @ngInject */
  function vmTransaction() {
    return {
      restrict: 'E',
      // controller: 'vmTransactionCtrl',
      templateUrl: 'app/pages/virtualmarket/vmTransaction/vmTransaction.html'
    };
  }
})();