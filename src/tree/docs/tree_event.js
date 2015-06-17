var TreeDemoEventCtrl = [function() {
    var vm = this;
    var simpleData = [
        {id:'2',text:'node2',pid:'root'},
        {id:'1',text:'node1延迟',pid:'root',isbranch:true},
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
    vm.simpleData = simpleData;

    vm.itemClick = function (data) {
        vm.selectedItem = data.name;
    };
    // 节点展开前
    vm.beforeExpand = function (node) {
        console.log('展开前',node['name']);
    };
    // 节点展开
    vm.itemExpand = function (node) {
        console.log('展开',node['name']);
    };
    // 节点折叠前
    vm.beforeCollapse = function (node) {
        console.log('折叠前',node['name']);
        if(node['name']=='父节点') return false;
    };
    // 节点折叠
    vm.collapse = function (node) {
        console.log('折叠',node['name']);
    };
    // 节点选中前
    vm.beforeSelect = function (node) {
        console.log('选中前',node['name']);
        if(node['name']=='孙子节点一') return false;
    };
    // 节点选中
    vm.select = function (node) {
        console.log('选中',node['name']);
    };
    // 节点取消选中
    vm.cancelSelect = function (node) {
        console.log('取消选中',node['name']);
    };
    vm.loadBranch = function(data, success, error){
        setTimeout(function () {
            var pid=data['id']
                ,children = [
                    {id:pid+'1',text:pid+'1t',pid:pid},
                    {id:pid+'2',text:pid+'2延迟',pid:pid,isbranch:true},
                    {id:pid+'3',text:pid+'3t',pid:pid},
                    {id:pid+'4',text:pid+'4t',pid:pid}
                ];
            success(children);
        },2000);
    };
}];
angular.module('ui.wisoft').controller('TreeDemoEventCtrl',TreeDemoEventCtrl);