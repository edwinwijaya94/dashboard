
(function () {
  'use strict';
  
  angular.module('BlurAdmin.pages.productManager')
    .service('productFormService', ['$http', function ($http) {
      this.sendForm = function(data, callbackFunc){
        var hostname = 'http://'+window.location.hostname+':8001';
        var uploadUrl = hostname+'/api/virtualmarket/product/add';
        var fd = new FormData();
        //append data
        fd.append('product_name', data.name);
        fd.append('category_id', data.category.id);
        fd.append('product_image', data.image);
        fd.append('product_price', data.price);
        fd.append('product_quantity', data.quantity);
        fd.append('unit_id', data.unit.id);

        $http.post(uploadUrl, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        })
        .success(function(){
            callbackFunc();
        })
        .error(function(){
        });
      }
    }]);
})();
