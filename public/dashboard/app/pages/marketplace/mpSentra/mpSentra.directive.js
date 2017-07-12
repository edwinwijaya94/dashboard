/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.marketplace')
      .directive('mpSentra', mpSentra);

  /** @ngInject */
  function mpSentra() {
    return {
      restrict: 'E',
      // controller: 'mpSentraCtrl',
      templateUrl: 'app/pages/marketplace/mpSentra/mpSentra.html'
    };
  }
})();