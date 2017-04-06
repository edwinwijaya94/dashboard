/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.marketplace')
      .directive('mpTransactionBySentra', mpTransactionBySentra);

  /** @ngInject */
  function mpTransactionBySentra() {
    return {
      restrict: 'E',
      controller: 'mpTransactionBySentraCtrl',
      templateUrl: 'app/pages/marketplace/mpTransactionBySentra/mpTransactionBySentra.html'
    };
  }
})();