var progressMainCtrl = ['$scope','$interval',function($scope,$interval) {
    var i, timer;
    $scope.value = 0;
    $scope.label = 'tips0';
    $scope.start = function(){
        timer && $interval.cancel(timer);
        i = 0;
        timer = $interval(function(){
            $scope.value = i;
            $scope.label = 'tips' + i;
            if(i==50) $interval.cancel(timer);
            i++;
        },100);
    };
}];
angular.module('ui.wisoft').controller('progressMainCtrl',progressMainCtrl);