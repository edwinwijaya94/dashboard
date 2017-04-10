(function () {
  'use strict';

  angular.module('BlurAdmin.pages.marketplace')
      .directive('mpTransactionFilter', mpTransactionFilter);

  /** @ngInject */
  function mpTransactionFilter() {
    return {
      restrict: 'E',
      controller: 'mpTransactionFilterCtrl',
      templateUrl: 'app/pages/marketplace/mpTransactionFilter/mpTransactionFilter.html'
    };
  }
})();