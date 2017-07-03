/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket')
      .directive('vmFeedback', vmFeedback);

  /** @ngInject */
  function vmFeedback() {
    return {
      restrict: 'E',
      // controller: 'vmFeedbackCtrl',
      templateUrl: 'app/pages/virtualmarket/vmFeedback/vmFeedback.html'
    };
  }
})();