
angular.module('BlurAdmin.pages.virtualmarket')                                                                                                                                                                        
  .factory("vmHelper", function() {                                                                                                                                                   
    return {
      colors: {
        primary: { // Google colour
          blue: '#4285f4',
          green: '#34a853',
          yellow: '#fbbc05',
          red: '#ea4335',
        }
      },
      defDate: {
      	start: moment().subtract(364, 'days'),
      	end : moment()
      },
      formatDateRange: function(start, end) {
      	var monthName = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
      	var startDate = start.date()+' '+monthName[start.month()]+' '+start.year();
      	var endDate = end.date()+' '+monthName[end.month()]+' '+end.year();
      	return startDate+' - '+endDate;
      },                                                                                                                                                                                                              
	  formatMonth: function(index) {   
		var monthName = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
		return monthName[index-1];
	  },
	  formatCurrency: function(value) {   
		return 'Rp '+value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	  },
	  
	};
  });