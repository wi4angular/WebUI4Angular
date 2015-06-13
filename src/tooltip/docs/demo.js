var tooltipCtrl = ['$scope', function($scope) {
    $scope.dynamicTooltip = '此处输入动态提示';
    $scope.htmlTooltip = '自定义<b style="color: #0000ff">HTML</b>提示!';
}];
angular.module('ui.wisoft').controller('tooltipCtrl',tooltipCtrl);