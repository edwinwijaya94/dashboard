/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.smsManager')
      .directive('smsList', smsList);

  /** @ngInject */
  function smsList() {
    return {
      restrict: 'E',
      templateUrl: 'app/pages/smsManager/smsList/smsList.html'
    };
  }
})();