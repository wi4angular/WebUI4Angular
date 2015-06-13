var TreeDemoMultiSelectCtrl = [function() {
    var vm = this;

    vm.mytree = {};

    vm.simpleData = [
        {id:'2',name:'node2',parentid:'root'},
        {id:'1',name:'node1',parentid:'root'},
        {id:'3',name:'node3',parentid:'root'},
        {id:'4',name:'node4',parentid:'root'},
        {id:'13',name:'node13',parentid:'1'},
        {id:'12',name:'node12',parentid:'1'},
        {id:'11',name:'node11',parentid:'1'},
        {id:'21',name:'node21',parentid:'2'},
        {id:'22',name:'node22',parentid:'2'},
        {id:'23',name:'node23',parentid:'2'},
        {id:'31',name:'node31',parentid:'3'},
        {id:'32',name:'node32',parentid:'3'},
        {id:'33',name:'node33',parentid:'3'},
        {id:'111',name:'node111',parentid:'11'},
        {id:'113',name:'node113',parentid:'11'},
        {id:'112',name:'node112',parentid:'11'}
    ];

    vm.getSelecedNodes = function () {
        var arr = vm.mytree.selectedItem();
        var result = [];
        angular.forEach(arr, function(item) {
            result.push(item.name);
        });
        vm.selecedNodes = result;
    }
}];
angular.module('ui.wisoft').controller('TreeDemoMultiSelectCtrl',TreeDemoMultiSelectCtrl);