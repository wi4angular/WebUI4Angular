var TransitionDemoCtrl = ['$scope','$transition', function($scope, $transition) {
    function transitionDone(){
        console.log('变换完成');
    }
    $scope.toggleStyle = function(e){
        var elem = (angular.element(e.target)).parent(),
            change = {'width': '300px'};
        $transition(elem, change).then(transitionDone, transitionDone);//transition （成功，失败）时执行回调函数，返回新的 promise 对象
    };
    $scope.toggleClass = function(e){
        var elem = (angular.element(e.target)).parent(),
            change = 'opened';
        $transition(elem, change).then(transitionDone, transitionDone);
    };
    $scope.toggleFun = function(e){
        var elem = (angular.element(e.target)).parent();
        var change = function(){
            elem.addClass('opened');
        };
        $transition(elem, change).then(transitionDone, transitionDone);
    };
}];
angular.module('ui.wisoft').controller('TransitionDemoCtrl',TransitionDemoCtrl);