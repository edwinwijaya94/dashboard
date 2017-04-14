/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.marketplace')
      .directive('mpTransaction', mpTransaction);

  /** @ngInject */
  function mpTransaction() {
    return {
      restrict: 'E',
      // controller: 'mpTransactionCtrl',
      templateUrl: 'app/pages/marketplace/mpTransaction/mpTransaction.html'
    };
  }
})();