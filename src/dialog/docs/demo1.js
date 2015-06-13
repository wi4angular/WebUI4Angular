var dialogCtrl1=['$scope','wiDialog',function($scope,wiDialog) {

    $scope.dialogData={"username":"中科惠软","address":"长江路科技园五区三楼"};

    //使用字符串作为模板
    $scope.openByStringTpl = function () {
        wiDialog.open({
            plain:true,
            template:'<div style="color: red;height: 60px;padding: 10px;">使用字符串模板</div>',
            title:'字符串模板',
            width:280
        });
    };

    var scriptDialog;
    //使用script作为模板
    $scope.openByScriptTpl = function () {
        scriptDialog=wiDialog.open({
            template: 'firstDialogId',
            title:'script作为模板',
            scope: $scope,
            width:380
        });
    };
    $scope.closeScriptDialog=function(){
        scriptDialog.close();
    }


    //使用url作为模板，该url必须是一个html片段
    $scope.openDefaultByUrl = function () {
        wiDialog.open({
            template: 'demo/dialog/docs/template.html',
            closeByEscape:false,
            title:'url作为模板',
            scope: $scope,
            width:680//height是自适应的，不需要指定
        });
    };
}];
angular.module('ui.wisoft').controller('dialogCtrl1',dialogCtrl1);