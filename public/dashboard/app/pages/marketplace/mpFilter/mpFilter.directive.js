/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.marketplace')
      .directive('mpFilter', mpFilter);

  /** @ngInject */
  function mpFilter() {
    return {
      restrict: 'E',
      // controller: 'mpFilterCtrl',
      templateUrl: 'app/pages/marketplace/mpFilter/mpFilter.html'
    };
  }
})();