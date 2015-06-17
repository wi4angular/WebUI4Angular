var tabsetMethodCtrl = ['$scope',function($scope) {
    $scope.myTabset = {};
    $scope.options=function(){
        console.log($scope.myTabset.options());
    };
    $scope.select=function(){
        $scope.myTabset.select($scope.myTabset.getTab('wiid','3'));
    };
    $scope.close=function(){
        $scope.myTabset.close($scope.myTabset.getActiveTab());
    };
}];
angular.module('ui.wisoft').controller('tabsetMethodCtrl',tabsetMethodCtrl);