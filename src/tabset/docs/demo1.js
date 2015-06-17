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
    $scope.selectFun = function(data){// 标签页选中时的回调函数 - 参数: tab 的 data{wiid,src,icon,heading}
        console.log('select:', data.wiid);
    };
    $scope.beforeCloseFun = function(data){// 删除标签前的回调函数，若返回 false，中止删除 - 参数: tab 的 data{wiid,src,icon,heading}
        var res=confirm('确定要删除 wiid='+data.wiid+',heading='+data.heading+' 的标签页吗？');
        if(res!=true) return false;
    };
    $scope.closeFun = function(data){// 关闭标签页的回调函数 - 参数: tab 的 data{wiid,src,icon,heading}
        for(var i=0; i<$scope.items.length; i++){
            var item = $scope.items[i];
            if(data.wiid && data.wiid==item.wiid || data.heading && data.heading==item.title){
                $scope.items.splice(i, 1);
                break;
            }
        }
    };
}];
angular.module('ui.wisoft').controller('tabsetMainCtrl1',tabsetMainCtrl1);