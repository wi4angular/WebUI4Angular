var dialogCtrl5=['$scope','wiDialog',function($scope,wiDialog) {

    var scriptDialog;
    //使用script作为模板
    $scope.openByScriptTpl = function () {
        scriptDialog=wiDialog.open({
            template: 'dialog4close',
            title:'script作为模板',
            scope: $scope,
            width:480
        });
    };
    $scope.openConfirmDialog = function () {
        wiDialog.openConfirm({
            template: 'dialog4close',
            title:'script作为模板',
            scope: $scope,
            width:480
        });
    };
    $scope.closeScriptDialog=function(){
        //使用openConfirm打开窗口时无效
        scriptDialog.close();
    }
    $scope.closeAll=function(){
        wiDialog.closeAll();
    }
    $scope.closeOne=function(){
        wiDialog.closeOne(scriptDialog.id);
    }
}];
angular.module('ui.wisoft').controller('dialogCtrl5',dialogCtrl5);