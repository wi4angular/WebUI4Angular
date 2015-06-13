var tabsetMainCtrl1 = ['$scope',function($scope) {
    $scope.items = [
        { id:'d1', title:"原始标签 0", content:"标签内容 0", icon:"misc/icon/redflag16.png",src:'misc/temp/tabset_test.html', active: true},
        { id:'d2', title:"原始标签 1", content:"标签内容 1", active: false},
        { id:'d3', title:"原始标签 2", content:"标签内容 2", active: false}
    ];
    var i = 0;
    $scope.addTabAndOpen = function() {
        $scope.items.push({ id:'dtab'+i,title:"动态标签 "+ i, content:"动态标签内容 "+ i++, active:true});
    };
    $scope.selectTab = function(){
        $scope.items[0].active = true;
    };
    $scope.closeFun = function(id){// 关闭标签页的回调函数 - 参数: tab 的 wiid
        for(var i=0; i<$scope.items.length; i++){
            var item = $scope.items[i];
            if(item.id == id){
                $scope.items.splice(i, 1);
                break;
            }
        }
    };
    $scope.selectFun = function(data){// 标签页选中时的回调函数 - 参数: tab 的 scope
        console.log('select:', data.wiid);
    };
    $scope.deselectFun = function(data){// 标签页取消选中的回调函数 - 参数: tab 的 scope
        console.log('deselect:', data.wiid);
    };
}];
angular.module('ui.wisoft').controller('tabsetMainCtrl1',tabsetMainCtrl1);