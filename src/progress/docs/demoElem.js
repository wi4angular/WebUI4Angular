var progressElemMainCtrl = ['$scope','$interval','$compile',function($scope,$interval,$compile) {
    var i, timer;
    $scope.value = 0;
    $scope.label = 100;
    $scope.start = function(){
        timer && $interval.cancel(timer);
        i = 0;
        timer = $interval(function(){
            $scope.value = i;
            $scope.label = 100 - i;
            if(i==100) $interval.cancel(timer);
            i += 2;
        },100);
    };
    $scope.labelelem = $compile('<div style="background: pink" ng-bind="label"></div>')($scope);
}];
angular.module('ui.wisoft').controller('progressElemMainCtrl',progressElemMainCtrl);