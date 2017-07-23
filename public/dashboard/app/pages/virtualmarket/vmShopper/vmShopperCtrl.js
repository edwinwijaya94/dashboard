
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
        description: 'Jumlah Garendong',
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
      // $scope.getFeedbackStats(startDate, endDate);
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

      $scope.stats.avgRating.value = $scope.formatRating(data.avg_rating.current);
      var ratingChange = (data.avg_rating.current-data.avg_rating.prev);
      ratingChange = isFinite(ratingChange)? ratingChange:0;
      if(ratingChange>=0) {
        $scope.stats.avgRating.icon = 'ion-arrow-up-b';
        $scope.stats.avgRating.iconColor = $scope.colors.green;
      } else {
        ratingChange *= -1;
        $scope.stats.avgRating.icon = 'ion-arrow-down-b';
        $scope.stats.avgRating.iconColor = $scope.colors.red;
      }
      $scope.stats.avgRating.change = $scope.formatRating(parseFloat(ratingChange.toFixed(2)));

      // $scope.stats.totalRows = data.total_rows;
      // $scope.stats.avgRating = $scope.formatRating(data.avg_rating);
      
      // shopper list
      // $scope.shopperList.shopper = data.shopper;
      $scope.updatedShopperList = data.shopper;
      // copy references
      $scope.shopperList.shopper = [].concat($scope.updatedShopperList);
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
          $scope.showFeedbackStats(data.rating);
          $scope.showFeedbackReason(data.feedback);
        })
        .finally(function() {
          // $scope.loading= false;
        });    
    };

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
            fillColors: colors.green,
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
      if(rating < 0)
        rating *= -1;
      return vmHelper.formatNumber(rating,false,false);
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

    // FOR TESTING PURPOSE ONLY
    // var names = ['Budi', 'Anto', 'Usman', 'Denny', 'Maman', 'Ricky', 'Yanto', 'Fahmi', 'Nana', 'Jon'];
    // $scope.getRandomName = function() {
    //   return names[Math.floor((Math.random() * (names.length-1)))];
    // };

  }
})();