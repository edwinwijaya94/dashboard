/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.operational')
      .directive('opFilter', opFilter);

  /** @ngInject */
  function opFilter() {
    return {
      restrict: 'E',
      // controller: 'opFilterCtrl',
      templateUrl: 'app/pages/operational/opFilter/opFilter.html'
    };
  }
})();