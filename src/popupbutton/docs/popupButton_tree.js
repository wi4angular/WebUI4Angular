var PopupButtonDemoTreeCtrl = ['$scope', function($scope) {

    var vm = this;

    vm.mytree = {};

    vm.simpleData = [
        {id:'1',name:'无锡市',parentid:'root'},
        {id:'11',name:'新区',parentid:'1'},
        {id:'111',name:'赵钱孙',parentid:'11',type:'person'},
        {id:'112',name:'孙李周',parentid:'11',type:'person'},
        {id:'113',name:'周吴郑',parentid:'11',type:'person'}
    ];

    vm.clickHandler = function () {
        vm.selectedItem = vm.mytree.selectedItem();
        vm.isopen=false;
    }

}];
angular.module('ui.wisoft').controller('PopupButtonDemoTreeCtrl',PopupButtonDemoTreeCtrl);