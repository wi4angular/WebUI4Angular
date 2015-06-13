var alertCtrl2=['$scope','wiAlert',function ($scope,wiAlert){
    $scope.confirm=function(){
        wiAlert.confirm({
            title:'<span class="alertTitle">社区删除</span>',
            yesLabel:'确定删除',
            noLabel:'取消操作',
            width:500,
            content:'删除社区后对应的系统办件信息也将被删除，您确定要删除 <span class="alertContent"> 胡埭社区 </span> 吗？'
        }) .yes(function(){
                wiAlert.success("删除数据成功!");
             })
            .no(function(){
                wiAlert.info("您取消了本次操作!");
            })
    }
}];
angular.module('ui.wisoft').controller('alertCtrl2',alertCtrl2);