var dialogCtrl3=['$scope','wiDialog',function($scope,wiDialog) {

    $scope.dialogData={"username":"中科惠软","address":"长江路科技园五区三楼"};

    $scope.openByScriptTpl = function () {
        wiDialog.open({
            template: 'firstDialogId',
            title:'script作为模板',
            scope: $scope,
            width:380,
            height:300
        });
    };
    $scope.sayHello=function(){
        console.log("弹出的dialog窗口调用到了scope中的sayHello()方法........");
    }

    $scope.openConfirm = function () {
        wiDialog.openConfirm({
            template: 'modalDialogId',
            width:600,
            closeByEscape:true,
            title:'confirm窗口'
        }).then(function (value) {
            console.log('Modal promise resolved. Value: ', '姓名：'+value.username+'---住址：'+value.address);
        }, function (reason) {
            console.log('Modal promise rejected. Reason: ', reason);
        });
    };
}];
angular.module('ui.wisoft').controller('dialogCtrl3',dialogCtrl3);