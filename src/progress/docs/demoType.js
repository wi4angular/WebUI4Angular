var progressTypeMainCtrl = ['$scope','$interval','$compile',function($scope,$interval) {
    var i, timer;
    $scope.value = 0;
    $scope.start = function(){
        timer && $interval.cancel(timer);
        i = 0;
        timer = $interval(function(){
            $scope.value = i;
            if(i==100) $interval.cancel(timer);
            i++;
        },100);
    };
}];
angular.module('ui.wisoft').controller('progressTypeMainCtrl',progressTypeMainCtrl);