
(function () {
  'use strict';
  
  angular.module('BlurAdmin.pages.productManager')
    .service('unitFormService', ['$http', function ($http) {
      this.sendForm = function(data, uploadUrl, callbackFunc){
        
        var fd = new FormData();
        //append data
        fd.append('unit_name', data.name);
        fd.append('unit_type', data.type);
        fd.append('convert_gram', data.convertInGram);

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
