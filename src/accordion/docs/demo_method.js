var AccordionDemoMethodCtrl=['$scope',function ($scope) {
    $scope.myAcc = {};
    $scope.element = function(){
        console.log('jqlite元素：',$scope.myAcc.element());
    };
    $scope.options = function(){
        console.log('用户配置：',$scope.myAcc.options());
    };
    $scope.panels = function(){
        console.log('所有面板：',$scope.myAcc.panels());
    };
    $scope.getSelect = function(){
        console.log('选中项：',$scope.myAcc.getSelect());
    };
    $scope.getGroup = function(){
        console.log('第1项',$scope.myAcc.getGroup(1));
    };
    $scope.toggle = function(){
        $scope.myAcc.toggle(2);
        console.log('切换第二项选中状态');
    };
    $scope.reCompute = function(){
        $scope.myAcc.reCompute();
        console.log('重新计算尺寸');
    };
}];
angular.module('ui.wisoft').controller('AccordionDemoMethodCtrl',AccordionDemoMethodCtrl);