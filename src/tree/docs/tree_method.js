var TreeDemoMethodCtrl = [function() {
    var vm = this;
    var simpleData0 = [
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
    var simpleData1 = [
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
    vm.mytree={};
    vm.options=function(){
        console.log(vm.mytree.options());
    };
    vm.simpleData = simpleData0;
    var simpleData = simpleData0;
    vm.loadData=function(){
        simpleData = (simpleData == simpleData0) ?
            simpleData1:simpleData0;
        vm.mytree.loadData(simpleData, false);
    };
    vm.getNode=function(){
        console.log(vm.mytree.getNode('text','node1'));
    };
    vm.getNodes=function(){
        console.log(vm.mytree.getNodes('pid','root'));
    };
    vm.getSelected=function(){
        console.log(vm.mytree.getSelected());
    };
    vm.select=function(){
        vm.mytree.select(vm.mytree.getNode('text','node1'));
    };
    vm.collapseNode=function(){
        vm.mytree.collapseNode(vm.mytree.getNode('text','node1'));
    };
    vm.expandNode=function(){
        vm.mytree.expandNode(vm.mytree.getNode('text','node1'));
    };
    vm.append=function(){
        var id = Math.round(Math.random()*Math.pow(10,5));
        var nodes = [
            {id:id,text:'node'+id,pid:'root'}
        ];
        vm.mytree.append(nodes);
    };
    vm.remove=function(){
        vm.mytree.remove(vm.mytree.getNode('text','node1'));
    };
    vm.updateNode=function(){
        vm.mytree.updateNode(vm.mytree.getNode('text','node1')
            ,{text: '天安门',cls:'specIcon'});
    };
}];
angular.module('ui.wisoft').controller('TreeDemoMethodCtrl',TreeDemoMethodCtrl);