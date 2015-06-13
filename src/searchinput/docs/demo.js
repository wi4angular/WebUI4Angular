var SearchinputDemoCtrl = ['$scope',function($scope) {
    var ctrl = this;
    ctrl.value = '';
    $scope.searchFun = function(selectItem){
        ctrl.value = selectItem;
    }
}];
angular.module('ui.wisoft').controller('SearchinputDemoCtrl',SearchinputDemoCtrl);