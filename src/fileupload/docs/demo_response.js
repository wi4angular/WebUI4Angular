var FileUploadDemoCtrl = ['$scope', function($scope) {
    $scope.responseText = undefined;
    $scope.$watch('responseText', function(newV, oldV){
        if(newV && newV != oldV){
            alert('返回的数据：' + newV);
            $scope.responseText = undefined;
        }
    });
}];
angular.module('ui.wisoft').controller('FileUploadDemoCtrl',FileUploadDemoCtrl);