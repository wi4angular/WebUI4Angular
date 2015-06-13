var TreeDemoLazyLoadCtrl = [function() {
    var vm = this;

    vm.mytree = {};

    vm.simpleData = [
        {id:'4',name:'node4',parentid:'root',isbranch:'true'}
    ];

    // 节点展开
    vm.itemOpenHandler = function (data, callback) {
        setTimeout(function () {
            var children;

            if(data['id'] === '4') {
                children = [
                    {id:'41',name:'node41',parentid:'4',isbranch:'true'},
                    {id:'42',name:'node42',parentid:'4'},
                    {id:'43',name:'node43',parentid:'4'},
                    {id:'44',name:'node44',parentid:'4'}
                ];
            } else {
                children = [
                    {id:'411',name:'node401',parentid:'41'},
                    {id:'412',name:'node402',parentid:'41'},
                    {id:'413',name:'node403',parentid:'41'},
                    {id:'414',name:'node404',parentid:'41'}
                ];
            }

            callback(data, children);
        },2000)
    }
}];
angular.module('ui.wisoft').controller('TreeDemoLazyLoadCtrl',TreeDemoLazyLoadCtrl);