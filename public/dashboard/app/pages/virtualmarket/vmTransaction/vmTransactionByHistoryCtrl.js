/**
 * @author v.lugovksy
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.virtualmarket')
      .controller('vmTransactionByHistoryCtrl', vmTransactionByHistoryCtrl);

  /** @ngInject */
  function vmTransactionByHistoryCtrl($scope, $window, $http, baConfig, vmHelper) {
    var layoutColors = baConfig.colors;

    $scope.colors = [layoutColors.primary, layoutColors.warning, layoutColors.danger, layoutColors.info, layoutColors.success, layoutColors.primaryDark];
    $scope.noData = false;
    $scope.$on('updateVmTransaction', function(event, startDate, endDate) {  
      $scope.getData(startDate, endDate);
    });

    $scope.getData = function(startDate, endDate) {
      $scope.loading = true;
      $http.get('/api/virtualmarket/transaction?type=history&aggregate=sum&start_date='+startDate+'&end_date='+endDate)
        .then(function(res) {
          var resp = res.data.data;
          var data = [];
          var i;
          for(i=0; i<resp.length; i++) {
            var x = {};
            x.time = resp[i].yr+'-'+resp[i].mo;
            x.year = resp[i].yr;
            x.month = resp[i].mo;
            x.value = resp[i].value;
            data.push(x);
          }
          $scope.drawChart(data, $scope.colors);
        })
        .finally(function() {
          $scope.loading= false;
        });    
    }

    // chart
    $scope.drawChart =  function(data, colors) {
      if($scope.chart == undefined) {
        if(data.length == 0) {
          $scope.noData = true;
        } else {
          $scope.noData = false;
          $scope.chart = new Morris.Line({
            element: 'vmTransactionByHistory',
            data: data,
            xkey: 'time',
            ykeys: ['value'],
            labels: ['Nilai Transaksi'],
            xLabels: 'month',
            xLabelFormat: function(x){
              return vmHelper.formatMonth(x.getMonth()+1)+' \''+x.getFullYear().toString().substr(-2);
            },
            yLabelFormat : function(y){
              var value;
              if(y>=1000000000)
                value = (y/1000000000).toString() + ' mi';
              else if(y>=1000000)
                value = (y/1000000).toString() + ' jt';
              else if (y>=1000)
                value = (y/1000).toString() + ' rb';
              else 
                value = y.toString();
              return vmHelper.formatCurrency(value);
            },
            hoverCallback: function (index, options, content, row) {
              return '<p>'+vmHelper.formatMonth(row.month)+' '+row.year+'</p>'
                    +'<p>'+'Nilai Transaksi: '+vmHelper.formatCurrency(row.value.toString())+'</p>';
            },
            lineColors: colors,
            smooth: false,
            // xLabelAngle: 30,
          });
        }
      } else {
        $scope.chart.setData(data);
        if(data.length == 0) {
          $scope.noData = true;
        } else {
          $scope.noData = false;
        } 
      }
    }

    angular.element($window).bind('resize', function () {
      //$window.Morris.Grid.prototype.redraw();
    });
  }

})();