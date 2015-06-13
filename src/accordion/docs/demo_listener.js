var AccordionDemoListenerCtrl=['$scope',function ($scope) {
    $scope.onSelect = function(index,scope){
        console.log('选中：第',index,'项',scope);
    };
    $scope.onUnselect = function(index,scope){
        console.log('取消：第',index,'项',scope);
    };
}];
angular.module('ui.wisoft').controller('AccordionDemoListenerCtrl',AccordionDemoListenerCtrl);