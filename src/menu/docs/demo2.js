var  MenuDemoCtrl2 = [function() {
    var ctrl = this;
    ctrl.data = [
        {id: '0', label: 'node0'},
        {id: '1', label: 'node1'},
        {id: '2', label: 'node2', filterable:true, children: [
            {id: 'a', label: 'nodea'},
            {id: 'b', label: 'nodeb'},
            {id: 'c', label: 'nodec'},
            {id: 'd', label: 'menua'},
            {id: 'e', label: 'menub'},
            {id: 'f', label: 'menuc'}
        ]},
        {id: '3', label: 'node3'},
        {id: '4', label: 'node4'},
        {id: '5', label: 'node5'}
    ];
}];
angular.module('ui.wisoft').controller('MenuDemoCtrl2',MenuDemoCtrl2);