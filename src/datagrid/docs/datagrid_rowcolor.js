var DataGridDemoRowcolorCtrl=['$scope',function ($scope) {

    $scope.dg={};

    function pad(num, n) {
        return (Array(n).join(0) + num).slice(-n);
    }

    var dgData=[];

    for(var i=0;i<50;i++){
        var obj={};
        obj.username='username'+i;
        obj.address='address'+i;
        obj.date='2014-07-'+pad((i+1),2);
        obj.num = (i+1)*100;

        dgData.push(obj);
    }

    $scope.dgData = dgData;

    //返回颜色值
    $scope.myRowColorFunction=function(data){
        if(data.username=='username2'){
            return "#6BA95B";
        }
    };
}]
angular.module('ui.wisoft').controller('DataGridDemoRowcolorCtrl',DataGridDemoRowcolorCtrl);