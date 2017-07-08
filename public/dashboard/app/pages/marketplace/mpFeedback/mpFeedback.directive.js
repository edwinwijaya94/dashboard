/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.marketplace')
      .directive('mpFeedback', mpFeedback);

  /** @ngInject */
  function mpFeedback() {
    return {
      restrict: 'E',
      // controller: 'mpFeedbackCtrl',
      templateUrl: 'app/pages/marketplace/mpFeedback/mpFeedback.html'
    };
  }
})();