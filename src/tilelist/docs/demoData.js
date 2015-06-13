var tilelistDataCtrl = ['$scope', function($scope) {
    var i = 0;
    $scope.setData = function() {
        if((i++)%2 == 0){
            $scope.tilelistdata = [
                {color:'#1c8c84',name:'1'}
                ,{color:'#2c8c84',name:'2'}
                ,{color:'#3c8c84',name:'3'}
                ,{color:'#4c8c84',name:'4'}
                ,{color:'#5c8c84',name:'5'}
                ,{color:'#6c8c84',name:'6'}
                ,{color:'#7c8c84',name:'7'}
                ,{color:'#9c8c84',name:'8'}
                ,{color:'#ac8c84',name:'9'}
            ];
        }else{
            $scope.tilelistdata = [
                {color:'#1c1c84',name:'1'}
                ,{color:'#2c2c84',name:'2'}
                ,{color:'#3c3c84',name:'3'}
                ,{color:'#4c4c84',name:'4'}
                ,{color:'#5c5c84',name:'5'}
            ];
        }
    };
    $scope.setData();
    $scope.clearData = function() {
        $scope.tilelistdata = [];
    };
}];
angular.module('ui.wisoft').controller('tilelistDataCtrl',tilelistDataCtrl);