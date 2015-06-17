var TreeDemoCustomCtrl = [function() {
    var vm = this;
    var simpleData = [
        {id:'2',name:'node2',pid:'root',cls:'specIcon'},
        {id:'1',name:'node1',pid:'root'},
        {id:'3',name:'node3',pid:'root'},
        {id:'4',name:'node4',pid:'root'},
        {id:'13',name:'node13',pid:'1'},
        {id:'12',name:'node12',pid:'1'},
        {id:'11',name:'node11',pid:'1'},
        {id:'21',name:'node21',pid:'2'},
        {id:'22',name:'node22',pid:'2'},
        {id:'23',name:'node23',pid:'2'},
        {id:'31',name:'node31',pid:'3'},
        {id:'32',name:'node32',pid:'3'},
        {id:'33',name:'node33',pid:'3'},
        {id:'111',name:'node111',pid:'11'},
        {id:'113',name:'node113',pid:'11'},
        {id:'112',name:'node112',pid:'11'}
    ];
    vm.simpleData = simpleData;
}];
angular.module('ui.wisoft').controller('TreeDemoCustomCtrl',TreeDemoCustomCtrl);