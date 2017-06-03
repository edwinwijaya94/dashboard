
(function () {
  'use strict';
  
  angular.module('BlurAdmin.pages.productManager')
    .service('categoryFormService', ['$http', function ($http) {
      this.sendForm = function(data, uploadUrl, callbackFunc){
        
        var fd = new FormData();
        //append data
        fd.append('category_name', data.name);
        data.isUploadImg = (data.isUploadImg) ? 1:0;
        fd.append('isChangeImage', data.isUploadImg);
        if(data.isUploadImg)
          fd.append('category_image', data.image);

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
