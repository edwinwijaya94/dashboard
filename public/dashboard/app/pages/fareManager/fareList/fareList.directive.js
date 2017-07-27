(function () {
  'use strict';

  angular.module('BlurAdmin.pages.fareManager')
      .directive('fareList', fareList);

  /** @ngInject */
  function fareList() {
    return {
      restrict: 'E',
      templateUrl: 'app/pages/fareManager/fareList/fareList.html'
    };
  }
})();