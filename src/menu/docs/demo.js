var MenuDemoCtrl = ['$scope', function($scope) {
    var options = $scope.options = {
        pos0Arr: ['top', 'bottom', 'left', 'right'],
        pos1ArrX: ['left', 'right'],
        pos1ArrY: ['top', 'bottom'],
        pos0: 'bottom',
        pos1: 'left',
        isopen: false
    };
    options.pos1Arr = options.pos1ArrX;
    $scope.$watch('options.pos0',function(){
        if(options.pos0 == 'top' || options.pos0 == 'bottom'){
            options.pos1Arr = options.pos1ArrX;
            options.pos1 = 'left';
        }else{
            options.pos1Arr = options.pos1ArrY;
            options.pos1 = 'top';
        }
    });
    var ctrl = this;
    /**
     * id: string  菜单项 id
     * label: string  菜单项显示内容
     * icon: string  菜单项自定义图标
     * filterable: boolean  子菜单是否支持搜索
     * children: []  子菜单数据源
     * enabled: boolean  菜单项是否可用
     * event: string  可直接执行的表达式（复杂事件根据点击后返回的菜单项自定义）
     */
    ctrl.data = [
        {id: '0', label: 'node0'},
        {id: '1', label: 'node1'},
        {id: '2', label: 'node2'},
        {id: '3', label: 'node3'},
    ];
}];
angular.module('ui.wisoft').controller('MenuDemoCtrl',MenuDemoCtrl);