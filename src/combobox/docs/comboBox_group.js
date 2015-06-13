var ComboBoxDemoGroupCtrl=['$scope',function($scope) {

    var vm = $scope;
    vm.groupData = [
        { "value":"f20", "text":"Firefox 2.0 or higher", "group":"Firefox" },
        { "value":"f15", "text":"Firefox 1.5.x", "group":"Firefox" },
        { "value":"f10", "text":"Firefox 1.0.x", "group":"Firefox" },
        { "value":"ie7", "text":"IE 7.0 or higher", "group":"Microsoft Internet Explorer" },
        { "value":"ie6", "text":"IE 6.x", "group":"Microsoft Internet Explorer" },
        { "value":"ie5", "text":"IE 5.x", "group":"Microsoft Internet Explorer" },
        { "value":"ie4", "text":"IE 4.x", "group":"Microsoft Internet Explorer" },
        { "value":"op9", "text":"Opera 9.0 or higher", "group":"Opera" },
        { "value":"op8", "text":"Opera 8.x", "group":"Opera" },
        { "value":"op7", "text":"Opera 7.x", "group":"Opera" },
        { "value":"Safari", "text":"Safari", "group":"Safari" },
        { "value":"Other", "text":"Other", "group":"Other" }
    ];

    vm.itemChangeHandler = function (data){
        vm.selected = data;
    }
}];
angular.module('ui.wisoft').controller('ComboBoxDemoGroupCtrl',ComboBoxDemoGroupCtrl);
