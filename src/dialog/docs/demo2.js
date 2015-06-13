var dialogCtrl2=['$scope','$rootScope','wiDialog',function($scope,$rootScope,wiDialog) {
    $scope.openNotify = function () {
        var dialog = wiDialog.open({
            template: '<p style="padding: 10px"> 使用dialog.closePromise.then(fn)来监听窗口关闭 </p><br>' +
                '<div style="float: right"><button type="button" ng-click="closeThisDialog(1)">关闭</button></div>',
            plain: true,
            width:300,
            height:170,
            title:'使用promise监听窗口关闭'
        });
        dialog.closePromise.then(function (data) {
            console.log('wiDialog closed' + (data.value === 1 ? ' using the button' : '') + ' and notified by promise: ' + data.id);
        });
    };
    $scope.openDialog = function () {
        var dialog = wiDialog.open({
            template: '<p style="padding: 10px"> 使用$rootScope来监听窗口打开和关闭 </p><br>',
            plain: true,
            width:300,
            height:170,
            title:'使用$rootScope监听窗口关闭'
        });
    };
    $rootScope.$on('wiDialog.opened', function (e, $dialog) {
        console.log('打开了一个dialog窗口，ID为: ' + $dialog.attr('id'));
    });

    $rootScope.$on('wiDialog.closed', function (e, $dialog) {
        console.log('关闭了一个dialog窗口，ID为: ' + $dialog.attr('id'));
    });
}];
angular.module('ui.wisoft').controller('dialogCtrl2',dialogCtrl2);
