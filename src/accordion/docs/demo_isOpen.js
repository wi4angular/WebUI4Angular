var AccordionDemoIsOpenCtrl=['$scope',function ($scope) {
    $scope.status = {
        isFirstOpen: true,
        isFirstDisabled: false
    };
}];
angular.module('ui.wisoft').controller('AccordionDemoIsOpenCtrl',AccordionDemoIsOpenCtrl);