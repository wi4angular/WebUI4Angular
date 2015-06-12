var bindHtmlCtrl1 = ['$scope','$compile',function($scope, $compile){
    $scope.myClick = function(){
        alert('事件被触发了');
    };
    $scope.elem = $compile('<input type="button" class="wi-btn" ng-click="myClick()" value="我是直接添加的按钮">')($scope);
}];
angular.module('ui.wisoft').controller('bindHtmlCtrl1',bindHtmlCtrl1);