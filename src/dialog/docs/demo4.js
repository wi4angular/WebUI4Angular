var dialogCtrl4=['$scope','wiDialog',function($scope,wiDialog) {

    $scope.openDialogWithNoHead=function(){
        wiDialog.open({
            plain:true,
            template:'<div style="color: red;height: 60px;padding: 10px;padding-top: 30px">无header的弹出框</div>',
            width:200,
            height:200,
            withoutHead:true
        });
    }
    $scope.openNoModalDialog=function(){
        wiDialog.open({
            plain:true,
            template:'<div style="color:red;padding: 5px">非模态的弹出框</div>',
            width:300,
            height:200,
            overlay:false,
            title:'非模态的弹出框'
        });
    }
    $scope.openTimed = function () {
        var dialog = wiDialog.open({
            template: '<p> 1秒后自己关闭! </p>',
            plain: true,
            title:'提示',
            width:200,
            closeByDocument: false,
            closeByEscape: false
        });
        setTimeout(function () {
            dialog.close();
        }, 1000);
    };
}];
angular.module('ui.wisoft').controller('dialogCtrl4',dialogCtrl4);