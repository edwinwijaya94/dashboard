
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket')
      .controller('vmShopperCtrl', vmShopperCtrl);

  /** @ngInject */
  function vmShopperCtrl($scope, $timeout, $http, baConfig, baUtil, vmHelper) {
    var layoutColors = baConfig.colors;
    
    // COLORS
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);
    var pieColor = vmHelper.colors.primary.green;

    $scope.colors = vmHelper.colors.primary;
    $scope.chartColors = [$scope.colors.blue, $scope.colors.yellow, $scope.colors.green, $scope.colors.red];
    
    // INIT DATA
    $scope.stats = {
      shopperCount: {
        description: 'Garendong Aktif',
        info: '',
        value: 0,
        percent: 0,
        change: 0,
        icon:'ion-arrow-up-b',
        iconColor: $scope.colors.green,
      },
      avgRating: {
        description: 'Rata-Rata Rating',
        info: '',
        value: 0,
        percent: 0,
        change: 0,
        icon:'ion-arrow-up-b',
        iconColor: $scope.colors.green,
      },
      transactionPerShopper: {
        description: 'Transaksi per Garendong',
        info: '',
        value: 0,
        percent: 0,
        change: 0,
        icon:'ion-arrow-up-b',
        iconColor: $scope.colors.green,
      },
      feedback_count: {
        color: pieColor,
        description: 'Jumlah Ulasan',
        info: '',
        value: 0,
        percent: 0,
        showPie: false,
        showChange: true,
        change: 0,
        prevValue: 0,
        icon:'ion-arrow-up-b',
        iconColor: $scope.colors.green,
        colSize: 4,
      },
    };

    
    $scope.initShopperList = function() {
      $scope.shopperPageIndex = 1;
      $scope.shopperPageSize = 5;
      $scope.shopperList = {
        totalRows: 0,
        avgRating: 0 + ' / 5',
        // pageIndex: 1,
        // pageSize: 5,
        displayedPages: 1,
        shopper:[]
      };
    };

    $scope.shopperListOptions = {
      selected: {
        label: 'Rating Tertinggi',
        value: 'highest',
        color: $scope.colors.green
      },
      options: [
        {
          label: 'Rating Tertinggi',
          value: 'highest',
          color: $scope.colors.green
        },
        {
          label: 'Rating Terendah',
          value: 'lowest',
          color: $scope.colors.red
        }
      ]
    };

    $scope.noData = false;

    // EVENTS
    $scope.$on('updateVm', function(event, startDate, endDate) {
      $scope.startDate = startDate;
      $scope.endDate = endDate;
      $scope.initShopperList();
      $scope.getData(startDate, endDate);  
    });

    $scope.getData = function(startDate, endDate) {
      // $scope.getShopperStats(startDate, endDate);
      $scope.getShopperList(startDate, endDate, $scope.shopperList.page, $scope.shopperList.pageSize, $scope.shopperListOptions.selected.value);
      $scope.getFeedbackStats(startDate, endDate);
    };

    // SHOPPER STATS
    $scope.getShopperStats = function(startDate, endDate) {
      // $scope.loading = true;
      $http.get('/api/virtualmarket/shopper?type=stats&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          $scope.showShopperStats(data);
        })
        .finally(function() {
          // $scope.loading= false;
        });    
    };

    $scope.showShopperStats = function(data) {
      $scope.stats.shopper.value = data.count;
    };

    // SHOPPER TOPLIST
    $scope.getShopperList = function(startDate, endDate, page, rows, sort) {
      // $scope.loading = true;
      $http.get('/api/virtualmarket/shopper?type=list&start_date='+startDate+'&end_date='+endDate+'&page='+page+'&rows='+rows+'&sort='+sort)
        .then(function(res) {
          $scope.shopperData = res.data.data;
          $scope.showShopperData($scope.shopperData, $scope.shopperListOptions.selected.value);
        })
        .finally(function() {
          // $scope.loading= false;
        });    
    };

    $scope.showShopperData = function(data, sortBy) {
      //stats
      // shopper count
      $scope.stats.shopperCount.value = data.shopper_count.current;
      var countChange = (data.shopper_count.current-data.shopper_count.prev);
      countChange = isFinite(countChange)? countChange:0;
      if(countChange>=0) {
        $scope.stats.shopperCount.icon = 'ion-arrow-up-b';
        $scope.stats.shopperCount.iconColor = $scope.colors.green;
      } else {
        countChange *= -1;
        $scope.stats.shopperCount.icon = 'ion-arrow-down-b';
        $scope.stats.shopperCount.iconColor = $scope.colors.red;
      }
      $scope.stats.shopperCount.change = countChange;

      // avg rating
      $scope.stats.avgRating.value = parseFloat(data.avg_rating.current);
      var ratingChange = (data.avg_rating.current-data.avg_rating.prev);
      ratingChange = data.avg_rating.prev!=null? ratingChange:0;
      if(ratingChange>=0) {
        $scope.stats.avgRating.icon = 'ion-arrow-up-b';
        $scope.stats.avgRating.iconColor = $scope.colors.green;
      } else {
        ratingChange *= -1;
        $scope.stats.avgRating.icon = 'ion-arrow-down-b';
        $scope.stats.avgRating.iconColor = $scope.colors.red;
      }
      $scope.stats.avgRating.value = isFinite($scope.stats.avgRating.value)? vmHelper.formatNumber($scope.stats.avgRating.value,false,false): '-';
      $scope.stats.avgRating.change = $scope.formatRating(parseFloat(ratingChange.toFixed(2)));

      // transaction per shopper
      var currentTransactionPerShopper = (parseFloat(data.transaction_count.current)/parseFloat(data.shopper_count.current)).toFixed(2);
      var prevTransactionPerShopper = (parseFloat(data.transaction_count.prev)/parseFloat(data.shopper_count.prev)).toFixed(2);
      var transactionChange = (currentTransactionPerShopper - prevTransactionPerShopper).toFixed(2);
      transactionChange = isFinite(transactionChange)? transactionChange:0;
      if(transactionChange>=0) {
        $scope.stats.transactionPerShopper.icon = 'ion-arrow-up-b';
        $scope.stats.transactionPerShopper.iconColor = $scope.colors.green;
      } else {
        transactionChange *= -1;
        $scope.stats.transactionPerShopper.icon = 'ion-arrow-down-b';
        $scope.stats.transactionPerShopper.iconColor = $scope.colors.red;
      }
      $scope.stats.transactionPerShopper.value = isFinite(currentTransactionPerShopper)? vmHelper.formatNumber(parseFloat(currentTransactionPerShopper), false, false):'-';
      $scope.stats.transactionPerShopper.change = vmHelper.formatNumber(parseFloat(transactionChange), false, false);

      // RATING TRENDS
      if($scope.chart != undefined) {
        $('#vmShopperRating').empty();
      }
      
      if(data.avg_rating.trend.trend.length == 0) {
        $scope.noData = true;
      } else {
        $scope.chart = AmCharts.makeChart('vmShopperRating',$scope.getRatingChartOptions(data.avg_rating.trend, $scope.colors));
        $scope.noData = false;
      }
      
      // shopper list
      $scope.updatedShopperList = data.shopper;
      // copy references
      $scope.shopperList.shopper = [].concat($scope.updatedShopperList);
    };

    $scope.getRatingChartOptions = function(data, colors) { 
      var dateFormat;
      if(data.granularity == 'month')
        dateFormat = 'YYYY-MM';
      else if(data.granularity == 'day')
        dateFormat = 'YYYY-MM-DD';

      var options = {
        color: layoutColors.defaultText,
        data: data.trend,
        title: 'Rating',
        gridColor: layoutColors.border,
        valueLabelFunction: function(y) {
          return y;
        }, 
        graphs: [
          {
            id: 'g1',
            balloonFunction: function(item, graph) {
              var date = new Date(item.category);
              var formattedDate;
              if(data.granularity == 'month')
                formattedDate = vmHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
              else if(data.granularity == 'day')
                formattedDate =  date.getDate()+' '+vmHelper.formatMonth(date.getMonth());

              var value = item.values.value;
              var hoverInfo = formattedDate+'<br> Rating:<br> <b>'+vmHelper.formatNumber(value,false,false)+'</b>';
              return hoverInfo;
            },
            bullet: 'round',
            bulletSize: 8,
            lineColor: colors.blue,
            lineThickness: 2,
            type: 'line',
            valueField: 'rating'
          }
        ],
        dataDateFormat: dateFormat,
        categoryField: 'date',
        categoryLabelFunction: function(valueText, date, categoryAxis) {
          if(data.granularity == 'month')
            return vmHelper.formatMonth(date.getMonth())+' \''+date.getFullYear().toString().substr(-2);
          else if(data.granularity == 'day')
            return date.getDate()+' '+vmHelper.formatMonth(date.getMonth());
        }
      };
      
      var chartOptions = vmHelper.getLineChartOptions(options);
      chartOptions.valueAxes = [{
        maximum: 5
      }];

      return chartOptions;
    };

    $scope.sortList = function(item, model) {
      $scope.initShopperList();
      $scope.shopperListOptions.selected = item; // update selected option
      // $scope.showShopperList($scope.shopperData, model);
      $scope.getShopperList($scope.startDate, $scope.endDate, $scope.shopperList.page, $scope.shopperList.pageSize, $scope.shopperListOptions.selected.value);
    };

    $scope.getRank = function(index) {
      return (index+1+(($scope.shopperList.page-1)*$scope.shopperList.pageSize));
    };

    $scope.changeShopperPage = function(newPage) {
      $scope.shopperPageIndex = newPage;
    };

    // FEEDBACK STATS
    $scope.getFeedbackStats = function(startDate, endDate) {
      // $scope.loading = true;
      $http.get('/api/virtualmarket/feedback?type=stats&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          // $scope.showFeedbackStats(data.rating);
          $scope.showFeedbackCount(data.count);
          $scope.showFeedbackReason(data.feedback);

        })
        .finally(function() {
          // $scope.loading= false;
        });    
    };

    $scope.showFeedbackCount = function(data) {
      
      //feedback count
      var stat = {};
      stat.description = $scope.stats.feedback_count.description;
      stat.info = $scope.stats.feedback_count.info;
      stat.showPie = $scope.stats.feedback_count.showPie;
      stat.showChange = $scope.stats.feedback_count.showChange;
      stat.value = parseInt(data.current);
      stat.prevValue = parseInt(data.prev);
      var change = ((stat.value-stat.prevValue)/(stat.prevValue)*100).toFixed(2);
      stat.change = isFinite(change)? change:0;
      if(stat.change>=0) {
        stat.icon = 'ion-arrow-up-b';
        stat.iconColor = $scope.colors.red;
      } else {
        stat.change *= -1;
        stat.icon = 'ion-arrow-down-b';
        stat.iconColor = $scope.colors.green;
      }
      stat.colSize = $scope.stats.feedback_count.colSize;
      stat.value = vmHelper.formatNumber(stat.value,false,false);
      stat.change = vmHelper.formatNumber(stat.change,false,false)+'%';
      $scope.stats.feedback_count = stat;
      
    }

    $scope.showFeedbackStats = function(data) {
      $scope.stats.rating.transactions = data.transactions;
      if(data.value != null)
        $scope.stats.rating.value = vmHelper.formatNumber(data.value,false,false) + ' / 5';
      else
        $scope.stats.rating.value = 0 + ' / 5';
    };

    // FEEDBACK REASON
    $scope.showFeedbackReason = function(data) {
      $scope.drawChart(data, $scope.colors);
    };

    // chart options
    $scope.getBarChartOptions = function(data, label, colors) { 
      
      var options = {
        color: layoutColors.defaultText,
        data: data,
        title: 'Ulasan',
        gridColor: layoutColors.border,
        valueLabelFunction: function(y) {
          var yValue;
          if(y>=1000000000)
            yValue = (y/1000000000).toString() + ' mi';
          else if(y>=1000000)
            yValue = (y/1000000).toString() + ' jt';
          else if (y>=1000)
            yValue = (y/1000).toString() + ' rb';
          else 
            yValue = y.toString();

          return yValue;
        }, 
        graphs: [
          {
            id: 'g1',
            balloonFunction: function(item, graph) {
              var value = item.values.value;
              var hoverInfo = 'Jumlah Ulasan:<br> <b>'+value+'</b>';
              return hoverInfo;
            },
            lineAlpha: 0,
            fillColors: colors.yellow,
            fillAlphas: 1,
            type: 'column',
            valueField: 'count',
          }
        ],
        rotate: true,
        categoryField: 'reason',
      };

      return vmHelper.getBarChartOptions(options);
    };

    $scope.drawChart =  function(data, colors) {
      var label = '';

      if($scope.chart != undefined) {
        $('#vmFeedbackReason').empty();
      }

      if(data.length == 0) {
        $scope.noData = true;
      } else {
        $scope.chart = AmCharts.makeChart('vmFeedbackReason',$scope.getBarChartOptions(data, label, colors));
        $scope.noData = false;
      }
    };

    $scope.formatRating = function(rating) {
      return vmHelper.formatNumber(rating,false,false,1);
    };

    $scope.formatRatingChange = function(rating) {
      if(rating < 0)
        rating *= -1;
      rating = rating.toFixed(1);
      return vmHelper.formatNumber(rating,false,false,1);
    };

    $scope.getArrowIcon = function(value) {
      if(value >= 0)
        return 'ion-arrow-up-b';
      else
        return 'ion-arrow-down-b';
    };

    $scope.getArrowColor = function(value) {
      if(value >= 0)
        return $scope.colors.green;
      else
        return $scope.colors.red;
    };

    $scope.sorter = {
      orders: function(value) {
        return parseInt(value.orders);
      },
      rating: function(value) {
        return parseFloat(value.rating);
      },
      feedbacks: function(value) {
        return parseInt(value.feedbacks);
      }
    };

    // FOR TESTING PURPOSE ONLY
    // var names = ['Budi', 'Anto', 'Usman', 'Denny', 'Maman', 'Ricky', 'Yanto', 'Fahmi', 'Nana', 'Jon'];
    // $scope.getRandomName = function() {
    //   return names[Math.floor((Math.random() * (names.length-1)))];
    // };

  }
})();