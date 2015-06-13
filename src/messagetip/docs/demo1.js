var messagetipMainCtrl1 = ['$scope', 'wiMessageTip', function($scope, wiMessageTip) {
    var t = '我的新消息<br>我的新消息<br>';

    $scope.openbottom = function() {
        t = '我的新消息<br>'+t;
        wiMessageTip.open({
            width: 250,
            title: '从下往上弹出',
            position: 'bottom',
            content: t
        });
    };

    $scope.openright = function() {
        t = '我的新消息<br>'+t;
        wiMessageTip.open({
            width: 250,
            title: '从右往左弹出',
            position: 'right',
            content: t
        });
    };

    $scope.openclose = function() {
        t = '我的新消息<br>'+t;
        wiMessageTip.open({
            width: 250,
            title: '5秒后自动关闭',
            position: 'bottom',
            delay: 5,
            content: t
        });
    };

    $scope.openshake = function() {
        t = '我的新消息<br>'+t;
        wiMessageTip.open({
            width: 250,
            title: '弹出后抖动',
            position: 'right',
            isshake: true,
            content: t
        });
    };
}];
angular.module('ui.wisoft').controller('messagetipMainCtrl1',messagetipMainCtrl1);