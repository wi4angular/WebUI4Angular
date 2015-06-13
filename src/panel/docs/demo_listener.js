var PanelDemoListenerCtrl = ['$scope', function($scope) {
    $scope.isopen = true;
    $scope.toggle = function(){
        $scope.isopen = !$scope.isopen;
    };
    $scope.opened = function(){
        console.log('opened');
    };
    $scope.closed = function(){
        console.log('closed');
    };
    $scope.col = function(){
        console.log('col');
    };
    $scope.exp = function(){
        console.log('exp');
    };
}];
angular.module('ui.wisoft').controller('PanelDemoListenerCtrl',PanelDemoListenerCtrl);