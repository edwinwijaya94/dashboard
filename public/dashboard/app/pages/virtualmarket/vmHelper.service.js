
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
	  fixLineChartNullValues: function(data) {
      var result = [];
      var prevTime = null;
      for(var i=0; i<data.length; i++) {
        var item = data[i];
        var currentTime = moment().year(item.year).month(item.month-1);
        if (prevTime != null) {
          for (var time=prevTime.add('1','month'); time.isBefore(currentTime,'month'); time.add('1','month')) {
            console.log("cur"+currentTime.toString());
            console.log("time"+time.toString());
            result.push({
              time: time.year()+'-'+(time.month()+1),
              year: time.year(),
              month: time.month()+1,
              count: 0,
              value: 0,
            });
          }
        }
        result.push(item);
        prevTime = currentTime;
      }
      return result;
    }

	};
  });