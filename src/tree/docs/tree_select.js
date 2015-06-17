var TreeDemoSelectCtrl = [function() {
    var vm = this;
    var simpleData = [
        {id:'2',text:'node2',pid:'root'},
        {id:'1',text:'node1',pid:'root'},
        {id:'3',text:'node3',pid:'root'},
        {id:'4',text:'node4',pid:'root'},
        {id:'13',text:'node13',pid:'1'},
        {id:'12',text:'node12',pid:'1'},
        {id:'11',text:'node11',pid:'1'},
        {id:'21',text:'node21',pid:'2'},
        {id:'22',text:'node22',pid:'2'},
        {id:'23',text:'node23',pid:'2'},
        {id:'31',text:'node31',pid:'3'},
        {id:'32',text:'node32',pid:'3'},
        {id:'33',text:'node33',pid:'3'},
        {id:'111',text:'node111',pid:'11'},
        {id:'113',text:'node113',pid:'11'},
        {id:'112',text:'node112',pid:'11'}
    ];
    var cascadeData = [
        {id:'2',text:'节点2',pid:'root'},
        {id:'1',text:'节点1',pid:'root'},
        {id:'3',text:'节点3',pid:'root'},
        {id:'4',text:'节点4',pid:'root'},
        {id:'13',text:'节点13',pid:'1'},
        {id:'12',text:'节点12',pid:'1'},
        {id:'11',text:'节点11',pid:'1'},
        {id:'21',text:'节点21',pid:'2'},
        {id:'22',text:'节点22',pid:'2'},
        {id:'23',text:'节点23',pid:'2'},
        {id:'31',text:'节点31',pid:'3'},
        {id:'32',text:'节点32',pid:'3'},
        {id:'33',text:'节点33',pid:'3'},
        {id:'111',text:'节点111',pid:'11'},
        {id:'113',text:'节点113',pid:'11'},
        {id:'112',text:'节点112',pid:'11'}
    ];
    vm.mul = true;
    vm.myFun=function(){
        vm.mul=!vm.mul;
    };
    vm.simpleData = simpleData;
    vm.cascadeData = cascadeData;
}];
angular.module('ui.wisoft').controller('TreeDemoSelectCtrl',TreeDemoSelectCtrl);