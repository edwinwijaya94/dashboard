
angular.module('BlurAdmin.pages.virtualmarket')                                                                                                                                                                        
  .factory("vmHelper", function() {                                                                                                                                                   
    return {
      defDate : {
      	start: moment().subtract(364, 'days'),
      	end : moment()
      },                                                                                                                                                                                                              
	  formatMonth: function(index) {   
		var monthName = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"]
		return monthName[index-1];
	  },
	  formatCurrency: function(value) {   
		return 'Rp '+value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	  },
	  
	};
  });