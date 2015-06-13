var imageviewMainCtrl1=['$scope',function($scope) {
    //第一张图片不存在
    $scope.images = ['misc/imageview/B11.jpg','misc/imageview/B2.jpg','misc/imageview/B3.jpg'];

    $scope.openview = function(index) {
        $scope.openindex = index;
    }
}];
angular.module('ui.wisoft').controller('imageviewMainCtrl1',imageviewMainCtrl1);