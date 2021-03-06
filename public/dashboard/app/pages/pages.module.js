/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';
  var modules = [
    'ui.router',
    'BlurAdmin.pages.virtualmarket',
    'BlurAdmin.pages.marketplace',
    'BlurAdmin.pages.operational',
    'BlurAdmin.pages.userManager',
    'BlurAdmin.pages.productManager',
    'BlurAdmin.pages.smsManager',
    'BlurAdmin.pages.fareManager',
  ];
  
  angular.module('BlurAdmin.pages', modules)
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($urlRouterProvider, baSidebarServiceProvider) {
    // $urlRouterProvider.otherwise('/virtualmarket');  
    
    // var $http = angular.injector(["ng"]).get("$http");
    // $http.get('/user/auth')
    //   .then(function(res) {
    //     var data = res.data;
    //     var userRole = data.user.role;
    //   })
    //   .finally(function() {
    //     if(userRole == 'dashboard_admin' || userRole == 'staf_dinas')
    //       $urlRouterProvider.otherwise('/virtualmarket');    
    //     else
    //       $urlRouterProvider.otherwise('/operational');    
    //   });
    

    // baSidebarServiceProvider.addStaticItem({
    //   title: 'Pages',
    //   icon: 'ion-document',
    //   subMenu: [{
    //     title: 'Sign In',
    //     fixedHref: 'auth.html',
    //     blank: true
    //   }, {
    //     title: 'Sign Up',
    //     fixedHref: 'reg.html',
    //     blank: true
    //   }, {
    //     title: 'User Profile',
    //     stateRef: 'profile'
    //   }, {
    //     title: '404 Page',
    //     fixedHref: '404.html',
    //     blank: true
    //   }]
    // });
    // baSidebarServiceProvider.addStaticItem({
    //   title: 'Menu Level 1',
    //   icon: 'ion-ios-more',
    //   subMenu: [{
    //     title: 'Menu Level 1.1',
    //     disabled: true
    //   }, {
    //     title: 'Menu Level 1.2',
    //     subMenu: [{
    //       title: 'Menu Level 1.2.1',
    //       disabled: true
    //     }]
    //   }]
    // });
  }

})();
