
(function () {
  'use strict';
  
  angular.module('BlurAdmin.pages.productManager')
    .service('productFormService', ['$http', function ($http) {
      this.sendForm = function(data, uploadUrl, callbackFunc){
        
        var fd = new FormData();
        //append data
        fd.append('product_name', data.name);
        fd.append('category_id', data.category.id);
        data.isUploadImg = (data.isUploadImg) ? 1:0;
        fd.append('isChangeImage', data.isUploadImg);
        if(data.isUploadImg)
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
