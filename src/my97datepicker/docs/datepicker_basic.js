var DatepickerDemoBasicCtrl = ['$scope',function($scope) {

    var vm = $scope;

    function pad(num, n) {
        return (new Array(n >(''+num).length ? (n - (''+num).length+1) : 0).join('0') + num);
    }

    vm.date = '20'+pad(parseInt(Math.random()*14+1),2)+'-'+pad(parseInt(Math.random()*10+1),2)+'-'+pad(parseInt(Math.random()*28+1),2);

    vm.onPickedHandler = function (data) {
        alert(data)
    };

    vm.onClearedHandler = function (data) {
        alert("日期被清空")
    }

}];
angular.module('ui.wisoft').controller('DatepickerDemoBasicCtrl',DatepickerDemoBasicCtrl);