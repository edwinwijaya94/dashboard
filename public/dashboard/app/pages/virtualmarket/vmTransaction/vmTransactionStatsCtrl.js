/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket')
      .controller('vmTransactionStatsCtrl', vmTransactionStatsCtrl);

  /** @ngInject */
  function vmTransactionStatsCtrl($scope, $timeout, $http, baConfig, baUtil) {
    var trackColor = baUtil.hexToRGB(baConfig.colors.defaultText, 0.2);
    var pieColor = baConfig.colors.success;

    $scope.$on('updateVm', function(event, startDate, endDate) {
      $scope.getData(startDate, endDate);  
    });

    $scope.getData = function(startDate, endDate) {
      $scope.loading = true;
      $http.get('/api/virtualmarket/transaction?type=stats&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var data = res.data.data;
          $scope.showSuccessRate(data.transaction_status);
          $scope.showPlatform(data.app_platform);
        })
        .finally(function() {
          $scope.loading= false;
        });    
    }

    $scope.options = {
      barColor: pieColor,
      trackColor: trackColor,
      size: 84,
      scaleLength: 0,
      animate: { duration: 1000, enabled: true },
      lineWidth: 9,
      lineCap: 'round',
    };
    
    $scope.showSuccessRate = function(data) {
      
      var success = {
        status: 'success',
        count: 0,
        sum: 0
      };
      var failed = {
        status: 'failed',
        count: 0,
        sum: 0
      };

      for(var i=0; i<data.length; i++ ) {
        if(data[i].status == 'success') {
          success = data[i];
          success.count = parseInt(success.count);
        }
        else if (data[i].status == 'failed') {
          failed = data[i]; 
          failed.count = parseInt(failed.count);
        }
      }

      var percentage = Math.round(success.count / (success.count + failed.count) * 100);

      $scope.charts = [{
        color: pieColor,
        description: 'Transaksi Sukses',
        stats: success.count+'/'+(success.count+failed.count),
        icon: 'person',
      }];

      $scope.percent = percentage;
      
    }

    $scope.showPlatform = function(data) {

      var colors = ['info','danger','success','warning'];
      var platforms = data;
      var total = 0;
      for(var i=0; i<platforms.length; i++) {
        total += parseInt(platforms[i].count);
      }
      for(var i=0; i<platforms.length; i++) {
        platforms[i].percentage = (parseInt(platforms[i].count) / total * 100).toFixed(2);
        platforms[i].color = colors[i];
      }

      $scope.platforms = platforms;
    }

    $scope.formatPlatform = function(platform) {
      return platform.name + '(' + Math.round(platform.percentage) + ' %)';
    }
  }
})();