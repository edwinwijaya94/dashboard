/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.marketplace')
      .directive('mpTransactionByHistory', mpTransactionByHistory);

  /** @ngInject */
  function mpTransactionByHistory() {
    return {
      restrict: 'E',
      controller: 'mpTransactionByHistoryCtrl',
      templateUrl: 'app/pages/marketplace/mpTransactionByHistory/mpTransactionByHistory.html'
    };
  }
})();