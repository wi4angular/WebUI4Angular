var AccordionDemoCtrl2=['$scope',function ($scope) {
    $scope.groups = [
        {
            title: '动态 Header - 1',
            content: 'Dynamic Group Body - 1',
            open:true
        },
        {
            title: '动态 Header - 2',
            content: 'Dynamic Group Body - 2',
            open:false
        }
    ];
}];
angular.module('ui.wisoft').controller('AccordionDemoCtrl2',AccordionDemoCtrl2);