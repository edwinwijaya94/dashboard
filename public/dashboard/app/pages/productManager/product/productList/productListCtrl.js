
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.productManager')
      .controller('productListCtrl', productListCtrl);

  /** @ngInject */
  function productListCtrl($scope, $timeout, $http, baConfig, baUtil, pmHelper) {
    var layoutColors = baConfig.colors;
    // $scope.colors = [layoutColors.primary, layoutColors.warning, layoutColors.danger, layoutColors.info, layoutColors.success, layoutColors.primaryDark];
    
    // COLORS
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);

    $scope.colors = pmHelper.colors.primary;

    // MODELS
    $scope.productList = {
      pageSize: 5,
      data: [
        {
          name: 'jeruk',
          category: 'buah',
          price_min: 10000,
          price_max: 15000,
        },
        {
          name: 'apel',
          category: 'buah',
          price_min: 11000,
          price_max: 15000,
        },
        {
          name: 'semangka',
          category: 'buah',
          price_min: 10000,
          price_max: 16000,
        },
        {
          name: 'ayam',
          category: 'daging',
          price_min: 10000,
          price_max: 12000,
        },
        {
          name: 'sapi',
          category: 'daging',
          price_min: 8000,
          price_max: 15000,
        },
        {
          name: 'kambing',
          category: 'daging',
          price_min: 10000,
          price_max: 15000,
        },
        {
          name: 'wortel',
          category: 'sayuran',
          price_min: 10000,
          price_max: 14000,
        },
        {
          name: 'kentang',
          category: 'sayuran',
          price_min: 10500,
          price_max: 15000,
        },
        {
          name: 'kangkung',
          category: 'sayuran',
          price_min: 9000,
          price_max: 11000,
        },
      ]
    };

    // GET PRODUCTS
    $scope.getProduct = function(data) {
      $http.get('/', data)
        .then(function(res) {
          $scope.products = res.data;
        })
        .finally(function() {
          
        });    
    };

  }
})();