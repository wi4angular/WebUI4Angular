var TreeDemoRendererCtrl = ['$scope',function($scope) {
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
    vm.simpleData = simpleData;
    vm.mytree={};
    // 增
    $scope.$on('addNode', function (event,data) {
        var id = Math.round(Math.random()*Math.pow(10,5));
        var nodes = [
            {id:id,text:'node'+id,pid:data['id']}
        ];
        vm.mytree.append(nodes,data);
    });
    // 删
    $scope.$on('delNode', function (event,data) {
        vm.mytree.remove(data)
    });
    // 改
    $scope.$on('updateNode', function (event,data) {
        data['text'] += '@#$';
    })
}];
angular.module('ui.wisoft').controller('TreeDemoRendererCtrl',TreeDemoRendererCtrl);