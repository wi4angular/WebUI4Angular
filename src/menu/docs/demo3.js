var MenuDemoCtrl3 = ['$scope', function($scope) {
    $scope.vm = {
        selectFn: function(f){
            console.log(f);
        }
    };
    var ctrl = this;
    ctrl.data = [
        {id: '0', label: '简单 js 表达式', icon: 'misc/tempimg/menu/save.gif', event: 'alert(\'js表达式\')'},
        {id: '1', label: 'node1'},
        {id: '2', label: 'node2'},
        {id: '3', label: '禁用项', enabled: false}
    ];
}];
angular.module('ui.wisoft').controller('MenuDemoCtrl3',MenuDemoCtrl3);