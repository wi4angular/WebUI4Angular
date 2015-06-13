var imageviewMainCtrl2=['$scope',function($scope) {
    $scope.open = function() {
        $scope.imagedata = getImageData();
    }

    //上一张回调
    $scope.previous = function() {
        v-=20;
        $scope.imagedata = getImageData();
    }

    //下一张回调
    $scope.next = function() {
        v+=20;
        $scope.imagedata = getImageData();
    }

    //生成测试用ImageData
    var c = document.createElement('canvas');
    var ctx=c.getContext("2d");
    var v = 1;
    function getImageData() {
        if (v > 255) {
            v = 1;
        } else if (v < 0) {
            v = 255;
        }

        var imgData=ctx.createImageData(400,300);
        for (var i=0;i<imgData.data.length;i+=4){
            imgData.data[i+0]=v;
            imgData.data[i+1]=v;
            imgData.data[i+2]=0;
            imgData.data[i+3]=255;
        }
        return imgData;
    }
}];
angular.module('ui.wisoft').controller('imageviewMainCtrl2',imageviewMainCtrl2);