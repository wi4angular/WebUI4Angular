var PanelDemoApiCtrl = ['$scope', function($scope) {
    $scope.mypanel={};
    $scope.myFun=function(){
        console.log($scope.mypanel.options());
        console.log($scope.mypanel.element());
        console.log('当前状态：',$scope.mypanel.toggle()?'折叠':'展开');
    }
}];
angular.module('ui.wisoft').controller('PanelDemoApiCtrl',PanelDemoApiCtrl);