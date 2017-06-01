
(function () {
  'use strict';
  
  angular.module('BlurAdmin.pages.productManager')
    .service('productFormService', ['$http', function ($http) {
      this.sendForm = function(data, callbackFunc){
        var uploadUrl = 'http://127.0.0.1:8001/api/virtualmarket/product/add';
        var fd = new FormData();
        //append data
        fd.append('product_name', data.name);
        fd.append('category_id', data.category_id);
        fd.append('product_image', data.image);
        fd.append('product_price', data.price);
        fd.append('product_quantity', data.quantity);
        fd.append('unit_id', data.unit_id);

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
