var messagetipMainCtrl2 = ['$scope', 'wiMessageTip',function($scope, wiMessageTip) {
    var t = '我的新消息<br><input name="democlick" type="button" value="点击测试" ng-click="clickHandler()"></input><br>';
    var tipid;
    $scope.open = function() {
        tipid = wiMessageTip.open({
            width: 250,
            title: '新消息',
            position: 'bottom',
            content: t,
            click: $scope.clickHandler
        });
    };

    $scope.close = function() {
        wiMessageTip.closeOne(tipid);
    };

    $scope.clickHandler = function(e) {
        var elm = angular.element(e.target);
        if (elm.attr('name') == 'democlick') {
            alert('弹框中按钮点击');
        }
    }
}];
angular.module('ui.wisoft').controller('messagetipMainCtrl2',messagetipMainCtrl2);