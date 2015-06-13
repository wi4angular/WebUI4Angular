var PanelDemoCtrl = ['$scope', function($scope) {
    $scope.isopen = true;
    $scope.isopen1 = true;
    $scope.toggle = function(){
        $scope.isopen = !$scope.isopen;
    };
}];
angular.module('ui.wisoft').controller('PanelDemoCtrl',PanelDemoCtrl);