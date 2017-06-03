/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.productManager', ['ui.select', 'ngSanitize'])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('productManager', {
          url: '/product-manager',
          template : '<ui-view autoscroll="true" autoscroll-body-top></ui-view>',
          abstract: true,
          title: 'Kelola Produk',
          sidebarMeta: {
            icon: 'ion-compose',
            order: 3,
          },
        })
        .state('productManager.product', {
          url: '/product',
          templateUrl: 'app/pages/productManager/product/product.html',
          title: 'Produk',
          sidebarMeta: {
            order: 1,
          },
        })
        .state('productManager.category', {
          url: '/category',
          templateUrl: 'app/pages/productManager/category/category.html',
          title: 'Kategori',
          sidebarMeta: {
            order: 2,
          },
        })
        .state('productManager.unit', {
          url: '/unit',
          templateUrl: 'app/pages/productManager/unit/unit.html',
          title: 'Satuan',
          sidebarMeta: {
            order: 3,
          },
        });
  }

})();
